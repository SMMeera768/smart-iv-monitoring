# API Contract Specification
## Smart Multi-Bed IV Platform Unified REST API

All endpoints reside under `/api/...` on Spring Boot port `8080`.
The Python AI microservice communicates internally on port `8000`.

---

### 1. Device Telemetry Ingestion
- **Endpoint**: `POST /api/device/data`
- **Sender**: ESP32 Firmware
- **Payload**:
```json
{
  "deviceId": "ESP32_01",
  "timestamp": "2026-09-04T10:20:30Z",
  "readings": [
    {
      "bedId": "BED_1",
      "channelId": "HX711_1",
      "sequenceNumber": 10231,
      "weight": 382.42,
      "rawAdc": 843921
    },
    {
      "bedId": "BED_2",
      "channelId": "HX711_2",
      "sequenceNumber": 10231,
      "weight": 276.31,
      "rawAdc": 764218
    }
  ]
}
```
- **Response**: `200 OK`
```json
{ "status": "accepted" }
```

---

### 2. Dashboard Endpoints
- **Summary**: `GET /api/dashboard/summary`
- **Bed Status**: `GET /api/dashboard/bed/{bedCode}`
- **Reading Points**: `GET /api/dashboard/bed/{bedCode}/readings?from=...&to=...&limit=200`

---

### 3. Alert Lifecycle
- **List Alerts**: `GET /api/alerts?bedId=...&status=OPEN&page=0&size=20`
- **Get Alert**: `GET /api/alerts/{id}`
- **Acknowledge Alert**: `POST /api/alerts/{id}/acknowledge`
  ```json
  { "userId": "nurse_anand" }
  ```
- **Resolve Alert**: `POST /api/alerts/{id}/resolve`
  ```json
  { "userId": "nurse_anand" }
  ```

---

### 4. Calibration & Taring
- **Get Calibration**: `GET /api/calibration/{bedCode}`
- **Save Calibration**: `POST /api/calibration/{bedCode}`
  ```json
  {
    "channelId": "HX711_1",
    "calibrationFactor": 420.5,
    "zeroOffset": 843920.0,
    "knownReferenceWeight": 500.0,
    "notes": "Calibrated with 500g brass standard"
  }
  ```
- **Tare Sensor**: `POST /api/calibration/{bedCode}/tare`

---

### 5. System Configuration
- **Get Configurations**: `GET /api/configuration`
- **Update Configuration**: `PUT /api/configuration`
  ```json
  {
    "configKey": "rules.flowInterruptionThreshold",
    "configValue": "0.45",
    "description": "Adjusted near-zero threshold"
  }
  ```

---

### 6. AI Microservice Contract (Internal HTTP)
- **Endpoint**: `POST /ai/v1/analyze`
- **Request**:
```json
{
  "bedId": "BED_1",
  "features": {
    "weightSlope": -1.8,
    "standardDeviation": 0.12,
    "rollingVariance": 0.014,
    "signalNoise": 0.07,
    "baselineDeviation": 0.05,
    "stuckSignalDuration": 0.0
  }
}
```
- **Response**:
```json
{
  "modelVersion": "iforest-v1",
  "anomalyScore": 0.142,
  "driftScore": 0.085,
  "driftStatus": "NORMAL",
  "failureStatus": "NORMAL",
  "supportingFeatures": [],
  "inferenceLatencyMs": 3
}
```
