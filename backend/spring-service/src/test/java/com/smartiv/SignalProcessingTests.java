package com.smartiv;

import com.smartiv.config.SmartIvProperties;
import com.smartiv.service.flow.FlowRateService;
import com.smartiv.service.processing.SignalFilterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

public class SignalProcessingTests {

    private SignalFilterService filterService;
    private FlowRateService flowService;
    private SmartIvProperties properties;

    @BeforeEach
    void setUp() {
        properties = new SmartIvProperties();
        properties.getSignal().setMovingAverageWindow(5);
        properties.getSignal().setFlowSmoothingWindow(3);

        filterService = new SignalFilterService(properties);
        flowService = new FlowRateService(properties);
    }

    @Test
    void testMovingAverageComputation() {
        double[] window = {100.0, 102.0, 98.0, 100.0, 100.0};
        SignalFilterService.FilterResult result = filterService.compute(window);

        assertNotNull(result);
        assertEquals(100.0, result.getFilteredWeight(), 0.001);
        assertFalse(result.isWarmUp());
    }

    @Test
    void testMovingAverageWarmUp() {
        double[] shortWindow = {100.0, 102.0};
        SignalFilterService.FilterResult result = filterService.compute(shortWindow);

        assertNotNull(result);
        assertTrue(result.isWarmUp());
        assertEquals(101.0, result.getFilteredWeight(), 0.001);
    }

    @Test
    void testInstantaneousFlowRate() {
        Instant t1 = Instant.parse("2026-09-04T10:00:00Z");
        Instant t2 = Instant.parse("2026-09-04T10:01:00Z"); // 60 seconds later

        // Decreasing weight: 500g -> 498g (-2g in 1 min => +2.0 g/min)
        double flow = flowService.computeInstantaneous(500.0, 498.0, t1, t2);
        assertEquals(2.0, flow, 0.01);
    }

    @Test
    void testPercentRemainingCalculation() {
        Double percent = flowService.computePercentRemaining(250.0, 500.0, 0.0);
        assertNotNull(percent);
        assertEquals(50.0, percent, 0.01);
    }
}
