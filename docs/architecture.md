# Architecture Specification
## Smart Multi-Bed IV Workflow & Event Monitoring Platform

### 1. Executive Summary & IEEE Research Scope
This platform is a **research prototype** designed for continuous, non-invasive monitoring of intravenous (IV) infusion workflows and load-cell sensor integrity across multiple beds.

> [!IMPORTANT]
> **Regulatory Notice**: This system is NOT a certified medical device. It must NOT make clinical treatment decisions, diagnose patients, or claim clinical efficacy without extensive medical trials.

### 2. High-Level Data Flow
```
+-------------------------------------------------------------+
|                      PHYSICAL SENSORS                       |
|  [IV Bag 1] --> [1kg Load Cell 1] --> [HX711 Channel 1]     |
|  [IV Bag 2] --> [1kg Load Cell 2] --> [HX711 Channel 2]     |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    MICROCONTROLLER LAYER                    |
|                        Single ESP32                         |
|   - 1 Hz Telemetry loop                                     |
|   - Multi-channel packaging                                 |
|   - HTTP POST /api/device/data over Wi-Fi                   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                  SPRING BOOT CENTRAL BACKEND                |
|                    (Central System of Record)               |
|                                                             |
|  1. Packet Validation & Ingestion                           |
|  2. Raw Reading Persistence (Never overwritten)             |
|  3. Moving Average Filtering                                |
|  4. Feature Extraction (Slope, Variance, Noise, Baseline)   |
|  5. Mass Flow Rate Estimation (g/min)                       |
|  6. Rule-Based IV Event Engine                              |
|     (NORMAL_FLOW, FLOW_INTERRUPTION, LOW_VOLUME, REPLACEMENT)|
|  7. AI HTTP Client -> Fast-API Sensor Health Service        |
|  8. Explainable Evidence Scoring (0–100)                    |
|  9. Alert Lifecycle & Audit Engine                          |
| 10. PostgreSQL Storage (via Flyway Migrations V1-V9)        |
| 11. REST API Endpoints                                      |
+---------------+-----------------------------+---------------+
                |                             |
                v                             v
+-------------------------------+  +--------------------------+
|       PYTHON AI SERVICE       |  |     WEB DASHBOARD UI     |
|   (Sensor Health & Drift)     |  |         (React SPA)      |
|                               |  |                          |
| - Isolation Forest            |  | - Displays backend state |
| - Normalized Anomaly Index    |  | - No scientific math in  |
| - Deterministic Drift Score   |  |   the frontend           |
| - Stuck Signal Health Checks  |  | - Evidence breakdown     |
| - Fallback Resilience         |  | - Dual Mock/Live modes   |
+-------------------------------+  +--------------------------+
```

### 3. Responsibility Separation
- **ESP32**: Acquire analog load-cell voltages, convert via 24-bit ADCs, package with channel identifiers, and transmit reliably to Spring Boot. No high-level classification.
- **Spring Boot**: Authoritative source of truth for runtime bed state, signal filtering, derived feature calculations, IV event rules, alert lifecycles, configuration, calibration, and database audit logs.
- **Python AI Service**: Confined strictly to **Sensor Health** (drift, stuck signals, noise, mechanical failure). Does NOT classify infusion events.
- **Frontend**: Renders server-calculated telemetry, visualizes trends, presents evidence factors, and provides care-team workflows (Acknowledge, Resolve, Tare).
