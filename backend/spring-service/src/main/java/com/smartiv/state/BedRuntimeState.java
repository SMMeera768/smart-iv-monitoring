package com.smartiv.state;

import com.smartiv.entity.AiMetric;
import com.smartiv.entity.IvEvent;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;

/**
 * In-memory runtime state for one bed.
 * All access is synchronized on this instance to prevent Bed 1 / Bed 2 cross-contamination.
 * This state is NOT persisted — it is rebuilt from the rolling window on restart.
 */
public class BedRuntimeState {

    private final String bedCode;
    private final int maxWindowSize;

    // Rolling windows — raw and filtered weights with their server timestamps
    private final Deque<Double> rawWindow = new ArrayDeque<>();
    private final Deque<Double> filteredWindow = new ArrayDeque<>();
    private final Deque<Instant> timestampWindow = new ArrayDeque<>();

    private Double latestRawWeight;
    private Double latestFilteredWeight;
    private Double previousFilteredWeight;

    // Bag session
    private String currentBagSessionId;
    private Double initialBagWeight;       // weight at session start (after tare)
    private Double currentBaseline;        // slow-moving reference for drift detection

    // Flow
    private Double currentFlowRate;        // g/min instantaneous
    private Double currentSmoothedFlowRate;

    // Current event state (for debouncing)
    private IvEvent.EventType currentEventType;
    private Instant eventCandidateStartTime;  // when a candidate condition first appeared
    private Long currentOpenEventId;

    // AI
    private Double latestAnomalyScore;
    private Double latestDriftScore;
    private AiMetric.SensorStatus latestSensorStatus = AiMetric.SensorStatus.NORMAL;
    private Instant lastAiCallTime;

    // Device health
    private Instant lastCommunicationTime;
    private boolean deviceOnline = false;

    // Stuck-signal tracking
    private Double lastDistinctWeight;
    private Instant stuckSinceTime;

    public BedRuntimeState(String bedCode, int maxWindowSize) {
        this.bedCode = bedCode;
        this.maxWindowSize = maxWindowSize;
    }

    public synchronized void addReading(double rawWeight, double filteredWeight, Instant timestamp) {
        if (rawWindow.size() >= maxWindowSize) {
            rawWindow.pollFirst();
            filteredWindow.pollFirst();
            timestampWindow.pollFirst();
        }
        previousFilteredWeight = latestFilteredWeight;
        rawWindow.addLast(rawWeight);
        filteredWindow.addLast(filteredWeight);
        timestampWindow.addLast(timestamp);
        latestRawWeight = rawWeight;
        latestFilteredWeight = filteredWeight;
        lastCommunicationTime = timestamp;
        deviceOnline = true;
    }

    public synchronized double[] getRawWindowSnapshot() {
        return rawWindow.stream().mapToDouble(Double::doubleValue).toArray();
    }

    public synchronized double[] getFilteredWindowSnapshot() {
        return filteredWindow.stream().mapToDouble(Double::doubleValue).toArray();
    }

    public synchronized Instant[] getTimestampWindowSnapshot() {
        return timestampWindow.toArray(new Instant[0]);
    }

    public synchronized int getWindowSize() { return rawWindow.size(); }

    // Getters and setters — all synchronized
    public String getBedCode() { return bedCode; }

    public synchronized Double getLatestRawWeight() { return latestRawWeight; }
    public synchronized Double getLatestFilteredWeight() { return latestFilteredWeight; }
    public synchronized Double getPreviousFilteredWeight() { return previousFilteredWeight; }

    public synchronized String getCurrentBagSessionId() { return currentBagSessionId; }
    public synchronized void setCurrentBagSessionId(String id) { this.currentBagSessionId = id; }

    public synchronized Double getInitialBagWeight() { return initialBagWeight; }
    public synchronized void setInitialBagWeight(Double w) { this.initialBagWeight = w; }

    public synchronized Double getCurrentBaseline() { return currentBaseline; }
    public synchronized void setCurrentBaseline(Double b) { this.currentBaseline = b; }

    public synchronized Double getCurrentFlowRate() { return currentFlowRate; }
    public synchronized void setCurrentFlowRate(Double r) { this.currentFlowRate = r; }

    public synchronized Double getCurrentSmoothedFlowRate() { return currentSmoothedFlowRate; }
    public synchronized void setCurrentSmoothedFlowRate(Double r) { this.currentSmoothedFlowRate = r; }

    public synchronized IvEvent.EventType getCurrentEventType() { return currentEventType; }
    public synchronized void setCurrentEventType(IvEvent.EventType t) { this.currentEventType = t; }

    public synchronized Instant getEventCandidateStartTime() { return eventCandidateStartTime; }
    public synchronized void setEventCandidateStartTime(Instant t) { this.eventCandidateStartTime = t; }

    public synchronized Long getCurrentOpenEventId() { return currentOpenEventId; }
    public synchronized void setCurrentOpenEventId(Long id) { this.currentOpenEventId = id; }

    public synchronized Double getLatestAnomalyScore() { return latestAnomalyScore; }
    public synchronized void setLatestAnomalyScore(Double s) { this.latestAnomalyScore = s; }

    public synchronized Double getLatestDriftScore() { return latestDriftScore; }
    public synchronized void setLatestDriftScore(Double s) { this.latestDriftScore = s; }

    public synchronized AiMetric.SensorStatus getLatestSensorStatus() { return latestSensorStatus; }
    public synchronized void setLatestSensorStatus(AiMetric.SensorStatus s) { this.latestSensorStatus = s; }

    public synchronized Instant getLastAiCallTime() { return lastAiCallTime; }
    public synchronized void setLastAiCallTime(Instant t) { this.lastAiCallTime = t; }

    public synchronized Instant getLastCommunicationTime() { return lastCommunicationTime; }
    public synchronized boolean isDeviceOnline() { return deviceOnline; }
    public synchronized void setDeviceOnline(boolean online) { this.deviceOnline = online; }

    public synchronized Double getLastDistinctWeight() { return lastDistinctWeight; }
    public synchronized void setLastDistinctWeight(Double w) { this.lastDistinctWeight = w; }

    public synchronized Instant getStuckSinceTime() { return stuckSinceTime; }
    public synchronized void setStuckSinceTime(Instant t) { this.stuckSinceTime = t; }
}
