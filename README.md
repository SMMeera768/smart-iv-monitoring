# SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
## Research Prototype Implementation

A low-cost, dual-channel, IoT-enabled intravenous workflow and sensor-health monitoring platform developed for academic research and experimental evaluation.

> [!IMPORTANT]
> **Research Prototype Disclaimer**: This system is a research engineering prototype designed to study weight-derived event detection and lightweight AI sensor-health monitoring. It is **NOT** a certified medical device and must **NOT** be used for clinical diagnosis or patient treatment.

---

### Key Capabilities
- **Dual-Channel Telemetry**: 1x ESP32 simultaneously monitoring 2 independent IV load cells (Bed 1 & Bed 2).
- **Zero-Overwrite Telemetry**: Raw sensor measurements are permanently preserved in PostgreSQL.
- **Signal Processing Pipeline**: Rolling-window moving average filter, numerical derivative flow estimation, and linear regression weight slope calculation.
- **Deterministic Rule Engine**: Formal state machine detecting `NORMAL_FLOW`, `FLOW_INTERRUPTION`, `LOW_VOLUME`, and `BAG_REPLACEMENT`.
- **Explainable Evidence Scoring**: Transparent 0–100 score indicating supporting empirical factors behind each alert.
- **Lightweight AI Sensor Health**: Python FastAPI service running `IsolationForest` to detect sensor baseline drift, stuck sensors, and physical abnormalities without clinical classification.
- **Clean Architecture Separation**: The Web UI strictly displays server-calculated values and is completely decoupled from scientific logic.

---

### Directory Layout
```
smart-iv-monitoring/
├── backend/spring-service/   # Java Spring Boot backend (Central System of Record)
├── ai-service/               # Python FastAPI Isolation Forest service
├── frontend/                 # React SPA Dashboard (Supports Mock & Live API mode)
├── firmware/                 # ESP32 Dual HX711 C++ Arduino firmware
├── docs/                     # Full system specifications and mathematical proofs
├── datasets/                 # Baseline experimental datasets
└── experiments/              # Controlled test logs and benchtop scenarios
```

---

### Running the Services

#### 1. Start Python AI Service (Port 8000)
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 2. Start Spring Boot Backend (Port 8080)
```bash
cd backend/spring-service
mvn spring-boot:run
```
*(Or run `SmartIvApplication.java` from your preferred Java IDE).*
Flyway will automatically execute database migrations `V1` to `V9` upon startup.

#### 3. Open Web Dashboard
Open `frontend/index.html` in any modern web browser or navigate to `http://localhost:8080/` when Spring Boot is running.
Use the mode selector in the top bar to toggle between:
- **Mock Mode**: Fully operational standalone demo for UI testing without backend dependencies.
- **Live API Mode**: Connected directly to Spring Boot REST endpoints with live 3-second polling.
