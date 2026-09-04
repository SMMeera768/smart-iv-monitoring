package com.smartiv.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "sensor_readings")
public class SensorReading {

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

    @Column(name = "sequence_number")
    private Long sequenceNumber;

    @Column(name = "raw_adc_value")
    private Long rawAdcValue;

    /** Raw weight as received from ESP32 (grams). Never modified after storage. */
    @Column(name = "raw_weight", nullable = false)
    private double rawWeight;

    @Column(name = "timestamp_device")
    private Instant timestampDevice;

    @Column(name = "timestamp_server", nullable = false)
    private Instant timestampServer = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "packet_status", nullable = false, length = 50)
    private PacketStatus packetStatus = PacketStatus.RECEIVED;

    @Column(nullable = false)
    private boolean valid = true;

    @Column(name = "validation_message")
    private String validationMessage;

    public enum PacketStatus { RECEIVED, VALID, INVALID, STALE, DUPLICATE }

    public Long getId() { return id; }
    public Bed getBed() { return bed; }
    public void setBed(Bed bed) { this.bed = bed; }
    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }
    public String getChannelId() { return channelId; }
    public void setChannelId(String channelId) { this.channelId = channelId; }
    public Long getSequenceNumber() { return sequenceNumber; }
    public void setSequenceNumber(Long sequenceNumber) { this.sequenceNumber = sequenceNumber; }
    public Long getRawAdcValue() { return rawAdcValue; }
    public void setRawAdcValue(Long rawAdcValue) { this.rawAdcValue = rawAdcValue; }
    public double getRawWeight() { return rawWeight; }
    public void setRawWeight(double rawWeight) { this.rawWeight = rawWeight; }
    public Instant getTimestampDevice() { return timestampDevice; }
    public void setTimestampDevice(Instant timestampDevice) { this.timestampDevice = timestampDevice; }
    public Instant getTimestampServer() { return timestampServer; }
    public void setTimestampServer(Instant timestampServer) { this.timestampServer = timestampServer; }
    public PacketStatus getPacketStatus() { return packetStatus; }
    public void setPacketStatus(PacketStatus packetStatus) { this.packetStatus = packetStatus; }
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public String getValidationMessage() { return validationMessage; }
    public void setValidationMessage(String validationMessage) { this.validationMessage = validationMessage; }
}
