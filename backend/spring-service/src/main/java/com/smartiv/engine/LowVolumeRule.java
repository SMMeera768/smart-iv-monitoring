package com.smartiv.engine;

import com.smartiv.config.SmartIvProperties;
import com.smartiv.entity.IvEvent;
import org.springframework.stereotype.Component;

/**
 * LOW_VOLUME rule.
 *
 * Condition:
 *   percentRemaining <= smartiv.rules.low-volume-threshold-percent
 *   AND percentRemaining is available (bag session initialised)
 *
 * Threshold is EXPERIMENTAL — not clinically validated.
 * LOW_VOLUME may coexist with another primary event (e.g. FLOW_INTERRUPTION).
 * It is surfaced as a flag in RuleResult rather than overriding the primary event.
 */
@Component
public class LowVolumeRule {

    private final SmartIvProperties props;

    public LowVolumeRule(SmartIvProperties props) {
        this.props = props;
    }

    public boolean matches(RuleContext ctx) {
        Double pct = ctx.getPercentRemaining();
        if (pct == null) return false;
        return pct <= props.getRules().getLowVolumeThresholdPercent();
    }

    public IvEvent.EventType getEventType() {
        return IvEvent.EventType.LOW_VOLUME;
    }
}
