CREATE TABLE derived_features (
    id                  BIGSERIAL PRIMARY KEY,
    reading_id          BIGINT REFERENCES sensor_readings(id),
    bed_id              BIGINT       NOT NULL REFERENCES beds(id),
    timestamp           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    filtered_weight     DOUBLE PRECISION,
    weight_change       DOUBLE PRECISION,
    flow_rate           DOUBLE PRECISION,
    smoothed_flow_rate  DOUBLE PRECISION,
    weight_slope        DOUBLE PRECISION,
    standard_deviation  DOUBLE PRECISION,
    rolling_variance    DOUBLE PRECISION,
    signal_noise        DOUBLE PRECISION,
    percent_remaining   DOUBLE PRECISION,
    baseline            DOUBLE PRECISION,
    drift_score         DOUBLE PRECISION,
    anomaly_score       DOUBLE PRECISION
);

CREATE TABLE iv_events (
    id                  BIGSERIAL PRIMARY KEY,
    event_uuid          UUID         NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    bed_id              BIGINT       NOT NULL REFERENCES beds(id),
    device_id           BIGINT       NOT NULL REFERENCES devices(id),
    event_type          VARCHAR(50)  NOT NULL
                            CHECK (event_type IN (
                                'NORMAL_FLOW','FLOW_INTERRUPTION','LOW_VOLUME',
                                'BAG_REPLACEMENT','SENSOR_DRIFT','SENSOR_FAILURE'
                            )),
    detected_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    start_time          TIMESTAMPTZ  NOT NULL,
    end_time            TIMESTAMPTZ,
    duration_ms         BIGINT,
    severity            VARCHAR(20)  NOT NULL DEFAULT 'LOW'
                            CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    evidence_score      INTEGER      NOT NULL DEFAULT 0 CHECK (evidence_score BETWEEN 0 AND 100),
    explanation         TEXT,
    triggering_features JSONB,
    status              VARCHAR(30)  NOT NULL DEFAULT 'DETECTED'
                            CHECK (status IN ('DETECTED','ACKNOWLEDGED','RESOLVED')),
    acknowledged_by     BIGINT REFERENCES users(id),
    acknowledged_at     TIMESTAMPTZ,
    resolved_by         BIGINT REFERENCES users(id),
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE alerts (
    id              BIGSERIAL PRIMARY KEY,
    alert_uuid      UUID         NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    bed_id          BIGINT       NOT NULL REFERENCES beds(id),
    event_id        BIGINT REFERENCES iv_events(id),
    alert_type      VARCHAR(100) NOT NULL,
    severity        VARCHAR(20)  NOT NULL CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    evidence_score  INTEGER      NOT NULL DEFAULT 0 CHECK (evidence_score BETWEEN 0 AND 100),
    message         TEXT         NOT NULL,
    status          VARCHAR(30)  NOT NULL DEFAULT 'OPEN'
                        CHECK (status IN ('OPEN','ACKNOWLEDGED','RESOLVED')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by BIGINT REFERENCES users(id),
    resolved_at     TIMESTAMPTZ,
    resolved_by     BIGINT REFERENCES users(id)
);

CREATE INDEX idx_iv_events_bed_start ON iv_events(bed_id, start_time DESC);
CREATE INDEX idx_iv_events_status ON iv_events(status);
CREATE INDEX idx_alerts_status_created ON alerts(status, created_at DESC);
CREATE INDEX idx_alerts_bed ON alerts(bed_id, status);
