package com.smartiv.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CalibrationRequest {

    @NotBlank(message = "Channel ID is required")
    private String channelId;

    @NotNull(message = "Calibration factor is required")
    private Double calibrationFactor;

    private Double zeroOffset = 0.0;

    private Double knownReferenceWeight;

    private String notes;

    public String getChannelId() { return channelId; }
    public void setChannelId(String channelId) { this.channelId = channelId; }
    public Double getCalibrationFactor() { return calibrationFactor; }
    public void setCalibrationFactor(Double calibrationFactor) { this.calibrationFactor = calibrationFactor; }
    public Double getZeroOffset() { return zeroOffset; }
    public void setZeroOffset(Double zeroOffset) { this.zeroOffset = zeroOffset; }
    public Double getKnownReferenceWeight() { return knownReferenceWeight; }
    public void setKnownReferenceWeight(Double knownReferenceWeight) { this.knownReferenceWeight = knownReferenceWeight; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
