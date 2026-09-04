package com.smartiv.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "ai_metrics")
public class AiMetric {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    @Column(name = "model_version", length = 100)
    private String modelVersion;

    /**
     * Normalized anomaly index (0–1). NOT a probability of sensor failure.
     * Derived from Isolation Forest raw score via documented transformation.
     */
    @Column(name = "anomaly_score")
    private Double anomalyScore;

    /** Composite drift score (0–1). Weights documented in ai-model.md. */
    @Column(name = "drift_score")
    private Double driftScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "drift_status", length = 50)
    private SensorStatus driftStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "failure_status", length = 50)
    private SensorStatus failureStatus;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "supporting_features", columnDefinition = "jsonb")
    private List<String> supportingFeatures;

    @Column(name = "inference_latency_ms")
    private Integer inferenceLatencyMs;

    public enum SensorStatus { NORMAL, POSSIBLE_DRIFT, POSSIBLE_SENSOR_FAILURE, AI_UNAVAILABLE }

    public Long getId() { return id; }
    public Bed getBed() { return bed; }
    public void setBed(Bed bed) { this.bed = bed; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public Double getAnomalyScore() { return anomalyScore; }
    public void setAnomalyScore(Double anomalyScore) { this.anomalyScore = anomalyScore; }
    public Double getDriftScore() { return driftScore; }
    public void setDriftScore(Double driftScore) { this.driftScore = driftScore; }
    public SensorStatus getDriftStatus() { return driftStatus; }
    public void setDriftStatus(SensorStatus driftStatus) { this.driftStatus = driftStatus; }
    public SensorStatus getFailureStatus() { return failureStatus; }
    public void setFailureStatus(SensorStatus failureStatus) { this.failureStatus = failureStatus; }
    public List<String> getSupportingFeatures() { return supportingFeatures; }
    public void setSupportingFeatures(List<String> supportingFeatures) { this.supportingFeatures = supportingFeatures; }
    public Integer getInferenceLatencyMs() { return inferenceLatencyMs; }
    public void setInferenceLatencyMs(Integer inferenceLatencyMs) { this.inferenceLatencyMs = inferenceLatencyMs; }
}
