package com.smartiv.service.ingestion;

import com.smartiv.client.AiAnalysisResponse;
import com.smartiv.client.AiServiceClient;
import com.smartiv.config.SmartIvProperties;
import com.smartiv.dto.request.DeviceDataRequest;
import com.smartiv.engine.RuleContext;
import com.smartiv.engine.RuleEngine;
import com.smartiv.engine.RuleResult;
import com.smartiv.entity.*;
import com.smartiv.repository.*;
import com.smartiv.service.alert.AlertService;
import com.smartiv.service.evidence.EvidenceScoreService;
import com.smartiv.service.feature.FeatureExtractionService;
import com.smartiv.service.feature.FeatureExtractionService.ExtractedFeatures;
import com.smartiv.service.flow.FlowRateService;
import com.smartiv.service.processing.SignalFilterService;
import com.smartiv.state.BedRuntimeState;
import com.smartiv.state.BedStateManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

/**
 * Central ingestion pipeline.
 *
 * For every valid sensor reading:
 *   receive → validate → calibrate → store raw → filter → features →
 *   flow → baseline → rules → AI → evidence → event → alert → state update
 *
 * Scientific calculations live here and in dedicated services.
 * Controllers only delegate to this service.
 */
@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final BedRepository bedRepository;
    private final DeviceRepository deviceRepository;
    private final SensorReadingRepository readingRepository;
    private final AiMetricRepository aiMetricRepository;
    private final BedStateManager stateManager;
    private final SignalFilterService filterService;
    private final FeatureExtractionService featureService;
    private final FlowRateService flowService;
    private final RuleEngine ruleEngine;
    private final EvidenceScoreService evidenceService;
    private final AlertService alertService;
    private final AiServiceClient aiClient;
    private final SmartIvProperties props;

    public IngestionService(BedRepository bedRepository,
                             DeviceRepository deviceRepository,
                             SensorReadingRepository readingRepository,
                             AiMetricRepository aiMetricRepository,
                             BedStateManager stateManager,
                             SignalFilterService filterService,
                             FeatureExtractionService featureService,
                             FlowRateService flowService,
                             RuleEngine ruleEngine,
                             EvidenceScoreService evidenceService,
                             AlertService alertService,
                             AiServiceClient aiClient,
                             SmartIvProperties props) {
        this.bedRepository = bedRepository;
        this.deviceRepository = deviceRepository;
        this.readingRepository = readingRepository;
        this.aiMetricRepository = aiMetricRepository;
        this.stateManager = stateManager;
        this.filterService = filterService;
        this.featureService = featureService;
        this.flowService = flowService;
        this.ruleEngine = ruleEngine;
        this.evidenceService = evidenceService;
        this.alertService = alertService;
        this.aiClient = aiClient;
        this.props = props;
    }

    @Transactional
    public void processPacket(DeviceDataRequest packet) {
        Device device = deviceRepository.findByDeviceCode(packet.getDeviceId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unknown device: " + packet.getDeviceId()));

        for (DeviceDataRequest.ChannelReading cr : packet.getReadings()) {
            try {
                processChannelReading(device, cr, packet.getTimestamp());
            } catch (Exception e) {
                log.error("Failed to process channel reading for bed {} on device {}: {}",
                        cr.getBedId(), packet.getDeviceId(), e.getMessage(), e);
            }
        }
    }

    private void processChannelReading(Device device,
                                        DeviceDataRequest.ChannelReading cr,
                                        Instant deviceTimestamp) {
        Bed bed = bedRepository.findByBedCode(cr.getBedId())
                .orElseThrow(() -> new IllegalArgumentException("Unknown bed: " + cr.getBedId()));

        Instant serverTimestamp = Instant.now();

        // 1. Validate weight value
        double rawWeight = cr.getWeight();
        if (!Double.isFinite(rawWeight) || rawWeight < 0 || rawWeight > 5000) {
            log.warn("Invalid weight {} for bed {} — skipping", rawWeight, cr.getBedId());
            storeInvalidReading(bed, device, cr, serverTimestamp, "Weight out of valid range");
            return;
        }

        // 2. Store raw reading (never overwritten)
        SensorReading reading = storeRawReading(bed, device, cr, serverTimestamp, deviceTimestamp);

        // 3. Get per-bed state (isolated per bed)
        BedRuntimeState state = stateManager.getState(bed.getBedCode());

        // 4. Apply moving-average filter
        state.addReading(rawWeight, rawWeight, serverTimestamp); // pre-filter add for window
        double[] rawWindow = state.getRawWindowSnapshot();
        SignalFilterService.FilterResult filterResult = filterService.compute(rawWindow);
        double filteredWeight = filterResult.getFilteredWeight();

        // Update state with filtered value
        state.setCurrentFlowRate(null); // will be recalculated

        // 5. Extract features
        Instant[] timestamps = state.getTimestampWindowSnapshot();
        ExtractedFeatures features = featureService.extract(
                rawWindow,
                state.getFilteredWindowSnapshot(),
                timestamps,
                state.getCurrentBaseline()
        );

        if (!features.isSufficient()) {
            log.debug("Insufficient window for bed {} — skipping rule evaluation", bed.getBedCode());
            return;
        }

        // 6. Compute flow rates
        double[] filteredWindow = state.getFilteredWindowSnapshot();
        double instantFlow = 0.0;
        if (filteredWindow.length >= 2) {
            instantFlow = flowService.computeInstantaneous(
                    filteredWindow[filteredWindow.length - 2],
                    filteredWindow[filteredWindow.length - 1],
                    timestamps[timestamps.length - 2],
                    timestamps[timestamps.length - 1]
            );
        }
        double smoothedFlow = flowService.computeSmoothed(filteredWindow, timestamps);
        state.setCurrentFlowRate(instantFlow);
        state.setCurrentSmoothedFlowRate(smoothedFlow);

        // 7. Percent remaining
        Double percentRemaining = flowService.computePercentRemaining(
                filteredWeight, state.getInitialBagWeight(), 0.0);

        // 8. Update baseline (slow exponential moving average during stable periods)
        updateBaseline(state, filteredWeight);

        // 9. Compute stuck-signal duration
        double stuckDurationSeconds = computeStuckDuration(state, rawWeight, serverTimestamp);

        // 10. Call AI service (non-blocking fallback on failure)
        AiAnalysisResponse aiResponse = aiClient.analyze(bed.getBedCode(), features, stuckDurationSeconds);
        AiMetric.SensorStatus sensorStatus = resolveSensorStatus(aiResponse);
        state.setLatestAnomalyScore(aiResponse.getAnomalyScore());
        state.setLatestDriftScore(aiResponse.getDriftScore());
        state.setLatestSensorStatus(sensorStatus);
        state.setLastAiCallTime(serverTimestamp);

        // Persist AI metric
        persistAiMetric(bed, aiResponse, sensorStatus, serverTimestamp);

        // 11. Build rule context
        RuleContext ctx = new RuleContext(
                bed.getBedCode(), serverTimestamp,
                filteredWeight, features.getWeightChange(), features.getWeightSlope(),
                instantFlow, smoothedFlow,
                features.getStandardDeviation(), features.getRollingVariance(), features.getSignalNoise(),
                percentRemaining, features.getBaselineDeviation(),
                sensorStatus, aiResponse.getAnomalyScore(),
                state.getEventCandidateStartTime()
        );

        // 12. Run rule engine
        RuleResult ruleResult = ruleEngine.evaluate(ctx);

        // 13. Update candidate start time for persistence tracking
        updateCandidateTracking(state, ruleResult, serverTimestamp);

        // 14. Compute evidence score
        EvidenceScoreService.EvidenceResult evidence = evidenceService.compute(
                ruleResult.getDeterminedEventType(), ctx, ruleResult.isCandidateConfirmed());

        // 15. Handle event lifecycle (debounced — no new event every cycle)
        alertService.handleEventCycle(bed, device, ruleResult, evidence, ctx, state);
    }

    private void updateBaseline(BedRuntimeState state, double filteredWeight) {
        Double current = state.getCurrentBaseline();
        if (current == null) {
            state.setCurrentBaseline(filteredWeight);
        } else {
            // Slow exponential moving average: alpha = 2 / (baselineWindow + 1)
            double alpha = 2.0 / (props.getSignal().getBaselineWindow() + 1.0);
            state.setCurrentBaseline(alpha * filteredWeight + (1.0 - alpha) * current);
        }
    }

    private double computeStuckDuration(BedRuntimeState state, double rawWeight, Instant now) {
        double tolerance = 0.05; // grams — configurable in future
        Double lastDistinct = state.getLastDistinctWeight();
        if (lastDistinct == null || Math.abs(rawWeight - lastDistinct) > tolerance) {
            state.setLastDistinctWeight(rawWeight);
            state.setStuckSinceTime(null);
            return 0.0;
        }
        if (state.getStuckSinceTime() == null) {
            state.setStuckSinceTime(now);
            return 0.0;
        }
        return Duration.between(state.getStuckSinceTime(), now).toSeconds();
    }

    private void updateCandidateTracking(BedRuntimeState state, RuleResult result, Instant now) {
        IvEvent.EventType current = state.getCurrentEventType();
        IvEvent.EventType determined = result.getDeterminedEventType();

        if (determined != current) {
            // Event type changed — reset candidate timer
            state.setEventCandidateStartTime(now);
            state.setCurrentEventType(determined);
        }
        // If same type, candidate start time remains — persistence accumulates
    }

    private AiMetric.SensorStatus resolveSensorStatus(AiAnalysisResponse r) {
        if (r.getFailureStatus() == null) return AiMetric.SensorStatus.AI_UNAVAILABLE;
        try {
            return AiMetric.SensorStatus.valueOf(r.getFailureStatus());
        } catch (IllegalArgumentException e) {
            return AiMetric.SensorStatus.AI_UNAVAILABLE;
        }
    }

    private void persistAiMetric(Bed bed, AiAnalysisResponse r,
                                   AiMetric.SensorStatus sensorStatus, Instant timestamp) {
        AiMetric metric = new AiMetric();
        metric.setBed(bed);
        metric.setTimestamp(timestamp);
        metric.setModelVersion(r.getModelVersion());
        metric.setAnomalyScore(r.getAnomalyScore());
        metric.setDriftScore(r.getDriftScore());
        metric.setFailureStatus(sensorStatus);
        if (r.getDriftStatus() != null) {
            try {
                metric.setDriftStatus(AiMetric.SensorStatus.valueOf(r.getDriftStatus()));
            } catch (IllegalArgumentException ignored) {}
        }
        metric.setSupportingFeatures(r.getSupportingFeatures());
        if (r.getInferenceLatencyMs() != null) {
            metric.setInferenceLatencyMs(r.getInferenceLatencyMs().intValue());
        }
        aiMetricRepository.save(metric);
    }

    private SensorReading storeRawReading(Bed bed, Device device,
                                           DeviceDataRequest.ChannelReading cr,
                                           Instant serverTs, Instant deviceTs) {
        SensorReading r = new SensorReading();
        r.setBed(bed);
        r.setDevice(device);
        r.setChannelId(cr.getChannelId());
        r.setSequenceNumber(cr.getSequenceNumber());
        r.setRawWeight(cr.getWeight());
        r.setRawAdcValue(cr.getRawAdc());
        r.setTimestampDevice(deviceTs);
        r.setTimestampServer(serverTs);
        r.setPacketStatus(SensorReading.PacketStatus.RECEIVED);
        r.setValid(true);
        return readingRepository.save(r);
    }

    private void storeInvalidReading(Bed bed, Device device,
                                      DeviceDataRequest.ChannelReading cr,
                                      Instant serverTs, String reason) {
        SensorReading r = new SensorReading();
        r.setBed(bed);
        r.setDevice(device);
        r.setChannelId(cr.getChannelId());
        r.setRawWeight(cr.getWeight() != null ? cr.getWeight() : 0.0);
        r.setTimestampServer(serverTs);
        r.setPacketStatus(SensorReading.PacketStatus.INVALID);
        r.setValid(false);
        r.setValidationMessage(reason);
        readingRepository.save(r);
    }
}
