CREATE TABLE system_configuration (
    id          BIGSERIAL PRIMARY KEY,
    config_key  VARCHAR(200) NOT NULL UNIQUE,
    config_value TEXT        NOT NULL,
    description TEXT,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_by  BIGINT REFERENCES users(id)
);

-- Seed default configuration values.
-- All threshold values are EXPERIMENTAL DEFAULTS — must be validated experimentally.
INSERT INTO system_configuration (config_key, config_value, description) VALUES
('signal.movingAverageWindow',       '10',      'Moving average filter window size (samples) — EXPERIMENTAL'),
('signal.flowSmoothingWindow',       '5',       'Flow rate smoothing window (samples) — EXPERIMENTAL'),
('signal.featureWindow',             '20',      'Feature extraction rolling window (samples) — EXPERIMENTAL'),
('signal.baselineWindow',            '60',      'Baseline estimation window (samples) — EXPERIMENTAL'),
('rules.flowInterruptionThreshold',  '0.5',     'Near-zero flow threshold (g/min) — EXPERIMENTAL'),
('rules.flowInterruptionMinDuration','120000',  'Min duration for flow interruption (ms) — EXPERIMENTAL'),
('rules.lowVolumeThreshold',         '15.0',    'Low volume alert threshold (% remaining) — EXPERIMENTAL'),
('rules.bagReplacementWeightJump',   '50.0',    'Min weight jump for bag replacement (g) — EXPERIMENTAL'),
('rules.bagReplacementStability',    '30000',   'Post-jump stability duration (ms) — EXPERIMENTAL'),
('ai.anomalyThreshold',              '0.6',     'Normalized anomaly index threshold — EXPERIMENTAL'),
('ai.driftThreshold',                '0.5',     'Drift score threshold — EXPERIMENTAL'),
('device.offlineTimeoutMs',          '300000',  'Device offline timeout (ms)');
