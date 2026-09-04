package com.smartiv.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "devices")
public class Device {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_code", nullable = false, unique = true, length = 100)
    private String deviceCode;

    @Column(name = "hardware_type", nullable = false, length = 100)
    private String hardwareType = "ESP32";

    @Column(name = "firmware_version", length = 50)
    private String firmwareVersion;

    @Column(name = "wifi_status", length = 50)
    private String wifiStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_status", nullable = false, length = 50)
    private DeviceStatus deviceStatus = DeviceStatus.OFFLINE;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @Column(name = "registered_at", nullable = false, updatable = false)
    private Instant registeredAt = Instant.now();

    @Column(nullable = false)
    private boolean active = true;

    public enum DeviceStatus { ONLINE, DEGRADED, OFFLINE }

    public Long getId() { return id; }
    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }
    public String getHardwareType() { return hardwareType; }
    public void setHardwareType(String hardwareType) { this.hardwareType = hardwareType; }
    public String getFirmwareVersion() { return firmwareVersion; }
    public void setFirmwareVersion(String firmwareVersion) { this.firmwareVersion = firmwareVersion; }
    public String getWifiStatus() { return wifiStatus; }
    public void setWifiStatus(String wifiStatus) { this.wifiStatus = wifiStatus; }
    public DeviceStatus getDeviceStatus() { return deviceStatus; }
    public void setDeviceStatus(DeviceStatus deviceStatus) { this.deviceStatus = deviceStatus; }
    public Instant getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(Instant lastSeenAt) { this.lastSeenAt = lastSeenAt; }
    public Instant getRegisteredAt() { return registeredAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
