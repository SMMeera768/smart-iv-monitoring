package com.smartiv.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "derived_features")
public class DerivedFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reading_id")
    private SensorReading sensorReading;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    @Column(name = "filtered_weight")
    private Double filteredWeight;

    @Column(name = "weight_change")
    private Double weightChange;

    @Column(name = "flow_rate")
    private Double flowRate;

    @Column(name = "smoothed_flow_rate")
    private Double smoothedFlowRate;

    @Column(name = "weight_slope")
    private Double weightSlope;

    @Column(name = "standard_deviation")
    private Double standardDeviation;

    @Column(name = "rolling_variance")
    private Double rollingVariance;

    @Column(name = "signal_noise")
    private Double signalNoise;

    @Column(name = "percent_remaining")
    private Double percentRemaining;

    @Column
    private Double baseline;

    @Column(name = "drift_score")
    private Double driftScore;

    @Column(name = "anomaly_score")
    private Double anomalyScore;

    public Long getId() { return id; }
    public SensorReading getSensorReading() { return sensorReading; }
    public void setSensorReading(SensorReading sensorReading) { this.sensorReading = sensorReading; }
    public Bed getBed() { return bed; }
    public void setBed(Bed bed) { this.bed = bed; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public Double getFilteredWeight() { return filteredWeight; }
    public void setFilteredWeight(Double filteredWeight) { this.filteredWeight = filteredWeight; }
    public Double getWeightChange() { return weightChange; }
    public void setWeightChange(Double weightChange) { this.weightChange = weightChange; }
    public Double getFlowRate() { return flowRate; }
    public void setFlowRate(Double flowRate) { this.flowRate = flowRate; }
    public Double getSmoothedFlowRate() { return smoothedFlowRate; }
    public void setSmoothedFlowRate(Double smoothedFlowRate) { this.smoothedFlowRate = smoothedFlowRate; }
    public Double getWeightSlope() { return weightSlope; }
    public void setWeightSlope(Double weightSlope) { this.weightSlope = weightSlope; }
    public Double getStandardDeviation() { return standardDeviation; }
    public void setStandardDeviation(Double standardDeviation) { this.standardDeviation = standardDeviation; }
    public Double getRollingVariance() { return rollingVariance; }
    public void setRollingVariance(Double rollingVariance) { this.rollingVariance = rollingVariance; }
    public Double getSignalNoise() { return signalNoise; }
    public void setSignalNoise(Double signalNoise) { this.signalNoise = signalNoise; }
    public Double getPercentRemaining() { return percentRemaining; }
    public void setPercentRemaining(Double percentRemaining) { this.percentRemaining = percentRemaining; }
    public Double getBaseline() { return baseline; }
    public void setBaseline(Double baseline) { this.baseline = baseline; }
    public Double getDriftScore() { return driftScore; }
    public void setDriftScore(Double driftScore) { this.driftScore = driftScore; }
    public Double getAnomalyScore() { return anomalyScore; }
    public void setAnomalyScore(Double anomalyScore) { this.anomalyScore = anomalyScore; }
}
