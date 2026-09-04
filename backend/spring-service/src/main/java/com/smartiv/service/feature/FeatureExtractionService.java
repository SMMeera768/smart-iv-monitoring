package com.smartiv.service.feature;

import com.smartiv.config.SmartIvProperties;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Extracts all derived features from the per-bed rolling window.
 *
 * All formulas are documented here and in docs/signal-processing.md.
 * Every feature used in the paper must match these definitions exactly.
 */
@Service
public class FeatureExtractionService {

    private final SmartIvProperties props;

    public FeatureExtractionService(SmartIvProperties props) {
        this.props = props;
    }

    /**
     * Compute all features from the current window snapshots.
     *
     * @param rawWindow       ordered raw weight samples (oldest first), grams
     * @param filteredWindow  ordered filtered weight samples (oldest first), grams
     * @param timestamps      corresponding server timestamps
     * @param baseline        current per-bed baseline value
     * @return ExtractedFeatures record
     */
    public ExtractedFeatures extract(double[] rawWindow, double[] filteredWindow,
                                     Instant[] timestamps, Double baseline) {
        int n = filteredWindow.length;
        if (n < 2) {
            return ExtractedFeatures.insufficient();
        }

        int featureN = Math.min(n, props.getSignal().getFeatureWindow());
        int start = n - featureN;

        double[] fw = slice(filteredWindow, start, n);
        double[] rw = slice(rawWindow, start, n);

        double latestFiltered = fw[fw.length - 1];
        double prevFiltered   = fw[fw.length - 2];

        // weightChange = currentFiltered - previousFiltered (sign preserved)
        double weightChange = latestFiltered - prevFiltered;

        // standardDeviation of filtered window
        double mean = mean(fw);
        double stdDev = stdDev(fw, mean);

        // rollingVariance = stdDev^2
        double rollingVariance = stdDev * stdDev;

        // signalNoise = stdDev of (rawWeight - filteredWeight) within window
        // Definition: short-term deviation of raw from filtered
        double[] residuals = new double[fw.length];
        for (int i = 0; i < fw.length; i++) {
            residuals[i] = rw[i] - fw[i];
        }
        double noiseMean = mean(residuals);
        double signalNoise = stdDev(residuals, noiseMean);

        // weightSlope via simple linear regression over the feature window (g/min)
        double weightSlope = linearSlopeGPerMin(fw, timestamps, start);

        // baselineDeviation = latestFiltered - baseline (if baseline available)
        double baselineDeviation = (baseline != null) ? (latestFiltered - baseline) : 0.0;

        return new ExtractedFeatures(
                latestFiltered, weightChange, stdDev, rollingVariance,
                signalNoise, weightSlope, baselineDeviation, true
        );
    }

    /**
     * Linear regression slope over the filtered window.
     * Returns grams/minute.
     *
     * Uses time differences in minutes as x-axis to produce g/min units.
     */
    private double linearSlopeGPerMin(double[] fw, Instant[] timestamps, int windowStart) {
        int len = fw.length;
        if (len < 2) return 0.0;

        // x = elapsed minutes from first sample in window
        double[] x = new double[len];
        Instant t0 = timestamps[windowStart];
        for (int i = 0; i < len; i++) {
            long ms = timestamps[windowStart + i].toEpochMilli() - t0.toEpochMilli();
            x[i] = ms / 60000.0;
        }

        double xMean = mean(x);
        double yMean = mean(fw);
        double num = 0.0, den = 0.0;
        for (int i = 0; i < len; i++) {
            num += (x[i] - xMean) * (fw[i] - yMean);
            den += (x[i] - xMean) * (x[i] - xMean);
        }
        return (den == 0.0) ? 0.0 : num / den;
    }

    private double mean(double[] arr) {
        double s = 0;
        for (double v : arr) s += v;
        return s / arr.length;
    }

    private double stdDev(double[] arr, double mean) {
        double s = 0;
        for (double v : arr) s += (v - mean) * (v - mean);
        return Math.sqrt(s / arr.length);
    }

    private double[] slice(double[] arr, int from, int to) {
        double[] out = new double[to - from];
        System.arraycopy(arr, from, out, 0, to - from);
        return out;
    }

    public static class ExtractedFeatures {
        private final double filteredWeight;
        private final double weightChange;
        private final double standardDeviation;
        private final double rollingVariance;
        private final double signalNoise;
        private final double weightSlope;       // g/min
        private final double baselineDeviation;
        private final boolean sufficient;

        public ExtractedFeatures(double filteredWeight, double weightChange,
                                  double standardDeviation, double rollingVariance,
                                  double signalNoise, double weightSlope,
                                  double baselineDeviation, boolean sufficient) {
            this.filteredWeight = filteredWeight;
            this.weightChange = weightChange;
            this.standardDeviation = standardDeviation;
            this.rollingVariance = rollingVariance;
            this.signalNoise = signalNoise;
            this.weightSlope = weightSlope;
            this.baselineDeviation = baselineDeviation;
            this.sufficient = sufficient;
        }

        public static ExtractedFeatures insufficient() {
            return new ExtractedFeatures(0, 0, 0, 0, 0, 0, 0, false);
        }

        public double getFilteredWeight() { return filteredWeight; }
        public double getWeightChange() { return weightChange; }
        public double getStandardDeviation() { return standardDeviation; }
        public double getRollingVariance() { return rollingVariance; }
        public double getSignalNoise() { return signalNoise; }
        public double getWeightSlope() { return weightSlope; }
        public double getBaselineDeviation() { return baselineDeviation; }
        public boolean isSufficient() { return sufficient; }
    }
}
