package com.smartiv.service.device;

import com.smartiv.config.SmartIvProperties;
import com.smartiv.entity.Device;
import com.smartiv.repository.DeviceRepository;
import com.smartiv.state.BedRuntimeState;
import com.smartiv.state.BedStateManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Tracks ESP32 connectivity and marks devices OFFLINE when no packet
 * has been received within the configured timeout.
 *
 * Stale data is never presented as current — the frontend receives
 * dataFresh=false and deviceStatus=OFFLINE when the device is silent.
 */
@Service
public class DeviceHealthService {

    private static final Logger log = LoggerFactory.getLogger(DeviceHealthService.class);

    private final DeviceRepository deviceRepository;
    private final BedStateManager stateManager;
    private final SmartIvProperties props;

    public DeviceHealthService(DeviceRepository deviceRepository,
                                BedStateManager stateManager,
                                SmartIvProperties props) {
        this.deviceRepository = deviceRepository;
        this.stateManager = stateManager;
        this.props = props;
    }

    /**
     * Called by the scheduler. Checks all devices and updates status.
     */
    @Transactional
    public void checkAllDevices() {
        List<Device> devices = deviceRepository.findAll();
        Instant now = Instant.now();
        long timeoutMs = props.getDevice().getOfflineTimeoutMs();

        for (Device device : devices) {
            Instant lastSeen = device.getLastSeenAt();
            if (lastSeen == null) {
                markOffline(device, now);
                continue;
            }
            long elapsed = Duration.between(lastSeen, now).toMillis();
            if (elapsed > timeoutMs) {
                markOffline(device, now);
            } else if (elapsed > timeoutMs / 2) {
                markDegraded(device);
            } else {
                markOnline(device);
            }
        }
    }

    /**
     * Called by IngestionService when a valid packet arrives.
     */
    @Transactional
    public void recordHeartbeat(Device device) {
        device.setLastSeenAt(Instant.now());
        device.setDeviceStatus(Device.DeviceStatus.ONLINE);
        deviceRepository.save(device);
    }

    private void markOffline(Device device, Instant now) {
        if (device.getDeviceStatus() != Device.DeviceStatus.OFFLINE) {
            log.warn("Device {} marked OFFLINE — no heartbeat since {}",
                    device.getDeviceCode(), device.getLastSeenAt());
        }
        device.setDeviceStatus(Device.DeviceStatus.OFFLINE);
        deviceRepository.save(device);

        // Mark all beds associated with this device as offline in runtime state
        stateManager.getAllStates().forEach(state -> state.setDeviceOnline(false));
    }

    private void markDegraded(Device device) {
        device.setDeviceStatus(Device.DeviceStatus.DEGRADED);
        deviceRepository.save(device);
    }

    private void markOnline(Device device) {
        if (device.getDeviceStatus() != Device.DeviceStatus.ONLINE) {
            device.setDeviceStatus(Device.DeviceStatus.ONLINE);
            deviceRepository.save(device);
        }
    }
}
