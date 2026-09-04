package com.smartiv.engine;

import com.smartiv.entity.AiMetric;

import java.time.Instant;

/**
 * Immutable input to the rule engine for one processing cycle.
 * All values are Spring Boot-calculated — the frontend never computes these.
 */
public class RuleContext {

    private final String bedCode;
    private final Instant now;

    // Features
    private final double filteredWeight;
    private final double weightChange;
    private final double weightSlope;          // g/min
    private final double flowRate;             // g/min instantaneous
    private final double smoothedFlowRate;     // g/min smoothed
    private final double standardDeviation;
    private final double rollingVariance;
    private final double signalNoise;
    private final Double percentRemaining;
    private final double baselineDeviation;

    // Sensor health from AI layer
    private final AiMetric.SensorStatus sensorStatus;
    private final Double anomalyScore;

    // Candidate event timing (for persistence checks)
    private final Instant eventCandidateStartTime;

    public RuleContext(String bedCode, Instant now,
                       double filteredWeight, double weightChange, double weightSlope,
                       double flowRate, double smoothedFlowRate,
                       double standardDeviation, double rollingVariance, double signalNoise,
                       Double percentRemaining, double baselineDeviation,
                       AiMetric.SensorStatus sensorStatus, Double anomalyScore,
                       Instant eventCandidateStartTime) {
        this.bedCode = bedCode;
        this.now = now;
        this.filteredWeight = filteredWeight;
        this.weightChange = weightChange;
        this.weightSlope = weightSlope;
        this.flowRate = flowRate;
        this.smoothedFlowRate = smoothedFlowRate;
        this.standardDeviation = standardDeviation;
        this.rollingVariance = rollingVariance;
        this.signalNoise = signalNoise;
        this.percentRemaining = percentRemaining;
        this.baselineDeviation = baselineDeviation;
        this.sensorStatus = sensorStatus;
        this.anomalyScore = anomalyScore;
        this.eventCandidateStartTime = eventCandidateStartTime;
    }

    public String getBedCode() { return bedCode; }
    public Instant getNow() { return now; }
    public double getFilteredWeight() { return filteredWeight; }
    public double getWeightChange() { return weightChange; }
    public double getWeightSlope() { return weightSlope; }
    public double getFlowRate() { return flowRate; }
    public double getSmoothedFlowRate() { return smoothedFlowRate; }
    public double getStandardDeviation() { return standardDeviation; }
    public double getRollingVariance() { return rollingVariance; }
    public double getSignalNoise() { return signalNoise; }
    public Double getPercentRemaining() { return percentRemaining; }
    public double getBaselineDeviation() { return baselineDeviation; }
    public AiMetric.SensorStatus getSensorStatus() { return sensorStatus; }
    public Double getAnomalyScore() { return anomalyScore; }
    public Instant getEventCandidateStartTime() { return eventCandidateStartTime; }
}
