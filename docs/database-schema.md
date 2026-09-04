# PostgreSQL Database Schema
## Entity Relationship and Migration Strategy

The system enforces versioned Flyway database migrations (`V1` to `V9`).
Hibernate is configured with `ddl-auto: validate` so that schema structure is strictly governed by migration scripts.

### 1. Tables Overview
| Table Name | Primary Purpose | Key Indexes |
|---|---|---|
| `users` | Role-based system accounts | `username`, `email` |
| `devices` | Physical ESP32 microcontrollers | `device_code` |
| `beds` | Monitored IV bag stations | `bed_code` |
| `device_channel_mappings`| Links HX711 channel to bed | `(device_id, channel_id)` |
| `sensor_readings` | Raw telemetry points (immutable) | `(bed_id, timestamp_server)` |
| `calibrations` | Per-channel calibration offsets | `(bed_id, active)` |
| `bag_sessions` | Infusion session tracking | `(bed_id, active)` |
| `derived_features` | Extracted signal processing features | `(bed_id, timestamp)` |
| `iv_events` | Detected workflow events | `(bed_id, start_time)`, `status` |
| `alerts` | Notification records with evidence | `(status, created_at)`, `bed_id` |
| `ai_metrics` | Recorded inference from Python service | `(bed_id, timestamp)` |
| `system_configuration` | Dynamic key-value thresholds | `config_key` |
| `audit_logs` | Audit trail for changes and alerts | `timestamp` |

### 2. Immutability of Raw Data
The `sensor_readings` table stores raw weight and ADC values exactly as delivered from the microcontroller. Raw readings are never modified or overwritten after moving average filtering.
