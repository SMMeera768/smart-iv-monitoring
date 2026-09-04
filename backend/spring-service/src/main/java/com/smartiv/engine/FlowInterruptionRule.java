package com.smartiv.engine;

import com.smartiv.config.SmartIvProperties;
import com.smartiv.entity.AiMetric;
import com.smartiv.entity.IvEvent;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * FLOW_INTERRUPTION rule.
 *
 * Candidate condition:
 *   - |smoothedFlowRate| <= flowInterruptionThreshold
 *   - sensor is not POSSIBLE_SENSOR_FAILURE
 *   - no bag replacement is occurring (weightChange not a large positive jump)
 *
 * Confirmation requires the candidate to persist for at least
 * smartiv.rules.flow-interruption-min-duration-ms (EXPERIMENTAL default: 120 000 ms).
 *
 * A single noisy reading does NOT trigger this rule.
 */
@Component
public class FlowInterruptionRule {

    private final SmartIvProperties props;

    public FlowInterruptionRule(SmartIvProperties props) {
        this.props = props;
    }

    /** Returns true when the candidate condition is currently active. */
    public boolean isCandidate(RuleContext ctx) {
        if (ctx.getSensorStatus() == AiMetric.SensorStatus.POSSIBLE_SENSOR_FAILURE) {
            return false;
        }
        if (isBagReplacementLike(ctx)) {
            return false;
        }
        return Math.abs(ctx.getSmoothedFlowRate()) <= props.getRules().getFlowInterruptionThresholdGPerMin();
    }

    /**
     * Returns true when the candidate has persisted long enough to be confirmed.
     * candidateStartTime must be set in BedRuntimeState when isCandidate() first becomes true.
     */
    public boolean isConfirmed(RuleContext ctx) {
        if (!isCandidate(ctx)) return false;
        if (ctx.getEventCandidateStartTime() == null) return false;
        long elapsed = Duration.between(ctx.getEventCandidateStartTime(), ctx.getNow()).toMillis();
        return elapsed >= props.getRules().getFlowInterruptionMinDurationMs();
    }

    public IvEvent.EventType getEventType() {
        return IvEvent.EventType.FLOW_INTERRUPTION;
    }

    private boolean isBagReplacementLike(RuleContext ctx) {
        return ctx.getWeightChange() > props.getRules().getBagReplacementWeightJumpG() * 0.5;
    }
}
