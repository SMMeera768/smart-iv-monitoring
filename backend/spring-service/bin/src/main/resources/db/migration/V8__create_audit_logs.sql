CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    timestamp       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    user_id         BIGINT REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100),
    entity_id       VARCHAR(100),
    bed_id          BIGINT REFERENCES beds(id),
    previous_value  TEXT,
    new_value       TEXT,
    result          VARCHAR(50)  NOT NULL DEFAULT 'SUCCESS',
    metadata        JSONB
);

CREATE INDEX idx_audit_logs_ts ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, timestamp DESC);
