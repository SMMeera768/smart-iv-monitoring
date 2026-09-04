package com.smartiv.scheduler;

import com.smartiv.service.device.DeviceHealthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Lightweight scheduler that periodically checks device health.
 * Runs every 30 seconds — not high-frequency.
 */
@Component
public class DeviceHealthScheduler {

    private static final Logger log = LoggerFactory.getLogger(DeviceHealthScheduler.class);

    private final DeviceHealthService deviceHealthService;

    public DeviceHealthScheduler(DeviceHealthService deviceHealthService) {
        this.deviceHealthService = deviceHealthService;
    }

    @Scheduled(fixedDelayString = "${smartiv.scheduler.health-check-interval-ms:30000}")
    public void checkDeviceHealth() {
        log.debug("Running device health check");
        deviceHealthService.checkAllDevices();
    }
}
