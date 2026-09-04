# Smart Multi-Bed IV Workflow & Event Monitoring Platform

## Master Project Guide, System Manual & Hardware Integration Roadmap

---

### Table of Contents

1. [Executive Overview & System Architecture](#1-executive-overview--system-architecture)
2. [Complete Directory & File Inventory](#2-complete-directory--file-inventory)
3. [Tier-by-Tier Breakdown (What Each Part Does)](#3-tier-by-tier-breakdown-what-each-part-does)
   - [Frontend SPA Dashboard](#31-frontend-spa-dashboard)
   - [Spring Boot Backend Service](#32-spring-boot-backend-service)
   - [Python AI Sensor Health Microservice](#33-python-ai-sensor-health-microservice)
   - [Database Layer (H2 & PostgreSQL)](#34-database-layer-h2--postgresql)
   - [ESP32 Firmware](#35-esp32-firmware)
   - [Datasets & IEEE Documentation](#36-datasets--ieee-documentation)
4. [How to Use the System (Step-by-Step)](#4-how-to-use-the-system-step-by-step)
   - [Mode 1: Frontend Mock Mode (Zero Setup)](#41-mode-1-frontend-mock-mode-zero-setup)
   - [Mode 2: Full Local Stack (Live API Mode)](#42-mode-2-full-local-stack-live-api-mode)
   - [Mode 3: Telemetry Injection via Script/Curl](#43-mode-3-telemetry-injection-via-scriptcurl)
5. [When and How to Integrate Hardware](#5-when-and-how-to-integrate-hardware)
   - [When to Integrate Hardware (The Timeline)](#51-when-to-integrate-hardware-the-timeline)
   - [Hardware Bill of Materials (BOM)](#52-hardware-bill-of-materials-bom)
   - [Circuit Wiring & Pinout Diagram](#53-circuit-wiring--pinout-diagram)
   - [Mechanical Mounting Guidelines](#54-mechanical-mounting-guidelines)
   - [Firmware Configuration & Flashing](#55-firmware-configuration--flashing)
   - [HX711 Calibration Procedure (Tare & Scale Factor)](#56-hx711-calibration-procedure-tare--scale-factor)
   - [Verifying End-to-End Hardware Data Ingestion](#57-verifying-end-to-end-hardware-data-ingestion)
6. [Troubleshooting & Common Pitfalls](#6-troubleshooting--common-pitfalls)
7. [Project Demonstration & Viva Defense Guide](#7-project-demonstration--viva-defense-guide)

---

## 1. Executive Overview & System Architecture

The **Smart Multi-Bed IV Workflow & Event Monitoring Platform** is an IoT and AI-assisted clinical prototype designed to monitor intravenous (IV) infusion therapy across multiple hospital beds simultaneously.

The architecture monitors two independent IV infusion bags via **two 1kg bar load cells** connected through **two HX711 ADC amplifiers** to a single **ESP32 microcontroller**. Telemetry is transmitted over Wi-Fi/HTTP to a **Java Spring Boot backend**, which handles digital signal filtering, feature extraction, an explainable clinical rule engine, and database persistence. A dedicated **Python FastAPI microservice** uses an Isolation Forest machine learning model strictly for sensor anomaly detection and baseline drift quantification.

```
       [ Bed 1: 1kg Load Cell ]       [ Bed 2: 1kg Load Cell ]
                  │                              │
                  ▼                              ▼
             [ HX711 #1 ]                   [ HX711 #2 ]
                  │                              │
                  └──────────────┬───────────────┘
                                 │ GPIO 16/4 (Bed 1), GPIO 17/18 (Bed 2)
                                 ▼
                     [ ESP32 Microcontroller ]
                                 │
                                 │ Wi-Fi: HTTP POST /api/device/data
                                 ▼
                  ┌──────────────────────────────┐
                  │   Spring Boot Core Backend   │  <───> [ PostgreSQL / H2 DB ]
                  │       (Port 8080)            │
                  └──────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │ HTTP POST /ai/v1/analyze      │ HTTP GET /api/dashboard/summary
                 ▼                               ▼
     ┌────────────────────────┐      ┌────────────────────────┐
     │  Python AI Microservice│      │   React SPA Dashboard  │
     │      (Port 8000)       │      │   (Browser / Static)   │
     │   (Isolation Forest)   │      │ (Mock Mode & Live Mode)│
     └────────────────────────┘      └────────────────────────┘
```

### Strict Architectural Boundaries

1. **Frontend Performs Zero Scientific Math**: The frontend never calculates slopes, flow rates, event states, or AI drift scores. It strictly renders server-derived truth.
2. **Mock Mode Decoupling**: Mock telemetry logic is completely isolated from UI rendering components. Switching between mock data and the live Spring Boot API is done via a single UI toggle.
3. **AI Scope Boundary**: The Python AI microservice is strictly confined to **sensor health, physical drift, and hardware failure detection**. It never diagnoses medical events or determines clinical IV states (`NORMAL_FLOW`, `FLOW_INTERRUPTION`, etc.), which belong exclusively to the explainable Spring Boot rule engine.
4. **Fault-Tolerant Circuit Breaker**: If the Python AI microservice is stopped or unreachable, Spring Boot logs the event, marks AI status as `AI_UNAVAILABLE`, and continues uninterrupted clinical monitoring.

---

## 2. Complete Directory & File Inventory

```
smart-iv-monitoring/
├── README.md                           # Quickstart README
├── PROJECT_GUIDE.md                    # Complete System & Hardware Manual (this file)
│
├── frontend/
│   └── index.html                      # Standalone React SPA (Canvas charts, alert drawer, drift studio)
│
├── backend/
│   └── spring-service/                 # Java Spring Boot 3.2.5 Backend
│       ├── pom.xml                     # Maven configuration (Java 21/25, Spring Boot, JPA, Flyway, H2)
│       ├── mvnw / mvnw.cmd / .mvn/     # Embedded Maven Wrapper (run without installing Maven)
│       └── src/
│           ├── main/
│           │   ├── java/com/smartiv/
│           │   │   ├── SmartIvApplication.java       # Main entry point
│           │   │   ├── client/AiServiceClient.java   # HTTP client for Python AI service
│           │   │   ├── config/
│           │   │   │   ├── AiClientConfig.java       # RestTemplate timeouts
│           │   │   │   ├── DevDataInitializer.java   # Auto-seeds default beds & device
│           │   │   │   └── SmartIvProperties.java    # Signal & rule configuration parameters
│           │   │   ├── controller/                   # REST Controllers (11 endpoints)
│           │   │   │   ├── DeviceDataController.java # POST /api/device/data (ESP32 ingestion)
│           │   │   │   ├── DashboardController.java  # GET /api/dashboard/summary
│           │   │   │   ├── AlertController.java      # Acknowledge / resolve alerts
│           │   │   │   ├── CalibrationController.java# Bench calibration APIs
│           │   │   │   └── ... (Event, Device, Config, Analytics, Audit, Auth, Research)
│           │   │   ├── engine/                       # Clinical Rule Engine
│           │   │   │   ├── RuleEngine.java           # Central evaluator
│           │   │   │   ├── NormalFlowRule.java       # Normal continuous infusion
│           │   │   │   ├── FlowInterruptionRule.java # Clamped tube / occlusion / empty bag
│           │   │   │   ├── LowVolumeRule.java        # Bag volume < 15% threshold
│           │   │   │   └── BagReplacementRule.java   # Mass jump > 50g transition
│           │   │   ├── entity/                       # JPA Database Entities (12 tables)
│           │   │   │   ├── Bed.java, Device.java, SensorReading.java, Calibration.java
│           │   │   │   ├── IvEvent.java, Alert.java, AiMetric.java, AuditLog.java, etc.
│           │   │   ├── repository/                   # Spring Data JPA Repositories (12 interfaces)
│           │   │   ├── service/                      # Core business & processing services
│           │   │   │   ├── ingestion/IngestionService.java   # Primary ingestion pipeline
│           │   │   │   ├── processing/SignalFilterService.java # Moving average & filter
│           │   │   │   ├── feature/FeatureExtractionService.java# Slope, variance, noise, drift
│           │   │   │   ├── flow/FlowRateService.java         # Instantaneous & smoothed flow rate
│           │   │   │   └── evidence/EvidenceScoreService.java# Multi-factor evidence scoring (0-100)
│           │   │   └── state/
│           │   │       ├── BedRuntimeState.java      # Ring buffers for rolling windows
│           │   │       └── BedStateManager.java      # Thread-safe dual-bed runtime cache
│           │   └── resources/
│           │       ├── application.yml               # Production config (PostgreSQL default)
│           │       ├── application-h2.yml            # Instant dev config (H2 in-memory DB)
│           │       ├── application-dev.yml           # Local dev profile
│           │       ├── static/index.html             # Embedded dashboard served directly by backend
│           │       └── db/migration/                 # Flyway SQL migrations
│           │           ├── V1__create_users.sql
│           │           ├── V2__create_beds_devices.sql
│           │           ├── V3__create_sensor_readings.sql
│           │           ├── V4__create_calibration.sql
│           │           ├── V5__create_events_alerts.sql
│           │           ├── V6__create_ai_metrics.sql
│           │           ├── V7__create_configuration.sql
│           │           ├── V8__create_audit_logs.sql
│           │           └── V9__seed_dev_data.sql
│           └── test/java/com/smartiv/
│               ├── RuleEngineTests.java              # Unit tests for clinical rules (passed)
│               └── SignalProcessingTests.java        # Unit tests for filters & flow rate (passed)
│
├── ai-service/                         # Python 3.14 FastAPI Sensor Health Microservice
│   ├── requirements.txt                # FastAPI, Uvicorn, scikit-learn, joblib, scipy
│   ├── models/                         # Trained machine learning artifacts
│   │   ├── isolation_forest.joblib     # Pre-trained Isolation Forest model
│   │   ├── scaler.joblib               # StandardScaler trained on physical sensor features
│   │   └── metadata.json               # Model version, hyperparams, training timestamp
│   ├── app/
│   │   ├── main.py                     # FastAPI application entry point
│   │   ├── api/routes.py               # POST /ai/v1/analyze & GET /ai/v1/health
│   │   ├── schemas/                    # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── inference_service.py    # Orchestrates scaling, model inference & drift scoring
│   │   │   ├── drift_service.py        # Baseline deviation & drift score formula
│   │   │   └── sensor_health_service.py# Stuck-sensor heuristic & health status determination
│   │   ├── training/
│   │   │   ├── train.py                # Model training script
│   │   │   └── evaluate.py             # Research benchmark evaluation script
│   │   └── config/settings.py          # Host, port, threshold configs
│   └── tests/
│       └── test_ai_service.py          # 5 unit tests for AI endpoints (passed)
│
├── firmware/
│   └── esp32_hx711_dual.ino            # Complete Arduino C++ firmware for ESP32 + 2x HX711
│
├── datasets/                           # Synthetic & experimental benchmark datasets (CSV)
│   ├── normal_infusion_500ml.csv
│   ├── flow_interruption_occlusion.csv
│   ├── bag_replacement_sequence.csv
│   └── sensor_drift_thermal.csv
│
├── experiments/                        # Experimental test protocols & logging templates
│   ├── README.md
│   └── protocol_template.md
│
└── docs/                               # IEEE Thesis / Publication Grade Documentation
    ├── architecture.md                 # System overview, component diagrams, flow charts
    ├── api-contract.md                 # Full REST API specification with sample payloads
    ├── signal-processing.md            # DSP formulas (Moving average, SG filter, slope, flow)
    ├── rule-engine.md                  # State machines, hysteresis, candidate tracking, evidence
    ├── ai-model.md                     # Isolation forest math, feature normalization, drift logic
    ├── database-schema.md              # Entity relationship model, Flyway scripts, indexes
    └── experimental-protocol.md        # Hardware test bench protocols & validation criteria
```

---

## 3. Tier-by-Tier Breakdown (What Each Part Does)

### 3.1. Frontend SPA Dashboard

- **File**: [`frontend/index.html`](file:///H:/final%20year%20project/smart-iv-monitoring/frontend/index.html) and [`backend/spring-service/src/main/resources/static/index.html`](file:///H:/final%20year%20project/smart-iv-monitoring/backend/spring-service/src/main/resources/static/index.html).
- **Technology**: React 18 (CDN, no Node.js build step needed), Tailwind CSS, Lucide Icons, HTML5 Canvas.
- **Key Modules**:
  - **Top Navigation**: Live status badge, system health, and a **Mode Switcher** (`Mock Mode` vs `Live API (8080)`).
  - **Live Bed Monitor**: Dual cards displaying Bed 1 and Bed 2 with current weight (g), flow rate (g/min), estimated time remaining, and event badges (`NORMAL_FLOW`, `FLOW_INTERRUPTION`, etc.).
  - **Real-Time Canvas Chart**: High-performance rendering of weight trends and flow rates over time.
  - **Sensor Health / AI Studio**: Visualizes baseline, drift score, anomaly score, and sensor status (`NORMAL`, `POSSIBLE_DRIFT`, `POSSIBLE_SENSOR_FAILURE`).
  - **Clinical Evidence Checklist**: Explains _why_ an event was triggered (evidence score 0–100 with contributing factors).
  - **Alerts Drawer**: Displays active alarms with one-click Nurse Acknowledgment and Resolution.
  - **Calibration Wizard**: UI to perform Tare and known-weight calibration.
  - **Research & Fleet View**: Device connection status, firmware version, and historical CSV download.

### 3.2. Spring Boot Backend Service

- **Directory**: [`backend/spring-service/`](file:///H:/final%20year%20project/smart-iv-monitoring/backend/spring-service)
- **Technology**: Java 21/25, Spring Boot 3.2.5, Spring Data JPA, Hibernate, Flyway.
- **Key Capabilities**:
  - **Telemetry Ingestion**: Ingests dual-channel JSON packets from ESP32 (`POST /api/device/data`).
  - **Digital Signal Processing**: Computes moving-average filtered weight, linear regression slope ($g/\text{sec}$), rolling variance, and noise.
  - **Flow Rate Calculation**: Calculates instantaneous and smoothed flow rates in grams per minute ($g/\text{min} \approx \text{mL}/\text{min}$ for standard saline).
  - **Clinical Rule Engine**: Evaluates clinical state using configurable hysteresis and temporal candidate persistence (filters out brief bag bumps from real occlusions).
  - **Evidence Scoring**: Deterministically scores event confidence from 0 to 100 based on slope sign, flow threshold, duration, noise, and baseline stability.
  - **AI Microservice Client**: Asynchronously sends feature vectors to the Python microservice and receives anomaly/drift metrics. Includes a graceful fallback if the AI microservice is offline.

### 3.3. Python AI Sensor Health Microservice

- **Directory**: [`ai-service/`](file:///H:/final%20year%20project/smart-iv-monitoring/ai-service)
- **Technology**: Python 3.14, FastAPI, Uvicorn, scikit-learn, joblib.
- **Key Capabilities**:
  - **Isolation Forest Inference**: Runs a pre-trained `IsolationForest(n_estimators=100)` model on extracted features: `[weightSlope, rollingVariance, signalNoise, baselineDeviation, stuckSignalDurationSeconds]`.
  - **Normalized Anomaly Index**: Converts raw Isolation Forest decision scores into a normalized $[0, 1]$ index using a deterministic sigmoid:
    $$\text{anomalyScore} = \frac{1}{1 + e^{10 \times \text{rawScore}}}$$
  - **Composite Drift Scoring**: Computes a weighted drift index:
    $$\text{driftScore} = 0.50 \times \text{devNorm} + 0.30 \times \text{anomalyScore} + 0.20 \times \text{slopeResidual}$$
  - **Stuck Sensor Detection**: Flags sensors whose ADC output does not vary beyond noise limits over an extended duration.

### 3.4. Database Layer (H2 & PostgreSQL)

- **Supported Engines**:
  - **H2 (Default Dev Profile)**: In-memory database with zero installation required. Tables are auto-generated and seeded on startup by `DevDataInitializer.java`.
  - **PostgreSQL (Production/Research Profile)**: Schema managed via 9 Flyway migrations (`V1` to `V9`), enforcing relational constraints, foreign keys, and audit logging.
- **Core Entities**: `users`, `devices`, `beds`, `device_channel_mappings`, `sensor_readings`, `derived_features`, `calibrations`, `iv_events`, `alerts`, `ai_metrics`, `system_configurations`, `audit_logs`.

### 3.5. ESP32 Firmware

- **File**: [`firmware/esp32_hx711_dual.ino`](file:///H:/final%20year%20project/smart-iv-monitoring/firmware/esp32_hx711_dual.ino)
- **Technology**: Arduino C++, `HX711.h`, `WiFi.h`, `HTTPClient.h`, `ArduinoJson.h`.
- **Key Capabilities**:
  - Samples 2 HX711 load cell amplifiers independently.
  - Applies tare offsets and calibration scale factors.
  - Formats both Bed 1 and Bed 2 readings into a single unified JSON payload.
  - Transmits telemetry every 1 second over Wi-Fi via `POST /api/device/data`.
  - Automatically reconnects if Wi-Fi signal drops.

---

## 4. How to Use the System (Step-by-Step)

### 4.1. Mode 1: Frontend Mock Mode (Zero Setup)

Use this mode when you or your teammate want to inspect the UI, test alert workflows, or demonstrate the dashboard without running any backend services.

1. Navigate to [`frontend/index.html`](file:///H:/final%20year%20project/smart-iv-monitoring/frontend/index.html).
2. Double-click to open in Chrome, Edge, or Firefox.
3. Ensure the top-right toggle pill shows **"Mock Mode"**.
4. The dashboard will automatically simulate realistic dual-bag infusions with flow rate variations, occlusions, and simulated drift.

---

### 4.2. Mode 2: Full Local Stack (Live API Mode)

Use this mode to run the complete end-to-end software stack on your computer.

#### Step 1: Start the Python AI Microservice

Open PowerShell:

```powershell
cd "H:\final year project\smart-iv-monitoring\ai-service"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- Verify: Open `http://localhost:8000/ai/v1/health` in your browser. You should see:
  ```json
  { "status": "ONLINE", "modelVersion": "iforest-v1", "uptimeSeconds": 12.5 }
  ```

#### Step 2: Start the Spring Boot Backend

Open a second PowerShell window:

```powershell
cd "H:\final year project\smart-iv-monitoring\backend\spring-service"
.\mvnw.cmd spring-boot:run
```

- The backend starts with the built-in `h2` profile by default.
- It automatically creates `ESP32_01`, `BED_1`, and `BED_2` with default calibrations.
- Verify: Open `http://localhost:8080/api/dashboard/summary` in your browser. You should see `systemStatus: "ONLINE"`.

#### Step 3: Open the Dashboard in Live Mode

1. Open `http://localhost:8080` (or double-click [`frontend/index.html`](file:///H:/final%20year%20project/smart-iv-monitoring/frontend/index.html)).
2. Click the mode pill in the top-right corner to switch to **"Live API (8080)"**.
3. The dashboard now polls the live Spring Boot backend every 2 seconds.

---

### 4.3. Mode 3: Telemetry Injection via Script/Curl

To simulate telemetry without physical hardware:

Open a third PowerShell window and run this script to inject 20 seconds of continuous infusion data:

```powershell
$weight1 = 500.0
$weight2 = 500.0

for ($i = 1; $i -le 20; $i++) {
    $weight1 -= 0.35  # Bed 1 losing 0.35g per packet
    $weight2 -= 0.25  # Bed 2 losing 0.25g per packet

    $body = @{
        deviceId = "ESP32_01"
        readings = @(
            @{
                bedId = "BED_1"
                channelId = "HX711_1"
                sequenceNumber = $i
                weight = [math]::Round($weight1, 2)
                rawAdc = [long](128000 - ($i * 120))
            },
            @{
                bedId = "BED_2"
                channelId = "HX711_2"
                sequenceNumber = $i
                weight = [math]::Round($weight2, 2)
                rawAdc = [long](130000 - ($i * 90))
            }
        )
    } | ConvertTo-Json -Depth 5

    Invoke-RestMethod -Uri "http://localhost:8080/api/device/data" -Method POST -Body $body -ContentType "application/json" | Out-Null
    Write-Host "Sent packet #$i: Bed 1 = $([math]::Round($weight1, 2))g, Bed 2 = $([math]::Round($weight2, 2))g"
    Start-Sleep -Seconds 1
}
```

Watch your browser dashboard update live with real flow rates, moving-average weights, and AI sensor health evaluations!

---

## 5. When and How to Integrate Hardware

### 5.1. When to Integrate Hardware (The Timeline)

Follow this recommended sequence for project milestones:

```
[Phase 1: Software Foundation] (COMPLETE)
  ├── Frontend Skeleton & Canvas Charts
  ├── Decoupled Mock Data Simulation
  ├── Spring Boot Core Ingestion & Rule Engine
  └── Python AI Isolation Forest Microservice
         │
         ▼
[Phase 2: Local Verification] (COMPLETE)
  ├── End-to-End Simulation via Scripts
  ├── Verified AI Anomaly & Drift Scoring
  └── Live Dashboard Visualizations Tested
         │
         ▼
[Phase 3: Hardware Integration] (YOU ARE HERE)
  ├── 1. Wire Load Cells to HX711 & ESP32
  ├── 2. Calibrate Scale Factors on Test Bench
  ├── 3. Flash ESP32 Firmware with local Wi-Fi & PC IP
  └── 4. Transmit Real Physical Measurements
         │
         ▼
[Phase 4: Physical Experiments & Paper]
  ├── Test 1: Normal Saline Infusion (500mL at 100mL/hr)
  ├── Test 2: Tube Occlusion / Roller Clamp Shutdown
  ├── Test 3: Bag Replacement (Weight Jump)
  └── Test 4: Physical Sensor Drift / Mechanical Disturbance
```

**You are ready to integrate hardware right now.** The entire backend and frontend ingestion pipeline is waiting and ready to accept live data packets from the ESP32.

---

### 5.2. Hardware Bill of Materials (BOM)

| Item                               | Quantity | Purpose                             | Notes                                         |
| ---------------------------------- | -------- | ----------------------------------- | --------------------------------------------- |
| **ESP32 DevKit V1** (30 or 38 pin) | 1        | Microcontroller & Wi-Fi Gateway     | Dual-core Tensilica Xtensa 32-bit             |
| **HX711 24-bit ADC Modules**       | 2        | Differential load cell amplifiers   | Red or green breakout boards                  |
| **1kg Straight-Bar Load Cells**    | 2        | Strain-gauge weight measurement     | 4 wires per cell (Red, Black, White, Green)   |
| **Mechanical Mounting Brackets**   | 2        | Suspends IV bag from load cell      | Acrylic/3D printed/wood stand                 |
| **Breadboard & Jumper Wires**      | 1 set    | Benchtop prototyping connections    | Male-to-male and male-to-female               |
| **Micro-USB Cable**                | 1        | Powers ESP32 and serial debugging   | Must support data transmission                |
| **500mL Saline / Water Bags**      | 2        | Infusion test fluids                | Available from medical supply or water bottle |
| **Standard IV Infusion Tubing**    | 1–2      | Gravity drip line with roller clamp | For testing interruptions                     |
| **Known Reference Weight**         | 1        | Precision calibration               | 100g, 200g, or 500g calibrated mass           |

---

### 5.3. Circuit Wiring & Pinout Diagram

Connect the load cells and amplifiers to the ESP32 according to the following pinout:

```
[ Bed 1 - 1kg Load Cell ]              [ Bed 2 - 1kg Load Cell ]
  Red wire    --> E+ (HX711 #1)          Red wire    --> E+ (HX711 #2)
  Black wire  --> E- (HX711 #1)          Black wire  --> E- (HX711 #2)
  White wire  --> A- (HX711 #1)          White wire  --> A- (HX711 #2)
  Green wire  --> A+ (HX711 #1)          Green wire  --> A+ (HX711 #2)

[ HX711 #1 (Bed 1) ]                   [ HX711 #2 (Bed 2) ]
  VCC         --> ESP32 3.3V             VCC         --> ESP32 3.3V
  GND         --> ESP32 GND              GND         --> ESP32 GND
  DOUT (DT)   --> ESP32 GPIO 16          DOUT (DT)   --> ESP32 GPIO 17
  SCK (CLK)   --> ESP32 GPIO 4           SCK (CLK)   --> ESP32 GPIO 18
```

> [!IMPORTANT]
> **Power Supply Note**: Power the HX711 VCC from the **ESP32 3.3V pin** (not 5V/VIN). This ensures that the digital output pins (`DOUT` / `SCK`) operate strictly at 3.3V logic levels, protecting the ESP32 GPIO pins from overvoltage.

---

### 5.4. Mechanical Mounting Guidelines

Strain gauge load cells measure micro-strain deformations along a single cantilever axis:

1. **Mounting Orientation**: Bolt one end of the aluminum bar firmly to a rigid vertical stand. The other end must hang completely free in the air.
2. **Arrow Direction**: Look for the small arrow sticker on the load cell. The arrow points in the direction of gravity / downward load.
3. **Clearance**: Ensure that the IV hook, tubing, and wires **never touch the middle portion of the load cell beam**. The middle contains the strain gauges coated in white silicone; any mechanical friction will cause severe sensor drift.

---

### 5.5. Firmware Configuration & Flashing

1. Open the Arduino IDE.
2. Install the required libraries via **Sketch $\rightarrow$ Include Library $\rightarrow$ Manage Libraries**:
   - `HX711 Arduino Library` by Bogdan Necula
   - `ArduinoJson` by Benoit Blanchon (version 6.x or 7.x)
3. Open [`firmware/esp32_hx711_dual.ino`](file:///H:/final%20year%20project/smart-iv-monitoring/firmware/esp32_hx711_dual.ino).
4. Update your Wi-Fi credentials and PC local IP address:

   ```cpp
   // ================= CONFIGURATION =================
   const char* WIFI_SSID     = "Your_WiFi_Name";
   const char* WIFI_PASSWORD = "Your_WiFi_Password";

   // IP address of the computer running Spring Boot
   // Find your PC's IP using 'ipconfig' in PowerShell (e.g., 192.168.1.45)
   const char* SERVER_HOST   = "192.168.1.XX";
   const int   SERVER_PORT   = 8080;
   const char* SERVER_PATH   = "/api/device/data";
   ```

5. Select **Board: ESP32 Dev Module** and choose your COM port.
6. Click **Upload**.

---

### 5.6. HX711 Calibration Procedure (Tare & Scale Factor)

The raw 24-bit reading from the HX711 must be converted to grams using the linear relationship:

$$\text{Weight (g)} = \frac{\text{Raw ADC Value} - \text{Tare Offset}}{\text{Calibration Factor}}$$

#### Bench Calibration Steps:

1. Open the **Serial Monitor** in Arduino IDE set to `115200 baud`.
2. **Step A: Tare (Empty Hook)**
   - Hang only the empty IV hook/clamp on the load cell.
   - Read the raw ADC value printed on the serial monitor (e.g., `85200`).
   - This value is your `OFFSET_1`.
3. **Step B: Known Reference Weight**
   - Hang an accurate known weight (e.g., a $200.0\text{g}$ weight or a syringe filled with exactly $200\text{mL}$ of water $\approx 200.0\text{g}$).
   - Read the new loaded raw ADC value (e.g., `169200`).
   - Calculate the calibration factor:
     $$\text{SCALE\_FACTOR} = \frac{169200 - 85200}{200.0} = \frac{84000}{200.0} = 420.0$$
4. Update lines 36–39 in [`firmware/esp32_hx711_dual.ino`](file:///H:/final%20year%20project/smart-iv-monitoring/firmware/esp32_hx711_dual.ino):
   ```cpp
   const float SCALE_FACTOR_1 = 420.0;
   const long  OFFSET_1       = 85200;
   ```
   _(Repeat the identical process for Bed 2 on Channel 2)._
5. Re-flash the ESP32.

---

### 5.7. Verifying End-to-End Hardware Data Ingestion

1. Once the ESP32 connects to Wi-Fi, the Serial Monitor will output:
   ```
   [WiFi] Connected! IP: 192.168.1.88
   [HX711] Channel 1: 498.2 g | Channel 2: 501.1 g
   [HTTP] POST payload: {"deviceId":"ESP32_01","readings":[...]}
   [HTTP] Response Code: 200
   [HTTP] Response: {"status":"accepted"}
   ```
2. Open [`frontend/index.html`](file:///H:/final%20year%20project/smart-iv-monitoring/frontend/index.html) in your browser.
3. Switch the top-right pill to **Live API (8080)**.
4. You will now see physical weight values from your desk displayed on the live hospital dashboard!

---

## 6. Troubleshooting & Common Pitfalls

| Symptom                                                                 | Probable Cause                                                                   | Corrective Action                                                                                                                     |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **ESP32 prints `[HTTP] POST failed: Connection refused` or `Error -1`** | Windows Firewall is blocking incoming connections on port 8080.                  | In Windows Defender Firewall, add an Inbound Rule allowing TCP port 8080, or temporarily test on the same Wi-Fi subnet.               |
| **Weight values decrease when you add weight**                          | White and green strain gauge wires are reversed.                                 | Swap the `A+` (Green) and `A-` (White) wires on the HX711 amplifier, or multiply your `SCALE_FACTOR` by `-1`.                         |
| **Weight values jump erratically by $\pm 20\text{g}$**                  | Loose ground or electrical noise from fluctuating power.                         | Ensure all GND pins (ESP32 and both HX711s) share a common ground plane. Avoid long unshielded jumper wires near AC power adapters.   |
| **Serial Monitor prints `HX711 not found / not ready`**                 | Incorrect GPIO pin assignment or loose DOUT/SCK wires.                           | Double-check that DOUT is connected to GPIO 16 (Bed 1) or GPIO 17 (Bed 2), and SCK is connected to GPIO 4 (Bed 1) or GPIO 18 (Bed 2). |
| **Flow rate displays 0 even though drops are falling**                  | Moving average buffer is still warming up, or flow is below 0.5 g/min threshold. | Wait 10 seconds for the rolling buffer window (10 samples) to fill.                                                                   |
| **AI Sensor Status shows `POSSIBLE_SENSOR_FAILURE`**                    | Sensor values are completely static for >120s or jumped instantaneously.         | This is an intentional safety feature of the Isolation Forest model detecting stuck or bumped sensors.                                |

---

## 7. Project Demonstration & Viva Defense Guide

When presenting your final year project to evaluators:

1. **Step 1: Architecture Presentation**
   - Explain the 4 tiers: Embedded Hardware (ESP32) $\rightarrow$ Java Spring Boot Engine $\rightarrow$ Python AI Microservice $\rightarrow$ Web Dashboard.
   - Emphasize the **strict separation**: Spring Boot makes deterministic clinical decisions; Python AI monitors hardware integrity and sensor drift; Frontend renders server truth.
2. **Step 2: Live Baseline Infusion (Normal Flow)**
   - Start an IV bag draining through the drip chamber at a normal rate (~2 to 3 mL/min).
   - Show the dashboard displaying `NORMAL_FLOW`, steady negative slope, and low noise variance.
3. **Step 3: Clinical Event Simulation (Flow Interruption / Occlusion)**
   - Close the roller clamp on the IV tube.
   - Show that within 30–60 seconds, the slope flattens to zero. The evidence score climbs to $\ge 80$, the state switches to `FLOW_INTERRUPTION`, and an alarm is triggered in the Alert Drawer.
   - Demonstrate the **Nurse Acknowledgment** button.
4. **Step 4: AI Drift & Sensor Anomaly Demonstration**
   - Open the **Drift Studio** tab.
   - Gently rest an object against the load cell beam to introduce an artificial tare offset or baseline drift.
   - Show the Python Isolation Forest model detecting the anomalous residual, raising the drift score, and flagging `POSSIBLE_DRIFT`.
5. **Step 5: Research CSV Export**
   - Navigate to the **Fleet / Research** tab and click **Export Experimental CSV**.
   - Show the generated dataset with timestamps, raw weights, filtered weights, flow rates, evidence scores, and AI drift metrics ready for IEEE paper plotting.

---

_Created for the Smart Multi-Bed IV Workflow & Event Monitoring Platform final year research project._
