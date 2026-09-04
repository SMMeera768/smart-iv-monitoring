package com.smartiv.dto.response;

import java.time.Instant;
import java.util.List;

public class DashboardSummaryResponse {

    private String systemStatus;
    private int totalBeds;
    private int normalBeds;
    private int activeAlerts;

    /** Physical ESP32 devices online — distinct from sensor channels. */
    private int physicalDevicesOnline;

    /** Sensor channels currently receiving data. */
    private int sensorChannelsOnline;

    private List<BedStatusResponse> beds;
    private Instant timestamp;

    public String getSystemStatus() { return systemStatus; }
    public void setSystemStatus(String systemStatus) { this.systemStatus = systemStatus; }
    public int getTotalBeds() { return totalBeds; }
    public void setTotalBeds(int totalBeds) { this.totalBeds = totalBeds; }
    public int getNormalBeds() { return normalBeds; }
    public void setNormalBeds(int normalBeds) { this.normalBeds = normalBeds; }
    public int getActiveAlerts() { return activeAlerts; }
    public void setActiveAlerts(int activeAlerts) { this.activeAlerts = activeAlerts; }
    public int getPhysicalDevicesOnline() { return physicalDevicesOnline; }
    public void setPhysicalDevicesOnline(int physicalDevicesOnline) { this.physicalDevicesOnline = physicalDevicesOnline; }
    public int getSensorChannelsOnline() { return sensorChannelsOnline; }
    public void setSensorChannelsOnline(int sensorChannelsOnline) { this.sensorChannelsOnline = sensorChannelsOnline; }
    public List<BedStatusResponse> getBeds() { return beds; }
    public void setBeds(List<BedStatusResponse> beds) { this.beds = beds; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
