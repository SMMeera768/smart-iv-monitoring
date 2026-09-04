package com.smartiv.dto.response;

import java.time.Instant;
import java.util.Map;

public class ResearchMetricsResponse {

    private String evaluationType; // "SYNTHETIC_DATASET_RESULT" or "HARDWARE_EXPERIMENTAL_RESULT"
    private Instant timestamp = Instant.now();
    private String modelVersion;
    private double meanAbsoluteErrorWeightG;
    private double rootMeanSquareErrorWeightG;
    private double flowRateMaeGPerMin;
    private double eventAccuracy;
    private double eventPrecision;
    private double eventRecall;
    private double eventF1Score;
    private double averageDetectionLatencyMs;
    private double aiDriftDetectionRate;
    private double aiAnomalyPrecision;
    private double aiAnomalyRecall;
    private Map<String, Integer> confusionMatrix;
    private String disclaimer = "Research prototype evaluation metrics. Not certified clinical performance metrics.";

    public String getEvaluationType() { return evaluationType; }
    public void setEvaluationType(String evaluationType) { this.evaluationType = evaluationType; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public double getMeanAbsoluteErrorWeightG() { return meanAbsoluteErrorWeightG; }
    public void setMeanAbsoluteErrorWeightG(double meanAbsoluteErrorWeightG) { this.meanAbsoluteErrorWeightG = meanAbsoluteErrorWeightG; }
    public double getRootMeanSquareErrorWeightG() { return rootMeanSquareErrorWeightG; }
    public void setRootMeanSquareErrorWeightG(double rootMeanSquareErrorWeightG) { this.rootMeanSquareErrorWeightG = rootMeanSquareErrorWeightG; }
    public double getFlowRateMaeGPerMin() { return flowRateMaeGPerMin; }
    public void setFlowRateMaeGPerMin(double flowRateMaeGPerMin) { this.flowRateMaeGPerMin = flowRateMaeGPerMin; }
    public double getEventAccuracy() { return eventAccuracy; }
    public void setEventAccuracy(double eventAccuracy) { this.eventAccuracy = eventAccuracy; }
    public double getEventPrecision() { return eventPrecision; }
    public void setEventPrecision(double eventPrecision) { this.eventPrecision = eventPrecision; }
    public double getEventRecall() { return eventRecall; }
    public void setEventRecall(double eventRecall) { this.eventRecall = eventRecall; }
    public double getEventF1Score() { return eventF1Score; }
    public void setEventF1Score(double eventF1Score) { this.eventF1Score = eventF1Score; }
    public double getAverageDetectionLatencyMs() { return averageDetectionLatencyMs; }
    public void setAverageDetectionLatencyMs(double averageDetectionLatencyMs) { this.averageDetectionLatencyMs = averageDetectionLatencyMs; }
    public double getAiDriftDetectionRate() { return aiDriftDetectionRate; }
    public void setAiDriftDetectionRate(double aiDriftDetectionRate) { this.aiDriftDetectionRate = aiDriftDetectionRate; }
    public double getAiAnomalyPrecision() { return aiAnomalyPrecision; }
    public void setAiAnomalyPrecision(double aiAnomalyPrecision) { this.aiAnomalyPrecision = aiAnomalyPrecision; }
    public double getAiAnomalyRecall() { return aiAnomalyRecall; }
    public void setAiAnomalyRecall(double aiAnomalyRecall) { this.aiAnomalyRecall = aiAnomalyRecall; }
    public Map<String, Integer> getConfusionMatrix() { return confusionMatrix; }
    public void setConfusionMatrix(Map<String, Integer> confusionMatrix) { this.confusionMatrix = confusionMatrix; }
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
