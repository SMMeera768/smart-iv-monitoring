package com.smartiv.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "calibrations")
public class Calibration {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "channel_id", nullable = false, length = 50)
    private String channelId;

    @Column(name = "calibration_factor", nullable = false)
    private double calibrationFactor = 1.0;

    @Column(name = "zero_offset", nullable = false)
    private double zeroOffset = 0.0;

    @Column(name = "known_reference_weight")
    private Double knownReferenceWeight;

    @Column(name = "calibrated_at", nullable = false)
    private Instant calibratedAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calibrated_by")
    private User calibratedBy;

    @Column
    private String notes;

    @Column(nullable = false)
    private boolean active = true;

    public Long getId() { return id; }
    public Bed getBed() { return bed; }
    public void setBed(Bed bed) { this.bed = bed; }
    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }
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
    public User getCalibratedBy() { return calibratedBy; }
    public void setCalibratedBy(User calibratedBy) { this.calibratedBy = calibratedBy; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
