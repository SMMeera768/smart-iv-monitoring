package com.smartiv.service.processing;

import com.smartiv.config.SmartIvProperties;
import org.springframework.stereotype.Service;

/**
 * Moving-average filter for raw weight samples.
 *
 * Formula:
 *   filteredWeight(t) = mean of the latest N raw weight samples
 *   where N = smartiv.signal.moving-average-window (EXPERIMENTAL default: 10)
 *
 * During warm-up (fewer than N samples available) the mean of available samples
 * is returned and isWarmUp() returns true — callers should treat these values
 * as less reliable.
 */
@Service
public class SignalFilterService {

    private final SmartIvProperties props;

    public SignalFilterService(SmartIvProperties props) {
        this.props = props;
    }

    /**
     * Compute the moving-average filtered weight from the current raw window snapshot.
     *
     * @param rawWindow ordered array of raw weight samples (oldest first)
     * @return FilterResult containing the filtered value and warm-up flag
     */
    public FilterResult compute(double[] rawWindow) {
        int n = props.getSignal().getMovingAverageWindow();
        if (rawWindow == null || rawWindow.length == 0) {
            return new FilterResult(0.0, true);
        }

        boolean warmUp = rawWindow.length < n;
        int useCount = warmUp ? rawWindow.length : n;

        // Use the most recent `useCount` samples
        double sum = 0.0;
        int start = rawWindow.length - useCount;
        for (int i = start; i < rawWindow.length; i++) {
            sum += rawWindow[i];
        }
        double filtered = sum / useCount;
        return new FilterResult(filtered, warmUp);
    }

    public static class FilterResult {
        private final double filteredWeight;
        private final boolean warmUp;

        public FilterResult(double filteredWeight, boolean warmUp) {
            this.filteredWeight = filteredWeight;
            this.warmUp = warmUp;
        }

        public double getFilteredWeight() { return filteredWeight; }
        public boolean isWarmUp() { return warmUp; }
    }
}
