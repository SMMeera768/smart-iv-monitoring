package com.smartiv.engine;

import com.smartiv.entity.AiMetric;
import com.smartiv.entity.IvEvent;
import org.springframework.stereotype.Component;

/**
 * Orchestrates the four primary IV event rules with deterministic priority.
 *
 * Priority order (highest first):
 *   1. POSSIBLE_SENSOR_FAILURE  → returns FLOW_INTERRUPTION with sensor-failure explanation
 *   2. BAG_REPLACEMENT          → confirmed replacement transition
 *   3. FLOW_INTERRUPTION        → confirmed low-flow condition
 *   4. NORMAL_FLOW              → default when no other rule fires
 *
 * LOW_VOLUME is evaluated independently and surfaced as a coexisting flag
 * in RuleResult — it does NOT override the primary event type.
 *
 * Rule logic lives in individual rule classes, NOT in controllers or services.
 */
@Component
public class RuleEngine {

    private final NormalFlowRule normalFlowRule;
    private final FlowInterruptionRule flowInterruptionRule;
    private final LowVolumeRule lowVolumeRule;
    private final BagReplacementRule bagReplacementRule;

    public RuleEngine(NormalFlowRule normalFlowRule,
                      FlowInterruptionRule flowInterruptionRule,
                      LowVolumeRule lowVolumeRule,
                      BagReplacementRule bagReplacementRule) {
        this.normalFlowRule = normalFlowRule;
        this.flowInterruptionRule = flowInterruptionRule;
        this.lowVolumeRule = lowVolumeRule;
        this.bagReplacementRule = bagReplacementRule;
    }

    /**
     * Evaluate all rules for one processing cycle and return a deterministic result.
     *
     * @param ctx features and state for this cycle
     * @return RuleResult with primary event type, low-volume flag, and explanation
     */
    public RuleResult evaluate(RuleContext ctx) {
        boolean lowVolume = lowVolumeRule.matches(ctx);

        // Priority 1: sensor failure invalidates measurement
        if (ctx.getSensorStatus() == AiMetric.SensorStatus.POSSIBLE_SENSOR_FAILURE) {
            return new RuleResult(
                    IvEvent.EventType.FLOW_INTERRUPTION,
                    lowVolume,
                    "Measurement invalidated: sensor status is POSSIBLE_SENSOR_FAILURE.",
                    false
            );
        }

        // Priority 2: bag replacement (candidate or confirmed)
        if (bagReplacementRule.isCandidate(ctx)) {
            boolean confirmed = bagReplacementRule.isConfirmed(ctx);
            return new RuleResult(
                    IvEvent.EventType.BAG_REPLACEMENT,
                    lowVolume,
                    confirmed
                            ? "Bag replacement confirmed: large positive weight jump with post-change stability."
                            : "Bag replacement candidate: large positive weight jump detected, awaiting stability.",
                    confirmed
            );
        }

        // Priority 3: flow interruption (candidate or confirmed)
        if (flowInterruptionRule.isCandidate(ctx)) {
            boolean confirmed = flowInterruptionRule.isConfirmed(ctx);
            return new RuleResult(
                    IvEvent.EventType.FLOW_INTERRUPTION,
                    lowVolume,
                    confirmed
                            ? "Possible flow interruption confirmed: near-zero flow persisted beyond duration threshold."
                            : "Possible flow interruption candidate: near-zero flow detected, awaiting duration threshold.",
                    confirmed
            );
        }

        // Priority 4: normal flow
        if (normalFlowRule.matches(ctx)) {
            return new RuleResult(
                    IvEvent.EventType.NORMAL_FLOW,
                    lowVolume,
                    "Normal flow: weight decreasing within expected conditions.",
                    true
            );
        }

        // Fallback: insufficient data or transitional state
        return new RuleResult(
                IvEvent.EventType.NORMAL_FLOW,
                lowVolume,
                "Insufficient data or transitional state — defaulting to NORMAL_FLOW.",
                false
        );
    }
}
