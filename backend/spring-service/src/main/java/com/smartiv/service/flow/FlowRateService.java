package com.smartiv.service.flow;

import com.smartiv.config.SmartIvProperties;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Estimates IV bag flow rate from weight-change measurements.
 *
 * Primary formula (mass flow rate):
 *   massFlowRate = -ΔWeight / ΔTime
 *
 * The negative sign converts decreasing bag weight into a positive flow value.
 * Units: grams/minute (internal representation).
 *
 * Volume conversion:
 *   volumeFlowRate ≈ massFlowRate / density
 *   For water/saline-like demonstration fluid, density ≈ 1.0 g/mL.
 *   This approximation is ONLY valid for the demonstration fluid and must be
 *   explicitly documented in the paper. Do NOT silently assume 1 g = 1 mL
 *   for other fluids.
 *
 * Smoothed flow uses a configurable rolling mean over recent instantaneous values.
 * Window: smartiv.signal.flow-smoothing-window (EXPERIMENTAL default: 5)
 */
@Service
public class FlowRateService {

    private final SmartIvProperties props;

    public FlowRateService(SmartIvProperties props) {
        this.props = props;
    }

    /**
     * Compute instantaneous flow rate.
     *
     * @param prevFilteredWeight previous filtered weight (g)
     * @param currFilteredWeight current filtered weight (g)
     * @param prevTimestamp      timestamp of previous sample
     * @param currTimestamp      timestamp of current sample
     * @return flow rate in g/min (positive = fluid leaving bag)
     */
    public double computeInstantaneous(double prevFilteredWeight, double currFilteredWeight,
                                        Instant prevTimestamp, Instant currTimestamp) {
        long deltaMs = currTimestamp.toEpochMilli() - prevTimestamp.toEpochMilli();
        if (deltaMs <= 0) return 0.0;

        double deltaWeight = currFilteredWeight - prevFilteredWeight;
        double deltaMinutes = deltaMs / 60000.0;

        // Negative sign: decreasing weight → positive flow
        return -deltaWeight / deltaMinutes;
    }

    /**
     * Compute smoothed flow rate as the mean of the most recent N instantaneous values.
     *
     * @param filteredWindow ordered filtered weight samples (oldest first)
     * @param timestamps     corresponding timestamps
     * @return smoothed flow rate in g/min
     */
    public double computeSmoothed(double[] filteredWindow, Instant[] timestamps) {
        int n = props.getSignal().getFlowSmoothingWindow();
        int len = filteredWindow.length;
        if (len < 2) return 0.0;

        int pairs = Math.min(n, len - 1);
        double sum = 0.0;
        for (int i = len - pairs; i < len; i++) {
            sum += computeInstantaneous(
                    filteredWindow[i - 1], filteredWindow[i],
                    timestamps[i - 1], timestamps[i]
            );
        }
        return sum / pairs;
    }

    /**
     * Compute percent remaining for the current bag session.
     *
     * Formula:
     *   fluidMassRemaining = currentWeight - emptySystemTare
     *   percentRemaining   = fluidMassRemaining / initialFluidMass × 100
     *
     * Clamped to [0, 100] for display; raw value preserved for research debugging.
     *
     * @param currentFilteredWeight current filtered weight (g)
     * @param initialBagWeight      weight at session start (g) — includes fluid + container
     * @param emptyTareWeight       tare weight of empty container/hanger (g)
     * @return percent remaining [0–100], or null if session not initialised
     */
    public Double computePercentRemaining(double currentFilteredWeight,
                                           Double initialBagWeight,
                                           double emptyTareWeight) {
        if (initialBagWeight == null) return null;
        double initialFluid = initialBagWeight - emptyTareWeight;
        if (initialFluid <= 0) return null;
        double remaining = currentFilteredWeight - emptyTareWeight;
        double raw = (remaining / initialFluid) * 100.0;
        return Math.max(0.0, Math.min(100.0, raw));
    }
}
