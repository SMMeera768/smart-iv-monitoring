package com.smartiv.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;

/**
 * Ingestion payload sent by the ESP32.
 * One packet may contain readings for both HX711 channels (BED_1 and BED_2).
 */
public class DeviceDataRequest {

    @NotBlank
    private String deviceId;

    /** Device-side timestamp — optional; server timestamp is always recorded. */
    private Instant timestamp;

    @NotEmpty
    @Valid
    private List<ChannelReading> readings;

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public List<ChannelReading> getReadings() { return readings; }
    public void setReadings(List<ChannelReading> readings) { this.readings = readings; }

    public static class ChannelReading {

        @NotBlank
        private String bedId;

        @NotBlank
        private String channelId;

        private Long sequenceNumber;

        @NotNull
        private Double weight;

        /** Raw ADC value — optional; included when firmware exposes it. */
        private Long rawAdc;

        public String getBedId() { return bedId; }
        public void setBedId(String bedId) { this.bedId = bedId; }
        public String getChannelId() { return channelId; }
        public void setChannelId(String channelId) { this.channelId = channelId; }
        public Long getSequenceNumber() { return sequenceNumber; }
        public void setSequenceNumber(Long sequenceNumber) { this.sequenceNumber = sequenceNumber; }
        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }
        public Long getRawAdc() { return rawAdc; }
        public void setRawAdc(Long rawAdc) { this.rawAdc = rawAdc; }
    }
}
