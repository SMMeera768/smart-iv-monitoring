package com.smartiv;

import com.smartiv.config.SmartIvProperties;
import com.smartiv.engine.*;
import com.smartiv.entity.AiMetric;
import com.smartiv.entity.IvEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

public class RuleEngineTests {

    private RuleEngine ruleEngine;
    private SmartIvProperties props;

    @BeforeEach
    void setUp() {
        props = new SmartIvProperties();
        props.getRules().setFlowInterruptionThresholdGPerMin(0.5);
        props.getRules().setFlowInterruptionMinDurationMs(120000L); // 2 minutes
        props.getRules().setLowVolumeThresholdPercent(15.0);
        props.getRules().setBagReplacementWeightJumpG(50.0);
        props.getRules().setBagReplacementStabilityDurationMs(30000L);

        NormalFlowRule normalRule = new NormalFlowRule(props);
        FlowInterruptionRule interruptionRule = new FlowInterruptionRule(props);
        LowVolumeRule lowVolumeRule = new LowVolumeRule(props);
        BagReplacementRule bagReplacementRule = new BagReplacementRule(props);

        ruleEngine = new RuleEngine(normalRule, interruptionRule, lowVolumeRule, bagReplacementRule);
    }

    @Test
    void testNormalFlowDetected() {
        RuleContext ctx = new RuleContext(
                "BED_1", Instant.now(),
                450.0, -0.05, -2.0,
                2.1, 2.0,
                0.1, 0.01, 0.05,
                75.0, 0.02,
                AiMetric.SensorStatus.NORMAL, 0.1,
                null
        );

        RuleResult res = ruleEngine.evaluate(ctx);
        assertEquals(IvEvent.EventType.NORMAL_FLOW, res.getDeterminedEventType());
        assertTrue(res.isCandidateConfirmed());
    }

    @Test
    void testFlowInterruptionRequiresPersistence() {
        Instant now = Instant.now();
        // Zero flow, candidate start time just 10 seconds ago (< 120s)
        RuleContext ctxEarly = new RuleContext(
                "BED_1", now,
                450.0, 0.0, 0.0,
                0.0, 0.05,
                0.05, 0.002, 0.02,
                75.0, 0.01,
                AiMetric.SensorStatus.NORMAL, 0.1,
                now.minusSeconds(10)
        );

        RuleResult resEarly = ruleEngine.evaluate(ctxEarly);
        assertEquals(IvEvent.EventType.FLOW_INTERRUPTION, resEarly.getDeterminedEventType());
        assertFalse(resEarly.isCandidateConfirmed()); // Not yet reached 2 min

        // Now with candidate start time 130 seconds ago (> 120s)
        RuleContext ctxLate = new RuleContext(
                "BED_1", now,
                450.0, 0.0, 0.0,
                0.0, 0.05,
                0.05, 0.002, 0.02,
                75.0, 0.01,
                AiMetric.SensorStatus.NORMAL, 0.1,
                now.minusSeconds(130)
        );

        RuleResult resLate = ruleEngine.evaluate(ctxLate);
        assertEquals(IvEvent.EventType.FLOW_INTERRUPTION, resLate.getDeterminedEventType());
        assertTrue(resLate.isCandidateConfirmed());
    }

    @Test
    void testLowVolumeRuleTrigger() {
        RuleContext ctx = new RuleContext(
                "BED_1", Instant.now(),
                50.0, -0.05, -1.8,
                1.9, 1.8,
                0.1, 0.01, 0.05,
                10.0, // 10% <= 15% threshold
                0.02,
                AiMetric.SensorStatus.NORMAL, 0.1,
                null
        );

        RuleResult res = ruleEngine.evaluate(ctx);
        assertTrue(res.isLowVolumeFlag());
    }

    @Test
    void testBagReplacementLargeWeightJump() {
        Instant now = Instant.now();
        // Positive weight jump of 350g, stable for 35s
        RuleContext ctx = new RuleContext(
                "BED_1", now,
                500.0, 350.0, 0.0,
                0.0, 0.0,
                0.08, 0.005, 0.03,
                100.0, 0.01,
                AiMetric.SensorStatus.NORMAL, 0.1,
                now.minusSeconds(35)
        );

        RuleResult res = ruleEngine.evaluate(ctx);
        assertEquals(IvEvent.EventType.BAG_REPLACEMENT, res.getDeterminedEventType());
        assertTrue(res.isCandidateConfirmed());
    }
}
