package com.smartiv.client;

import java.util.List;

/**
 * Response DTO from the Python AI service.
 *
 * anomalyScore: normalized anomaly index [0.0–1.0].
 *   This is a deterministic transformation of the Isolation Forest raw score.
 *   It is NOT a probability of sensor failure.
 *
 * driftScore: composite drift index [0.0–1.0] combining baseline deviation,
 *   persistence, and AI anomaly support.
 *
 * driftStatus / failureStatus: NORMAL | POSSIBLE_DRIFT | POSSIBLE_SENSOR_FAILURE
 */
public class AiAnalysisResponse {

    private String modelVersion;
    private Double anomalyScore;
    private Double driftScore;
    private String driftStatus;
    private String failureStatus;
    private List<String> supportingFeatures;
    private Long inferenceLatencyMs;

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public Double getAnomalyScore() { return anomalyScore; }
    public void setAnomalyScore(Double anomalyScore) { this.anomalyScore = anomalyScore; }
    public Double getDriftScore() { return driftScore; }
    public void setDriftScore(Double driftScore) { this.driftScore = driftScore; }
    public String getDriftStatus() { return driftStatus; }
    public void setDriftStatus(String driftStatus) { this.driftStatus = driftStatus; }
    public String getFailureStatus() { return failureStatus; }
    public void setFailureStatus(String failureStatus) { this.failureStatus = failureStatus; }
    public List<String> getSupportingFeatures() { return supportingFeatures; }
    public void setSupportingFeatures(List<String> supportingFeatures) { this.supportingFeatures = supportingFeatures; }
    public Long getInferenceLatencyMs() { return inferenceLatencyMs; }
    public void setInferenceLatencyMs(Long inferenceLatencyMs) { this.inferenceLatencyMs = inferenceLatencyMs; }
}
