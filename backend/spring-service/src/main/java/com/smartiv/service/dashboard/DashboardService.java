package com.smartiv.service.dashboard;

import com.smartiv.config.SmartIvProperties;
import com.smartiv.dto.response.BedStatusResponse;
import com.smartiv.dto.response.DashboardSummaryResponse;
import com.smartiv.entity.Alert;
import com.smartiv.entity.Bed;
import com.smartiv.entity.Device;
import com.smartiv.entity.IvEvent;
import com.smartiv.repository.AlertRepository;
import com.smartiv.repository.BedRepository;
import com.smartiv.repository.DeviceRepository;
import com.smartiv.repository.SensorReadingRepository;
import com.smartiv.state.BedRuntimeState;
import com.smartiv.state.BedStateManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Assembles frontend-ready dashboard responses.
 * All scientific values originate in the processing pipeline — this service only reads state.
 */
@Service
public class DashboardService {

    private final BedRepository bedRepository;
    private final DeviceRepository deviceRepository;
    private final AlertRepository alertRepository;
    private final SensorReadingRepository readingRepository;
    private final BedStateManager stateManager;
    private final SmartIvProperties props;

    public DashboardService(BedRepository bedRepository,
                             DeviceRepository deviceRepository,
                             AlertRepository alertRepository,
                             SensorReadingRepository readingRepository,
                             BedStateManager stateManager,
                             SmartIvProperties props) {
        this.bedRepository = bedRepository;
        this.deviceRepository = deviceRepository;
        this.alertRepository = alertRepository;
        this.readingRepository = readingRepository;
        this.stateManager = stateManager;
        this.props = props;
    }

    public DashboardSummaryResponse getSummary() {
        List<Bed> beds = bedRepository.findAll();
        List<BedStatusResponse> bedStatuses = beds.stream()
                .map(this::buildBedStatus)
                .collect(Collectors.toList());

        long activeAlerts = alertRepository.countByStatusNot(Alert.AlertStatus.RESOLVED);
        long devicesOnline = deviceRepository.countByDeviceStatus(Device.DeviceStatus.ONLINE);
        long normalBeds = bedStatuses.stream()
                .filter(b -> "NORMAL_FLOW".equals(b.getCurrentEventType()) || b.getCurrentEventType() == null)
                .count();

        String systemStatus = activeAlerts > 0 ? "ALERT" : "ONLINE";

        DashboardSummaryResponse summary = new DashboardSummaryResponse();
        summary.setSystemStatus(systemStatus);
        summary.setTotalBeds(beds.size());
        summary.setNormalBeds((int) normalBeds);
        summary.setActiveAlerts((int) activeAlerts);
        summary.setPhysicalDevicesOnline((int) devicesOnline);
        summary.setBeds(bedStatuses);
        summary.setTimestamp(Instant.now());
        return summary;
    }

    public BedStatusResponse getBedStatus(String bedCode) {
        Bed bed = bedRepository.findByBedCode(bedCode)
                .orElseThrow(() -> new IllegalArgumentException("Unknown bed: " + bedCode));
        return buildBedStatus(bed);
    }

    public List<ReadingPoint> getBedReadings(String bedCode, Instant from, Instant to, int limit) {
        Bed bed = bedRepository.findByBedCode(bedCode)
                .orElseThrow(() -> new IllegalArgumentException("Unknown bed: " + bedCode));

        return readingRepository
                .findByBed_IdAndTimestampServerBetweenOrderByTimestampServerAsc(
                        bed.getId(), from, to, PageRequest.of(0, Math.min(limit, 1000)))
                .stream()
                .map(r -> new ReadingPoint(
                        r.getTimestampServer(),
                        r.getRawWeight(),
                        null, // filtered weight not stored on raw reading entity
                        null,
                        null
                ))
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private BedStatusResponse buildBedStatus(Bed bed) {
        BedRuntimeState state = stateManager.getState(bed.getBedCode());
        BedStatusResponse r = new BedStatusResponse();

        r.setBedId(bed.getId().toString());
        r.setBedCode(bed.getBedCode());
        r.setName(bed.getName());

        r.setCurrentWeight(state.getLatestRawWeight());
        r.setFilteredWeight(state.getLatestFilteredWeight());
        r.setFlowRate(state.getCurrentFlowRate());
        r.setSmoothedFlowRate(state.getCurrentSmoothedFlowRate());
        r.setBaseline(state.getCurrentBaseline());

        r.setAnomalyScore(state.getLatestAnomalyScore());
        r.setDriftScore(state.getLatestDriftScore());
        r.setSensorStatus(state.getLatestSensorStatus() != null
                ? state.getLatestSensorStatus().name() : "AI_UNAVAILABLE");

        // Device info
        Device device = bed.getCurrentDevice();
        if (device != null) {
            r.setDeviceId(device.getDeviceCode());
            r.setDeviceStatus(device.getDeviceStatus().name());
        }

        // Data freshness
        Instant lastUpdate = state.getLastCommunicationTime();
        r.setLastUpdated(lastUpdate);
        boolean fresh = lastUpdate != null &&
                Duration.between(lastUpdate, Instant.now()).toMillis()
                        < props.getDevice().getOfflineTimeoutMs();
        r.setDataFresh(fresh);

        // Current event
        IvEvent.EventType eventType = state.getCurrentEventType();
        r.setCurrentEventType(eventType != null ? eventType.name() : null);

        return r;
    }

    // -------------------------------------------------------------------------
    // Reading point DTO (inner class — no separate file needed)
    // -------------------------------------------------------------------------
    public record ReadingPoint(Instant timestamp, Double rawWeight,
                                Double filteredWeight, Double flowRate, Double baseline) {}
}
