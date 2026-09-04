package com.smartiv.service.evidence;

import com.smartiv.config.SmartIvProperties;
import com.smartiv.engine.RuleContext;
import com.smartiv.entity.IvEvent;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Computes a 0–100 evidence score for a detected event.
 *
 * Score represents the strength of measured evidence supporting the event.
 * It is NOT a clinical probability.
 *
 * Each event type has its own set of factors with configured weights.
 * Weights are stored here (not scattered in controllers).
 * All weights must be frozen before experimental evaluation.
 *
 * Internal convention: factor scores are 0.0–1.0; final score is 0–100.
 */
@Service
public class EvidenceScoreService {

    private final SmartIvProperties props;

    public EvidenceScoreService(SmartIvProperties props) {
        this.props = props;
    }

    public EvidenceResult compute(IvEvent.EventType eventType, RuleContext ctx, boolean candidateConfirmed) {
        return switch (eventType) {
            case FLOW_INTERRUPTION -> scoreFlowInterruption(ctx, candidateConfirmed);
            case BAG_REPLACEMENT   -> scoreBagReplacement(ctx, candidateConfirmed);
            case LOW_VOLUME        -> scoreLowVolume(ctx);
            case NORMAL_FLOW       -> scoreNormalFlow(ctx);
            default                -> new EvidenceResult(50, List.of());
        };
    }

    // -------------------------------------------------------------------------
    // FLOW_INTERRUPTION factors
    // -------------------------------------------------------------------------
    private EvidenceResult scoreFlowInterruption(RuleContext ctx, boolean confirmed) {
        List<Factor> factors = new ArrayList<>();

        // Factor 1: how far below threshold is the flow (0.4 weight)
        double threshold = props.getRules().getFlowInterruptionThresholdGPerMin();
        double flowScore = clamp(1.0 - (Math.abs(ctx.getSmoothedFlowRate()) / Math.max(threshold, 0.01)));
        factors.add(new Factor("LOW_FLOW_MAGNITUDE", flowScore, 0.40));

        // Factor 2: slope magnitude near zero (0.30 weight)
        double slopeScore = clamp(1.0 - (Math.abs(ctx.getWeightSlope()) / 5.0));
        factors.add(new Factor("WEIGHT_SLOPE_NEAR_ZERO", slopeScore, 0.30));

        // Factor 3: signal stability — low noise increases confidence (0.20 weight)
        double noiseScore = clamp(1.0 - (ctx.getSignalNoise() / 2.0));
        factors.add(new Factor("SIGNAL_STABILITY", noiseScore, 0.20));

        // Factor 4: persistence confirmed (0.10 weight)
        double persistScore = confirmed ? 1.0 : 0.3;
        factors.add(new Factor("DURATION_THRESHOLD_MET", persistScore, 0.10));

        return new EvidenceResult(weightedScore(factors), factors);
    }

    // -------------------------------------------------------------------------
    // BAG_REPLACEMENT factors
    // -------------------------------------------------------------------------
    private EvidenceResult scoreBagReplacement(RuleContext ctx, boolean confirmed) {
        List<Factor> factors = new ArrayList<>();

        // Factor 1: magnitude of positive weight jump (0.45 weight)
        double jumpThreshold = props.getRules().getBagReplacementWeightJumpG();
        double jumpScore = clamp(ctx.getWeightChange() / (jumpThreshold * 2.0));
        factors.add(new Factor("WEIGHT_JUMP_MAGNITUDE", jumpScore, 0.45));

        // Factor 2: post-jump stability (0.35 weight)
        double stabilityScore = clamp(1.0 - (ctx.getStandardDeviation() / 10.0));
        factors.add(new Factor("POST_JUMP_STABILITY", stabilityScore, 0.35));

        // Factor 3: persistence confirmed (0.20 weight)
        double persistScore = confirmed ? 1.0 : 0.2;
        factors.add(new Factor("STABILITY_DURATION_MET", persistScore, 0.20));

        return new EvidenceResult(weightedScore(factors), factors);
    }

    // -------------------------------------------------------------------------
    // LOW_VOLUME factors
    // -------------------------------------------------------------------------
    private EvidenceResult scoreLowVolume(RuleContext ctx) {
        List<Factor> factors = new ArrayList<>();

        Double pct = ctx.getPercentRemaining();
        if (pct == null) return new EvidenceResult(50, factors);

        // Factor 1: how far below threshold (0.70 weight)
        double threshold = props.getRules().getLowVolumeThresholdPercent();
        double crossingScore = clamp(1.0 - (pct / threshold));
        factors.add(new Factor("THRESHOLD_CROSSING_DEPTH", crossingScore, 0.70));

        // Factor 2: signal validity (0.30 weight)
        double validityScore = clamp(1.0 - (ctx.getSignalNoise() / 2.0));
        factors.add(new Factor("SIGNAL_VALIDITY", validityScore, 0.30));

        return new EvidenceResult(weightedScore(factors), factors);
    }

    // -------------------------------------------------------------------------
    // NORMAL_FLOW factors
    // -------------------------------------------------------------------------
    private EvidenceResult scoreNormalFlow(RuleContext ctx) {
        List<Factor> factors = new ArrayList<>();

        // Factor 1: flow above threshold (0.50 weight)
        double threshold = props.getRules().getFlowInterruptionThresholdGPerMin();
        double flowScore = clamp(ctx.getSmoothedFlowRate() / (threshold * 4.0));
        factors.add(new Factor("FLOW_ABOVE_THRESHOLD", flowScore, 0.50));

        // Factor 2: negative slope (bag losing weight) (0.30 weight)
        double slopeScore = ctx.getWeightSlope() < 0 ? clamp(Math.abs(ctx.getWeightSlope()) / 5.0) : 0.0;
        factors.add(new Factor("NEGATIVE_WEIGHT_SLOPE", slopeScore, 0.30));

        // Factor 3: signal stability (0.20 weight)
        double noiseScore = clamp(1.0 - (ctx.getSignalNoise() / 2.0));
        factors.add(new Factor("SIGNAL_STABILITY", noiseScore, 0.20));

        return new EvidenceResult(weightedScore(factors), factors);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    private int weightedScore(List<Factor> factors) {
        double total = 0.0;
        for (Factor f : factors) {
            total += f.score() * f.weight();
        }
        return (int) Math.round(clamp(total) * 100.0);
    }

    private double clamp(double v) {
        return Math.max(0.0, Math.min(1.0, v));
    }

    // -------------------------------------------------------------------------
    // Result types
    // -------------------------------------------------------------------------
    public record Factor(String name, double score, double weight) {}

    public static class EvidenceResult {
        private final int score;           // 0–100
        private final List<Factor> factors;

        public EvidenceResult(int score, List<Factor> factors) {
            this.score = score;
            this.factors = factors;
        }

        public int getScore() { return score; }
        public List<Factor> getFactors() { return factors; }
    }
}
