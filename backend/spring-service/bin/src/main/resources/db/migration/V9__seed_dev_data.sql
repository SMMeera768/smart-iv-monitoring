-- Development seed data — NOT for production/research use.
-- Insert only if not already present (idempotent).

INSERT INTO devices (device_code, hardware_type, firmware_version, device_status)
VALUES ('ESP32_01', 'ESP32', 'v1.0.0', 'OFFLINE')
ON CONFLICT (device_code) DO NOTHING;

INSERT INTO beds (bed_code, name, active)
VALUES
    ('BED_1', 'Bed 1', TRUE),
    ('BED_2', 'Bed 2', TRUE)
ON CONFLICT (bed_code) DO NOTHING;

-- Map channels to beds on the single ESP32
INSERT INTO device_channel_mappings (device_id, bed_id, channel_id, active)
SELECT d.id, b.id, 'HX711_1', TRUE
FROM devices d, beds b
WHERE d.device_code = 'ESP32_01' AND b.bed_code = 'BED_1'
ON CONFLICT (device_id, channel_id) DO NOTHING;

INSERT INTO device_channel_mappings (device_id, bed_id, channel_id, active)
SELECT d.id, b.id, 'HX711_2', TRUE
FROM devices d, beds b
WHERE d.device_code = 'ESP32_01' AND b.bed_code = 'BED_2'
ON CONFLICT (device_id, channel_id) DO NOTHING;

-- Update beds to reference the device
UPDATE beds SET current_device_id = (SELECT id FROM devices WHERE device_code = 'ESP32_01')
WHERE bed_code IN ('BED_1', 'BED_2');

-- Default calibrations (identity — must be replaced with real calibration)
INSERT INTO calibrations (bed_id, device_id, channel_id, calibration_factor, zero_offset, notes, active)
SELECT b.id, d.id, 'HX711_1', 1.0, 0.0, 'DEFAULT — replace with real calibration', TRUE
FROM beds b, devices d
WHERE b.bed_code = 'BED_1' AND d.device_code = 'ESP32_01'
ON CONFLICT DO NOTHING;

INSERT INTO calibrations (bed_id, device_id, channel_id, calibration_factor, zero_offset, notes, active)
SELECT b.id, d.id, 'HX711_2', 1.0, 0.0, 'DEFAULT — replace with real calibration', TRUE
FROM beds b, devices d
WHERE b.bed_code = 'BED_2' AND d.device_code = 'ESP32_01'
ON CONFLICT DO NOTHING;

-- Seed admin user (password: 'changeme' — bcrypt hash, dev only)
INSERT INTO users (username, email, password_hash, role, active)
VALUES ('admin', 'admin@smartiv.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', 'ADMINISTRATOR', TRUE)
ON CONFLICT (username) DO NOTHING;
