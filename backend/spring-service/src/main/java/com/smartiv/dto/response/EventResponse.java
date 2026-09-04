package com.smartiv.dto.response;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public class EventResponse {

    private Long id;
    private UUID eventUuid;
    private String bedCode;
    private String deviceCode;
    private String eventType;
    private Instant detectedAt;
    private Instant startTime;
    private Instant endTime;
    private Long durationMs;
    private String severity;
    private int evidenceScore;
    private String explanation;
    private Map<String, Object> triggeringFeatures;
    private String status;
    private String acknowledgedBy;
    private Instant acknowledgedAt;
    private String resolvedBy;
    private Instant resolvedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getEventUuid() { return eventUuid; }
    public void setEventUuid(UUID eventUuid) { this.eventUuid = eventUuid; }
    public String getBedCode() { return bedCode; }
    public void setBedCode(String bedCode) { this.bedCode = bedCode; }
    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public Instant getDetectedAt() { return detectedAt; }
    public void setDetectedAt(Instant detectedAt) { this.detectedAt = detectedAt; }
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public Long getDurationMs() { return durationMs; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public int getEvidenceScore() { return evidenceScore; }
    public void setEvidenceScore(int evidenceScore) { this.evidenceScore = evidenceScore; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public Map<String, Object> getTriggeringFeatures() { return triggeringFeatures; }
    public void setTriggeringFeatures(Map<String, Object> triggeringFeatures) { this.triggeringFeatures = triggeringFeatures; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}
