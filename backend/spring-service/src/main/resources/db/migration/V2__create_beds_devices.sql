CREATE TABLE devices (
    id               BIGSERIAL PRIMARY KEY,
    device_code      VARCHAR(100) NOT NULL UNIQUE,
    hardware_type    VARCHAR(100) NOT NULL DEFAULT 'ESP32',
    firmware_version VARCHAR(50),
    wifi_status      VARCHAR(50),
    device_status    VARCHAR(50)  NOT NULL DEFAULT 'OFFLINE'
                         CHECK (device_status IN ('ONLINE','DEGRADED','OFFLINE')),
    last_seen_at     TIMESTAMPTZ,
    registered_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    active           BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE beds (
    id                BIGSERIAL PRIMARY KEY,
    bed_code          VARCHAR(50)  NOT NULL UNIQUE,
    name              VARCHAR(100) NOT NULL,
    active            BOOLEAN      NOT NULL DEFAULT TRUE,
    current_device_id BIGINT REFERENCES devices(id),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Channel mapping: which HX711 channel belongs to which bed on which device
CREATE TABLE device_channel_mappings (
    id          BIGSERIAL PRIMARY KEY,
    device_id   BIGINT NOT NULL REFERENCES devices(id),
    bed_id      BIGINT NOT NULL REFERENCES beds(id),
    channel_id  VARCHAR(50) NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (device_id, channel_id)
);

CREATE INDEX idx_beds_bed_code ON beds(bed_code);
CREATE INDEX idx_devices_device_code ON devices(device_code);
