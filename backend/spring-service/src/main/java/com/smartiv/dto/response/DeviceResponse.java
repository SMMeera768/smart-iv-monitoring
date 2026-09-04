package com.smartiv.dto.response;

import java.time.Instant;
import java.util.List;

public class DeviceResponse {

    private Long id;
    private String deviceCode;
    private String hardwareType;
    private String firmwareVersion;
    private String wifiStatus;
    private String deviceStatus;
    private Instant lastSeenAt;
    private Instant registeredAt;
    private boolean active;
    private List<String> associatedBeds;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }
    public String getHardwareType() { return hardwareType; }
    public void setHardwareType(String hardwareType) { this.hardwareType = hardwareType; }
    public String getFirmwareVersion() { return firmwareVersion; }
    public void setFirmwareVersion(String firmwareVersion) { this.firmwareVersion = firmwareVersion; }
    public String getWifiStatus() { return wifiStatus; }
    public void setWifiStatus(String wifiStatus) { this.wifiStatus = wifiStatus; }
    public String getDeviceStatus() { return deviceStatus; }
    public void setDeviceStatus(String deviceStatus) { this.deviceStatus = deviceStatus; }
    public Instant getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(Instant lastSeenAt) { this.lastSeenAt = lastSeenAt; }
    public Instant getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(Instant registeredAt) { this.registeredAt = registeredAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public List<String> getAssociatedBeds() { return associatedBeds; }
    public void setAssociatedBeds(List<String> associatedBeds) { this.associatedBeds = associatedBeds; }
}
