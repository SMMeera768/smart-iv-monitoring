CREATE TABLE calibrations (
    id                     BIGSERIAL PRIMARY KEY,
    bed_id                 BIGINT       NOT NULL REFERENCES beds(id),
    device_id              BIGINT       NOT NULL REFERENCES devices(id),
    channel_id             VARCHAR(50)  NOT NULL,
    calibration_factor     DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    zero_offset            DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    known_reference_weight DOUBLE PRECISION,
    calibrated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    calibrated_by          BIGINT REFERENCES users(id),
    notes                  TEXT,
    active                 BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE bag_sessions (
    id              BIGSERIAL PRIMARY KEY,
    session_uuid    UUID         NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    bed_id          BIGINT       NOT NULL REFERENCES beds(id),
    initial_weight  DOUBLE PRECISION NOT NULL,
    baseline_weight DOUBLE PRECISION NOT NULL,
    tare_weight     DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    start_time      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    end_time        TIMESTAMPTZ,
    active          BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_calibrations_bed ON calibrations(bed_id, active);
CREATE INDEX idx_bag_sessions_bed ON bag_sessions(bed_id, active);
