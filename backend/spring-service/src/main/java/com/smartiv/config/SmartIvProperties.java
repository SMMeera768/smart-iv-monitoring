package com.smartiv.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Typed binding for all smartiv.* configuration keys.
 * Every threshold is EXPERIMENTAL — final values must come from calibration experiments.
 */
@Component
@ConfigurationProperties(prefix = "smartiv")
public class SmartIvProperties {

    private Signal signal = new Signal();
    private Rules rules = new Rules();
    private Ai ai = new Ai();
    private Device device = new Device();

    public Signal getSignal() { return signal; }
    public Rules getRules() { return rules; }
    public Ai getAi() { return ai; }
    public Device getDevice() { return device; }

    public static class Signal {
        private int movingAverageWindow = 10;
        private int flowSmoothingWindow = 5;
        private int featureWindow = 20;
        private int baselineWindow = 60;

        public int getMovingAverageWindow() { return movingAverageWindow; }
        public void setMovingAverageWindow(int v) { this.movingAverageWindow = v; }
        public int getFlowSmoothingWindow() { return flowSmoothingWindow; }
        public void setFlowSmoothingWindow(int v) { this.flowSmoothingWindow = v; }
        public int getFeatureWindow() { return featureWindow; }
        public void setFeatureWindow(int v) { this.featureWindow = v; }
        public int getBaselineWindow() { return baselineWindow; }
        public void setBaselineWindow(int v) { this.baselineWindow = v; }
    }

    public static class Rules {
        private double flowInterruptionThresholdGPerMin = 0.5;
        private long flowInterruptionMinDurationMs = 120000;
        private double lowVolumeThresholdPercent = 15.0;
        private double bagReplacementWeightJumpG = 50.0;
        private long bagReplacementStabilityDurationMs = 30000;
        private double normalFlowHysteresisGPerMin = 1.0;

        public double getFlowInterruptionThresholdGPerMin() { return flowInterruptionThresholdGPerMin; }
        public void setFlowInterruptionThresholdGPerMin(double v) { this.flowInterruptionThresholdGPerMin = v; }
        public long getFlowInterruptionMinDurationMs() { return flowInterruptionMinDurationMs; }
        public void setFlowInterruptionMinDurationMs(long v) { this.flowInterruptionMinDurationMs = v; }
        public double getLowVolumeThresholdPercent() { return lowVolumeThresholdPercent; }
        public void setLowVolumeThresholdPercent(double v) { this.lowVolumeThresholdPercent = v; }
        public double getBagReplacementWeightJumpG() { return bagReplacementWeightJumpG; }
        public void setBagReplacementWeightJumpG(double v) { this.bagReplacementWeightJumpG = v; }
        public long getBagReplacementStabilityDurationMs() { return bagReplacementStabilityDurationMs; }
        public void setBagReplacementStabilityDurationMs(long v) { this.bagReplacementStabilityDurationMs = v; }
        public double getNormalFlowHysteresisGPerMin() { return normalFlowHysteresisGPerMin; }
        public void setNormalFlowHysteresisGPerMin(double v) { this.normalFlowHysteresisGPerMin = v; }
    }

    public static class Ai {
        private double anomalyThreshold = 0.6;
        private double driftThreshold = 0.5;

        public double getAnomalyThreshold() { return anomalyThreshold; }
        public void setAnomalyThreshold(double v) { this.anomalyThreshold = v; }
        public double getDriftThreshold() { return driftThreshold; }
        public void setDriftThreshold(double v) { this.driftThreshold = v; }
    }

    public static class Device {
        private long offlineTimeoutMs = 300000;

        public long getOfflineTimeoutMs() { return offlineTimeoutMs; }
        public void setOfflineTimeoutMs(long v) { this.offlineTimeoutMs = v; }
    }
}
