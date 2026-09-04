CREATE TABLE ai_metrics (
    id                    BIGSERIAL PRIMARY KEY,
    bed_id                BIGINT       NOT NULL REFERENCES beds(id),
    timestamp             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    model_version         VARCHAR(100),
    anomaly_score         DOUBLE PRECISION,
    drift_score           DOUBLE PRECISION,
    drift_status          VARCHAR(50)  CHECK (drift_status IN ('NORMAL','POSSIBLE_DRIFT','POSSIBLE_SENSOR_FAILURE','AI_UNAVAILABLE')),
    failure_status        VARCHAR(50)  CHECK (failure_status IN ('NORMAL','POSSIBLE_DRIFT','POSSIBLE_SENSOR_FAILURE','AI_UNAVAILABLE')),
    supporting_features   JSONB,
    inference_latency_ms  INTEGER
);

CREATE INDEX idx_ai_metrics_bed_ts ON ai_metrics(bed_id, timestamp DESC);
