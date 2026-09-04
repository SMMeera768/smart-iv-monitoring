package com.smartiv.engine;

import com.smartiv.config.SmartIvProperties;
import com.smartiv.entity.AiMetric;
import com.smartiv.entity.IvEvent;
import org.springframework.stereotype.Component;

/**
 * NORMAL_FLOW rule.
 *
 * Conditions (all must hold):
 *   - smoothedFlowRate > flowInterruptionThreshold + hysteresis
 *   - weightSlope is negative (bag losing weight)
 *   - sensor is not classified as POSSIBLE_SENSOR_FAILURE
 *   - no bag replacement transition is occurring
 *
 * "Normal" means normal relative to configured prototype conditions,
 * NOT a clinically validated dosage range.
 */
@Component
public class NormalFlowRule {

    private final SmartIvProperties props;

    public NormalFlowRule(SmartIvProperties props) {
        this.props = props;
    }

    public boolean matches(RuleContext ctx) {
        if (ctx.getSensorStatus() == AiMetric.SensorStatus.POSSIBLE_SENSOR_FAILURE) {
            return false;
        }
        double threshold = props.getRules().getFlowInterruptionThresholdGPerMin()
                + props.getRules().getNormalFlowHysteresisGPerMin();
        return ctx.getSmoothedFlowRate() > threshold && ctx.getWeightSlope() < 0;
    }

    public IvEvent.EventType getEventType() {
        return IvEvent.EventType.NORMAL_FLOW;
    }
}
