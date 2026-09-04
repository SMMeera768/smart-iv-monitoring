package com.smartiv.client;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Request DTO sent from Spring Boot to the Python AI service.
 * POST /ai/v1/analyze
 */
public class AiAnalysisRequest {

    private String bedId;
    private Instant timestamp;
    private Map<String, Double> features;

    public AiAnalysisRequest() {}

    public AiAnalysisRequest(String bedId, Instant timestamp, Map<String, Double> features) {
        this.bedId = bedId;
        this.timestamp = timestamp;
        this.features = features;
    }

    public String getBedId() { return bedId; }
    public void setBedId(String bedId) { this.bedId = bedId; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public Map<String, Double> getFeatures() { return features; }
    public void setFeatures(Map<String, Double> features) { this.features = features; }
}
