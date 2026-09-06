# SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM

> **Research Proof-of-Concept (POC) — Software Platform**  
> Complete software-only implementation ready for post-validation hardware integration.

---

## 1. Project Overview & Scope Boundary

This repository contains the software layer for a dual-bed clinical IV infusion monitoring platform designed to ingest gravimetric load-cell telemetry, track mass reduction slopes, identify adverse infusion events, and assist healthcare staff with evidence-based triage.

### Hardware Independence Principle (Section 3 & 39)
The hardware engineering team is independently developing and testing the physical rig:
- ESP32 DevKit V1 / ESP-WROOM-32
- 2 × HX711 24-bit ADC modules
- 2 × 1 kg load cells with dedicated mounting hooks
- Physical IV drip chambers and calibration weights

**Software Boundary:** This software runs fully independently using controlled test payloads and centralized synthetic data. No physical ESP32 or HX711 hardware is required to run, test, or evaluate this platform. No experimental performance metrics are claimed as validated until physical laboratory trials are completed.

---

## 2. Software Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React Frontend                       │
│    (Two-Bed Clinical Console, Charts, RBAC, Adapters)  │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│              Java Spring Boot Backend                  │
│    (Controllers, Rule Engine, Signal Filter, DB)       │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐   ┌────────────────────────┐
│    PostgreSQL + Flyway    │   │  Python AI Service     │
│   (Readings, Events, DB)  │   │  (Isolation Forest)    │
└───────────────────────────┘   └────────────────────────┘
```

> **Strict Isolation Rule:** The frontend never connects directly to PostgreSQL. The frontend only displays data, visualizes trends, presents algorithmic explanations and evidence scores, and sends staff actions.

---

## 3. Frontend Architecture & Views

The frontend is built with **React + Vite** and includes a complete clinical workflow system across 10 specialized views:

| View | Purpose & Role Access |
|---|---|
| **Two-Bed Dashboard** | Side-by-side Bed 1 & Bed 2 real-time cards with drip gauge fill level, flow status, 13 telemetry fields, and quick action controls (*Nurse, Doctor, Admin*). |
| **Active Alerts & Triage** | Full alert lifecycle queue (`DETECTED` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `RESOLVED`) with evidence confidence scores (*Nurse, Admin*). |
| **IV Workflow Events** | Comprehensive log of clinical events (`NORMAL_FLOW`, `LOW_VOLUME`, `FLOW_INTERRUPTION`, `BAG_REPLACEMENT`, `SENSOR_DRIFT`) with drill-down modal (*Doctor, Admin*). |
| **Operational Analytics** | Fleet overview: event counts, alerts by severity, event type frequency, and bed comparison (*Doctor, Admin*). |
| **Device & Sensor Health** | Telemetry health cards for **BED 1 DEVICE** and **BED 2 DEVICE** displaying ESP32 status, Wi-Fi link, HX711 digitizer status, and packet timestamps (*Biomedical Engineer, Admin*). |
| **Sensor Calibration** | Software UI for zero/tare baseline resetting and calibration scaling factor registers (*Biomedical Engineer, Admin*). |
| **Settings & Thresholds** | Configurable scientific thresholds (low volume, flow interruption, bag step, drift slope, sampling cadence) labeled as *"Configured by backend"* (*Biomedical Engineer, Admin*). |
| **Research Performance** | Layout for scientific benchmarks (MAE, RMSE, Accuracy, Precision, Recall, F1, Latency, Confusion Matrix). All values explicitly set to **`"Awaiting experimental data"`** (*Doctor, Admin*). |
| **Audit & Compliance Log** | Immutable chronological record of clinical actions, tare executions, and configuration changes (*Admin*). |
| **Clinical Login** | Multi-persona demo entry (Nurse, Doctor, Bio-Med, Admin) and REST authentication via `POST /api/auth/login`. |

---

## 4. Five Core Clinical Questions (Bed Cards)

Each bed card on the dashboard directly answers:
1. **WHAT IS HAPPENING?** $\rightarrow$ Current Weight (`g`), Filtered Weight (`g`), Flow Rate (`mL/hr`), Flow Status (`ACTIVE`/`IDLE`), Fill Percentage (`%`).
2. **IS SOMETHING WRONG?** $\rightarrow$ Detected Event, Evidence Score (`% confidence`), Alert Priority (`NORMAL`, `WARNING`, `CRITICAL`).
3. **WHICH BED?** $\rightarrow$ Prominent Bed 1 / Bed 2 tags and Channel IDs (`CH-1` / `CH-2`).
4. **IS THE SENSOR HEALTHY?** $\rightarrow$ Sensor Status (`NORMAL`, `DRIFT`, `FAILURE`) and Device Link (`ONLINE`, `DEGRADED`, `OFFLINE`).
5. **WHAT ACTION IS REQUIRED?** $\rightarrow$ Interactive **`Acknowledge`** and **`Resolve`** action buttons.

---

## 5. Centralized Data Adapter & Models

Located at `src/adapters/dataAdapter.js`, the adapter normalizes backend payloads to frontend models without silent field renaming:
- `currentWeight`, `filteredWeight`, `flowRate`, `smoothedFlowRate`, `percentRemaining`, `baseline`
- `currentEventType`, `currentEventStatus`, `evidenceScore`, `anomalyScore`, `driftScore`
- `sensorStatus`, `deviceStatus`, `lastUpdated`, `dataFresh`

### Supported Data Contracts:
- **Bed Model**: `{ id, bedId, name, deviceId, currentWeight, filteredWeight, flowRate, percentRemaining, flowStatus, status, currentEvent, evidenceScore, driftScore, anomalyScore, sensorStatus, deviceStatus, lastUpdated }`
- **Reading Model**: `{ bedId, timestamp, weight, filteredWeight, flowRate }`
- **Event Model**: `{ id, bedId, type, startTime, endTime, duration, severity, evidenceScore, status, reason }`
- **Alert Model**: `{ id, bedId, eventId, type, severity, evidenceScore, createdAt, acknowledgedAt, resolvedAt, status, message }`
- **Device Health Model**: `{ deviceId, bedId, esp32Status, wifiStatus, lastPacket, samplingStatus, hx711Status, sensorStatus, rssi, ipAddress }`

---

## 6. Centralized API Service Layer & Endpoints

Located at `src/api.js`, all network and mock calls are unified under 19 standardized methods:
```javascript
import { api } from './api.js';

// Authentication & Dashboard
api.login(credentials)
api.getDashboardSummary()
api.getBedStatus(bedId)
api.getBedReadings(bedId)

// Events & Alerts
api.getCurrentEvents()
api.getBedEvents(bedId)
api.getEventDetails(eventId)
api.getAlerts()
api.acknowledgeAlert(alertId, userName)
api.resolveAlert(alertId, userName)

// Telemetry & Hardware State
api.getAnalytics()
api.getDeviceStatus()
api.getAuditLogs()

// Configuration & Calibration
api.getConfiguration()
api.updateConfiguration(config)
api.getCalibration(bedId)
api.saveCalibration(bedId, data)
api.tareBed(bedId)

// Research Evaluation
api.getResearchMetrics()
```

### Centralized Endpoint Constants:
```
POST /api/auth/login
POST /api/device/data
GET  /api/dashboard/summary
GET  /api/dashboard/bed/{bedId}
GET  /api/dashboard/bed/{bedId}/readings
GET  /api/events
GET  /api/events/{bedId}
GET  /api/events/details/{eventId}
GET  /api/alerts
POST /api/alerts/{id}/acknowledge
POST /api/alerts/{id}/resolve
GET  /api/analytics
GET  /api/devices
GET  /api/devices/{id}
GET  /api/audit
GET  /api/configuration
PUT  /api/configuration
GET  /api/calibration/{bedId}
POST /api/calibration/{bedId}
POST /api/calibration/{bedId}/tare
GET  /api/research/metrics
```

---

## 7. Real-Time Subscription Abstraction

The frontend provides `subscribeToBedUpdates(bedId, callback, intervalMs)` in `src/api.js`. This creates a clean polling or stream abstraction that will allow switching to Server-Sent Events (SSE) or WebSockets during hardware integration without modifying any UI components.

---

## 8. Role-Based Access Control (RBAC)

The system implements 4 distinct clinical roles with automatic navigation filtering and permission enforcement:
- **Nurse**: Dashboard, Alerts & Triage (Acknowledge / Resolve).
- **Biomedical Engineer**: Device Health, Sensor Calibration, Platform Settings.
- **Doctor**: Dashboard, Events Log, Operational Analytics, Research Benchmarks.
- **Administrator**: Full access to all 9 system views including Audit & Compliance Logs.

> In Demo Mode, a **Role Switcher** is embedded in the sidebar allowing instant evaluation across all 4 personas.

---

## 9. Hardware Integration Interface Contract

When physical hardware testing is complete, the ESP32 firmware will deliver dual-channel telemetry using the established contract:

```
POST /api/device/data
Content-Type: application/json

{
  "deviceId": "ESP32-WROOM-01",
  "timestamp": 1725624600000,
  "readings": [
    {
      "bedId": "1",
      "channelId": 1,
      "sequenceNumber": 1042,
      "weight": 382.4,
      "rawAdc": 160799
    },
    {
      "bedId": "2",
      "channelId": 2,
      "sequenceNumber": 1042,
      "weight": 38.6,
      "rawAdc": 16142
    }
  ]
}
```

### Established Physical Pin Connections (Do Not Modify):
- **HX711 Module #1 (Bed 1):** DOUT/DT $\rightarrow$ GPIO 21, SCK $\rightarrow$ GPIO 22, VCC $\rightarrow$ 3.3V, GND $\rightarrow$ GND
- **HX711 Module #2 (Bed 2):** DOUT/DT $\rightarrow$ GPIO 19, SCK $\rightarrow$ GPIO 18, VCC $\rightarrow$ 3.3V, GND $\rightarrow$ GND
- **Load-Cell Wire Color Code:** Red $\rightarrow$ E+, Black $\rightarrow$ E−, White $\rightarrow$ A+, Green $\rightarrow$ A−

---

## 10. Running & Building the Software

### Development Mode:
```bash
npm install
npm run dev
```
Open `http://localhost:5173`. Click on any role to immediately test the platform using realistic simulated data.

### Production Build:
```bash
npm run build
```
Generates an optimized, clean production bundle in `dist/` with zero errors.
