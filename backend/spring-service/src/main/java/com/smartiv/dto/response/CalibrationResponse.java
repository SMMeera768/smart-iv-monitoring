package com.smartiv.dto.response;

import java.time.Instant;

public class CalibrationResponse {

    private Long id;
    private String bedCode;
    private String deviceCode;
    private String channelId;
    private double calibrationFactor;
    private double zeroOffset;
    private Double knownReferenceWeight;
    private Instant calibratedAt;
    private String calibratedBy;
    private String notes;
    private boolean active;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBedCode() { return bedCode; }
    public void setBedCode(String bedCode) { this.bedCode = bedCode; }
    public String getDeviceCode() { return deviceCode; }
    public void setDeviceCode(String deviceCode) { this.deviceCode = deviceCode; }
    public String getChannelId() { return channelId; }
    public void setChannelId(String channelId) { this.channelId = channelId; }
    public double getCalibrationFactor() { return calibrationFactor; }
    public void setCalibrationFactor(double calibrationFactor) { this.calibrationFactor = calibrationFactor; }
    public double getZeroOffset() { return zeroOffset; }
    public void setZeroOffset(double zeroOffset) { this.zeroOffset = zeroOffset; }
    public Double getKnownReferenceWeight() { return knownReferenceWeight; }
    public void setKnownReferenceWeight(Double knownReferenceWeight) { this.knownReferenceWeight = knownReferenceWeight; }
    public Instant getCalibratedAt() { return calibratedAt; }
    public void setCalibratedAt(Instant calibratedAt) { this.calibratedAt = calibratedAt; }
    public String getCalibratedBy() { return calibratedBy; }
    public void setCalibratedBy(String calibratedBy) { this.calibratedBy = calibratedBy; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
