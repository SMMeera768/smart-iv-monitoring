package com.smartiv.repository;

import com.smartiv.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findByDeviceCode(String deviceCode);
    Optional<Device> findByDeviceCodeAndActiveTrue(String deviceCode);
    long countByDeviceStatus(Device.DeviceStatus status);
}
