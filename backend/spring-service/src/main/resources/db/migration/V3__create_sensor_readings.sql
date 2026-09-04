CREATE TABLE sensor_readings (
    id                 BIGSERIAL PRIMARY KEY,
    bed_id             BIGINT       NOT NULL REFERENCES beds(id),
    device_id          BIGINT       NOT NULL REFERENCES devices(id),
    channel_id         VARCHAR(50)  NOT NULL,
    sequence_number    BIGINT,
    raw_adc_value      BIGINT,
    raw_weight         DOUBLE PRECISION NOT NULL,
    timestamp_device   TIMESTAMPTZ,
    timestamp_server   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    packet_status      VARCHAR(50)  NOT NULL DEFAULT 'RECEIVED'
                           CHECK (packet_status IN ('RECEIVED','VALID','INVALID','STALE','DUPLICATE')),
    valid              BOOLEAN      NOT NULL DEFAULT TRUE,
    validation_message TEXT
);

CREATE INDEX idx_sensor_readings_bed_ts ON sensor_readings(bed_id, timestamp_server DESC);
CREATE INDEX idx_sensor_readings_device ON sensor_readings(device_id, timestamp_server DESC);
