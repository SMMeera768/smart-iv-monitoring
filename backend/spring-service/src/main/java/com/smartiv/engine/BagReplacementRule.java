package com.smartiv.engine;

import com.smartiv.config.SmartIvProperties;
import com.smartiv.entity.IvEvent;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * BAG_REPLACEMENT rule.
 *
 * Candidate condition:
 *   weightChange >= bagReplacementWeightJumpG  (large positive jump)
 *
 * Confirmation requires:
 *   - the post-jump weight has remained stable (low stdDev) for
 *     bagReplacementStabilityDurationMs (EXPERIMENTAL default: 30 000 ms)
 *   - a single positive reading is NOT sufficient
 *
 * After confirmation the event service must:
 *   - close the previous bag session
 *   - create a new bag session
 *   - reset relevant baseline/session parameters
 */
@Component
public class BagReplacementRule {

    private final SmartIvProperties props;

    public BagReplacementRule(SmartIvProperties props) {
        this.props = props;
    }

    /** Returns true when a large positive weight jump is detected. */
    public boolean isCandidate(RuleContext ctx) {
        return ctx.getWeightChange() >= props.getRules().getBagReplacementWeightJumpG();
    }

    /**
     * Returns true when the post-jump weight has been stable long enough.
     * Stability is assessed via low standardDeviation.
     */
    public boolean isConfirmed(RuleContext ctx) {
        if (!isCandidate(ctx) && ctx.getEventCandidateStartTime() == null) return false;
        if (ctx.getEventCandidateStartTime() == null) return false;

        long elapsed = Duration.between(ctx.getEventCandidateStartTime(), ctx.getNow()).toMillis();
        boolean durationMet = elapsed >= props.getRules().getBagReplacementStabilityDurationMs();

        // Post-jump signal should be relatively stable (low noise)
        boolean stable = ctx.getStandardDeviation() < props.getRules().getBagReplacementWeightJumpG() * 0.1;

        return durationMet && stable;
    }

    public IvEvent.EventType getEventType() {
        return IvEvent.EventType.BAG_REPLACEMENT;
    }
}
