package com.smartiv.dto.response;

import java.time.Instant;
import java.util.Map;

public class AnalyticsResponse {

    private Instant timestamp = Instant.now();
    private long totalEvents;
    private long normalFlowEvents;
    private long flowInterruptionEvents;
    private long lowVolumeEvents;
    private long bagReplacementEvents;
    private long sensorDriftEvents;
    private long sensorFailureEvents;
    private long totalAlerts;
    private long openAlerts;
    private long acknowledgedAlerts;
    private long resolvedAlerts;
    private double averageFlowRateGPerMin;
    private double averageEvidenceScore;
    private Map<String, Long> eventsByBed;
    private Map<String, Long> alertsBySeverity;

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }
    public long getNormalFlowEvents() { return normalFlowEvents; }
    public void setNormalFlowEvents(long normalFlowEvents) { this.normalFlowEvents = normalFlowEvents; }
    public long getFlowInterruptionEvents() { return flowInterruptionEvents; }
    public void setFlowInterruptionEvents(long flowInterruptionEvents) { this.flowInterruptionEvents = flowInterruptionEvents; }
    public long getLowVolumeEvents() { return lowVolumeEvents; }
    public void setLowVolumeEvents(long lowVolumeEvents) { this.lowVolumeEvents = lowVolumeEvents; }
    public long getBagReplacementEvents() { return bagReplacementEvents; }
    public void setBagReplacementEvents(long bagReplacementEvents) { this.bagReplacementEvents = bagReplacementEvents; }
    public long getSensorDriftEvents() { return sensorDriftEvents; }
    public void setSensorDriftEvents(long sensorDriftEvents) { this.sensorDriftEvents = sensorDriftEvents; }
    public long getSensorFailureEvents() { return sensorFailureEvents; }
    public void setSensorFailureEvents(long sensorFailureEvents) { this.sensorFailureEvents = sensorFailureEvents; }
    public long getTotalAlerts() { return totalAlerts; }
    public void setTotalAlerts(long totalAlerts) { this.totalAlerts = totalAlerts; }
    public long getOpenAlerts() { return openAlerts; }
    public void setOpenAlerts(long openAlerts) { this.openAlerts = openAlerts; }
    public long getAcknowledgedAlerts() { return acknowledgedAlerts; }
    public void setAcknowledgedAlerts(long acknowledgedAlerts) { this.acknowledgedAlerts = acknowledgedAlerts; }
    public long getResolvedAlerts() { return resolvedAlerts; }
    public void setResolvedAlerts(long resolvedAlerts) { this.resolvedAlerts = resolvedAlerts; }
    public double getAverageFlowRateGPerMin() { return averageFlowRateGPerMin; }
    public void setAverageFlowRateGPerMin(double averageFlowRateGPerMin) { this.averageFlowRateGPerMin = averageFlowRateGPerMin; }
    public double getAverageEvidenceScore() { return averageEvidenceScore; }
    public void setAverageEvidenceScore(double averageEvidenceScore) { this.averageEvidenceScore = averageEvidenceScore; }
    public Map<String, Long> getEventsByBed() { return eventsByBed; }
    public void setEventsByBed(Map<String, Long> eventsByBed) { this.eventsByBed = eventsByBed; }
    public Map<String, Long> getAlertsBySeverity() { return alertsBySeverity; }
    public void setAlertsBySeverity(Map<String, Long> alertsBySeverity) { this.alertsBySeverity = alertsBySeverity; }
}
