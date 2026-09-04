package com.smartiv.dto.response;

import java.time.Instant;

/**
 * Complete per-bed status for the dashboard.
 * All calculated fields originate in Spring Boot — the frontend only displays them.
 */
public class BedStatusResponse {

    private String bedId;
    private String bedCode;
    private String name;

    // --- ESP32-originated ---
    private Double currentWeight;
    private String deviceId;
    private String deviceStatus;
    private Instant lastUpdated;
    private boolean dataFresh;

    // --- Spring Boot calculated ---
    private Double filteredWeight;
    private Double flowRate;           // g/min instantaneous
    private Double smoothedFlowRate;   // g/min smoothed
    private Double percentRemaining;
    private Double baseline;
    private String currentEventType;
    private String currentEventStatus;
    private Integer evidenceScore;

    // --- AI-originated ---
    private Double anomalyScore;
    private Double driftScore;
    private String sensorStatus;       // NORMAL / POSSIBLE_DRIFT / POSSIBLE_SENSOR_FAILURE / AI_UNAVAILABLE

    public String getBedId() { return bedId; }
    public void setBedId(String bedId) { this.bedId = bedId; }
    public String getBedCode() { return bedCode; }
    public void setBedCode(String bedCode) { this.bedCode = bedCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getCurrentWeight() { return currentWeight; }
    public void setCurrentWeight(Double currentWeight) { this.currentWeight = currentWeight; }
    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public String getDeviceStatus() { return deviceStatus; }
    public void setDeviceStatus(String deviceStatus) { this.deviceStatus = deviceStatus; }
    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }
    public boolean isDataFresh() { return dataFresh; }
    public void setDataFresh(boolean dataFresh) { this.dataFresh = dataFresh; }
    public Double getFilteredWeight() { return filteredWeight; }
    public void setFilteredWeight(Double filteredWeight) { this.filteredWeight = filteredWeight; }
    public Double getFlowRate() { return flowRate; }
    public void setFlowRate(Double flowRate) { this.flowRate = flowRate; }
    public Double getSmoothedFlowRate() { return smoothedFlowRate; }
    public void setSmoothedFlowRate(Double smoothedFlowRate) { this.smoothedFlowRate = smoothedFlowRate; }
    public Double getPercentRemaining() { return percentRemaining; }
    public void setPercentRemaining(Double percentRemaining) { this.percentRemaining = percentRemaining; }
    public Double getBaseline() { return baseline; }
    public void setBaseline(Double baseline) { this.baseline = baseline; }
    public String getCurrentEventType() { return currentEventType; }
    public void setCurrentEventType(String currentEventType) { this.currentEventType = currentEventType; }
    public String getCurrentEventStatus() { return currentEventStatus; }
    public void setCurrentEventStatus(String currentEventStatus) { this.currentEventStatus = currentEventStatus; }
    public Integer getEvidenceScore() { return evidenceScore; }
    public void setEvidenceScore(Integer evidenceScore) { this.evidenceScore = evidenceScore; }
    public Double getAnomalyScore() { return anomalyScore; }
    public void setAnomalyScore(Double anomalyScore) { this.anomalyScore = anomalyScore; }
    public Double getDriftScore() { return driftScore; }
    public void setDriftScore(Double driftScore) { this.driftScore = driftScore; }
    public String getSensorStatus() { return sensorStatus; }
    public void setSensorStatus(String sensorStatus) { this.sensorStatus = sensorStatus; }
}
