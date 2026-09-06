/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Centralized Mock & Development Data Store
 *
 * Clearly labeled as DEMO / SYNTHETIC DATA for software-only validation.
 * No real physical load cells or ESP32 hardware data are present.
 */

export const IS_DEMO_DATA = true;
export const DATA_LABEL = "DEMO DATA (SYNTHETIC / DEVELOPMENT)";

export const mockUsers = {
  nurse: { id: "u-nurse", fullName: "Nurse Priya Sharma", role: "NURSE", email: "priya.nurse@hospital.test" },
  doctor: { id: "u-doc", fullName: "Dr. Ananya Ray", role: "DOCTOR", email: "ananya.doc@hospital.test" },
  biomed: { id: "u-biomed", fullName: "Er. Karthik V.", role: "BIOMEDICAL_ENGINEER", email: "karthik.biomed@hospital.test" },
  admin: { id: "u-admin", fullName: "Admin Rajesh Kumar", role: "ADMINISTRATOR", email: "admin@hospital.test" },
};

export const mockBeds = [
  {
    id: "1",
    bedId: "1",
    name: "Bed 1",
    deviceId: "ESP32-WROOM-01",
    channelId: 1,
    currentWeight: 382.4,
    filteredWeight: 381.9,
    flowRate: 54.5,
    smoothedFlowRate: 54.2,
    percentRemaining: 76,
    baseline: 500.0,
    flowStatus: "ACTIVE",
    status: "NORMAL",
    currentEvent: "NORMAL_FLOW",
    currentEventType: "NORMAL_FLOW",
    currentEventStatus: "ACTIVE",
    evidenceScore: 0.94,
    driftScore: 0.02,
    anomalyScore: -0.05,
    alertPriority: "NORMAL",
    sensorStatus: "NORMAL",
    deviceStatus: "ONLINE",
    aiAvailable: true,
    aiStatusText: "NOMINAL",
    lastUpdated: new Date().toISOString(),
    dataFresh: true,
  },
  {
    id: "2",
    bedId: "2",
    name: "Bed 2",
    deviceId: "ESP32-WROOM-02",
    channelId: 2,
    currentWeight: 38.6,
    filteredWeight: 38.2,
    flowRate: 0.0,
    smoothedFlowRate: 0.2,
    percentRemaining: 8,
    baseline: 500.0,
    flowStatus: "IDLE",
    status: "CRITICAL",
    currentEvent: "LOW_VOLUME",
    currentEventType: "LOW_VOLUME",
    currentEventStatus: "ACTIVE",
    evidenceScore: 0.91,
    driftScore: 0.04,
    anomalyScore: -0.32,
    alertPriority: "CRITICAL",
    sensorStatus: "NORMAL",
    deviceStatus: "ONLINE",
    aiAvailable: true,
    aiStatusText: "NOMINAL",
    lastUpdated: new Date().toISOString(),
    dataFresh: true,
  },
];

export function generateMockReadings(bedId = "1", count = 30) {
  const readings = [];
  const now = Date.now();
  const stepMs = 60 * 1000; // 1 minute per point
  const isBed1 = String(bedId) === "1";
  
  let baseWeight = isBed1 ? 420.0 : 55.0;
  const ratePerMin = isBed1 ? 0.9 : 0.05;

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * stepMs).toISOString();
    const noise = (Math.sin(i * 0.5) * 0.4);
    const weight = Math.max(10, baseWeight - (count - i) * ratePerMin + noise);
    const filteredWeight = weight - (noise * 0.7);
    const flowRate = isBed1 ? Math.max(0, 52.0 + Math.cos(i * 0.3) * 3.5) : (i > 15 ? 0.0 : 45.0);

    readings.push({
      bedId: String(bedId),
      timestamp: time,
      weight: Number(weight.toFixed(1)),
      filteredWeight: Number(filteredWeight.toFixed(1)),
      flowRate: Number(flowRate.toFixed(1)),
    });
  }
  return readings;
}

export const mockEvents = [
  {
    id: "EVT-101",
    bedId: "1",
    type: "NORMAL_FLOW",
    startTime: new Date(Date.now() - 45 * 60000).toISOString(),
    endTime: null,
    duration: "45 min (Ongoing)",
    severity: "INFO",
    evidenceScore: 0.95,
    status: "ACTIVE",
    reason: "Consistent downward mass slope (-0.91 g/min) matching ordered 55 mL/hr rate.",
  },
  {
    id: "EVT-102",
    bedId: "2",
    type: "LOW_VOLUME",
    startTime: new Date(Date.now() - 14 * 60000).toISOString(),
    endTime: null,
    duration: "14 min (Ongoing)",
    severity: "CRITICAL",
    evidenceScore: 0.91,
    status: "ACTIVE",
    reason: "Infusion bag weight dropped below 50.0g configured low-volume safety threshold.",
  },
  {
    id: "EVT-103",
    bedId: "2",
    type: "FLOW_INTERRUPTION",
    startTime: new Date(Date.now() - 32 * 60000).toISOString(),
    endTime: new Date(Date.now() - 18 * 60000).toISOString(),
    duration: "14 min",
    severity: "WARNING",
    evidenceScore: 0.88,
    status: "RESOLVED",
    reason: "Zero delta weight observed for >180 consecutive seconds while clamp suspected closed.",
  },
  {
    id: "EVT-104",
    bedId: "1",
    type: "BAG_REPLACEMENT",
    startTime: new Date(Date.now() - 120 * 60000).toISOString(),
    endTime: new Date(Date.now() - 116 * 60000).toISOString(),
    duration: "4 min",
    severity: "INFO",
    evidenceScore: 0.96,
    status: "RESOLVED",
    reason: "Positive mass step (+475g) detected followed by standard 60s stabilization period.",
  },
  {
    id: "EVT-105",
    bedId: "1",
    type: "SENSOR_DRIFT",
    startTime: new Date(Date.now() - 240 * 60000).toISOString(),
    endTime: new Date(Date.now() - 220 * 60000).toISOString(),
    duration: "20 min",
    severity: "WARNING",
    evidenceScore: 0.76,
    status: "RESOLVED",
    reason: "Isolation Forest flagged continuous non-physiological upward baseline drift (+0.18 g/min).",
  },
];

export const mockAlerts = [
  {
    id: "ALT-201",
    bedId: "2",
    eventId: "EVT-102",
    type: "LOW_VOLUME",
    severity: "CRITICAL",
    evidenceScore: 0.91,
    createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
    status: "DETECTED",
    message: "Bed 2: Remaining volume is 38 mL (< 50 mL threshold). Replace IV container immediately.",
    acknowledgedByName: null,
  },
  {
    id: "ALT-202",
    bedId: "2",
    eventId: "EVT-103",
    type: "FLOW_INTERRUPTION",
    severity: "WARNING",
    evidenceScore: 0.88,
    createdAt: new Date(Date.now() - 32 * 60000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 28 * 60000).toISOString(),
    resolvedAt: new Date(Date.now() - 18 * 60000).toISOString(),
    status: "RESOLVED",
    message: "Bed 2: Flow interruption detected. Line cleared by attending staff.",
    acknowledgedByName: "Nurse Priya Sharma",
  },
  {
    id: "ALT-203",
    bedId: "1",
    eventId: "EVT-105",
    type: "SENSOR_DRIFT",
    severity: "WARNING",
    evidenceScore: 0.76,
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 230 * 60000).toISOString(),
    resolvedAt: new Date(Date.now() - 220 * 60000).toISOString(),
    status: "RESOLVED",
    message: "Bed 1: AI Isolation Forest detected slow drift. Tare verified by biomedical engineer.",
    acknowledgedByName: "Er. Karthik V.",
  },
];

export const mockDeviceStatus = {
  systemStatus: "ONLINE", // ONLINE | DEGRADED | OFFLINE
  serverTime: new Date().toISOString(),
  devices: [
    {
      deviceId: "ESP32-WROOM-01",
      bedId: "1",
      esp32Status: "ONLINE",
      wifiStatus: "CONNECTED",
      lastPacket: new Date(Date.now() - 2000).toISOString(),
      samplingStatus: "ACTIVE (10 Hz)",
      hx711Status: "HEALTHY (Dual Channel)",
      sensorStatus: "NORMAL",
      rssi: -54,
      ipAddress: "192.168.1.111",
      firmwareVersion: "v1.2.0-sim",
      gpioPins: "DT: 21, SCK: 22",
    },
    {
      deviceId: "ESP32-WROOM-02",
      bedId: "2",
      esp32Status: "ONLINE",
      wifiStatus: "CONNECTED",
      lastPacket: new Date(Date.now() - 1500).toISOString(),
      samplingStatus: "ACTIVE (10 Hz)",
      hx711Status: "HEALTHY (Dual Channel)",
      sensorStatus: "NORMAL",
      rssi: -58,
      ipAddress: "192.168.1.112",
      firmwareVersion: "v1.2.0-sim",
      gpioPins: "DT: 19, SCK: 18",
    },
  ],
};

export const mockCalibration = {
  "1": {
    bedId: "1",
    deviceId: "ESP32-WROOM-01",
    channel: 1,
    calibrationStatus: "CALIBRATED (SOFTWARE SIMULATED)",
    calibrationFactor: 420.50,
    zeroTareStatus: "ZEROED",
    tareOffset: 12540,
    lastCalibrationTime: "2026-09-05 14:30:00 UTC",
    isExperimental: false,
    disclaimer: "Software demonstration values only. Physical calibration factors not validated.",
  },
  "2": {
    bedId: "2",
    deviceId: "ESP32-WROOM-02",
    channel: 2,
    calibrationStatus: "CALIBRATED (SOFTWARE SIMULATED)",
    calibrationFactor: 418.25,
    zeroTareStatus: "ZEROED",
    tareOffset: 11890,
    lastCalibrationTime: "2026-09-05 14:45:00 UTC",
    isExperimental: false,
    disclaimer: "Software demonstration values only. Physical calibration factors not validated.",
  },
};

export const mockConfiguration = {
  lowVolumeThreshold: 50.0, // g / mL
  flowInterruptionThreshold: 0.5, // mL / hr
  minInterruptionDurationSec: 180, // seconds
  bagReplacementThreshold: 200.0, // g step
  driftThreshold: 0.15, // g/min slope
  anomalyThreshold: -0.25, // Isolation Forest decision function cutoff
  samplingIntervalMs: 100, // 10 Hz
  lastUpdated: new Date().toISOString(),
  source: "Configured by backend",
};

export const mockAnalytics = {
  summary: {
    totalBedsMonitored: 2,
    activeInfusions: 1,
    activeAlerts: 1,
    resolvedAlerts24h: 4,
    totalEvents24h: 18,
    averageFlowRateMlHr: 48.2,
    averageEvidenceScore: 0.92,
  },
  eventsByBed: [
    { bedId: "1", bedName: "Bed 1", count: 8 },
    { bedId: "2", bedName: "Bed 2", count: 10 },
  ],
  alertsBySeverity: {
    CRITICAL: 1,
    WARNING: 2,
    INFO: 1,
  },
  eventTypesDistribution: [
    { type: "NORMAL_FLOW", count: 11 },
    { type: "LOW_VOLUME", count: 3 },
    { type: "FLOW_INTERRUPTION", count: 2 },
    { type: "BAG_REPLACEMENT", count: 1 },
    { type: "SENSOR_DRIFT", count: 1 },
  ],
};

/**
 * RESEARCH METRICS
 * Note: Per specification Section 11 & 35, all experimental numbers MUST return
 * "Awaiting experimental data" until physical experiments are completed.
 */
export const mockResearchMetrics = {
  mae: "Awaiting experimental data",
  rmse: "Awaiting experimental data",
  flowRateMae: "Awaiting experimental data",
  accuracy: "Awaiting experimental data",
  precision: "Awaiting experimental data",
  recall: "Awaiting experimental data",
  f1Score: "Awaiting experimental data",
  detectionLatency: "Awaiting experimental data",
  confusionMatrix: "Awaiting experimental data",
  driftDetectionRate: "Awaiting experimental data",
  status: "NO_EXPERIMENTAL_RESULTS_AVAILABLE",
  notice: "Awaiting experimental data. Values will be populated upon completion of physical load-cell testing.",
};

export const mockAuditLogs = [
  {
    id: "AUD-501",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    user: "Nurse Priya Sharma",
    role: "NURSE",
    action: "Alert Viewed",
    bed: "Bed 2",
    event: "LOW_VOLUME",
    result: "SUCCESS",
  },
  {
    id: "AUD-502",
    timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
    user: "Nurse Priya Sharma",
    role: "NURSE",
    action: "Alert Acknowledged",
    bed: "Bed 2",
    event: "FLOW_INTERRUPTION",
    result: "SUCCESS",
  },
  {
    id: "AUD-503",
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    user: "Nurse Priya Sharma",
    role: "NURSE",
    action: "Alert Resolved",
    bed: "Bed 2",
    event: "FLOW_INTERRUPTION",
    result: "SUCCESS",
  },
  {
    id: "AUD-504",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    user: "Er. Karthik V.",
    role: "BIOMEDICAL_ENGINEER",
    action: "Zero / Tare Executed",
    bed: "Bed 1",
    event: "CALIBRATION_TARE",
    result: "SUCCESS",
  },
  {
    id: "AUD-505",
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    user: "Admin Rajesh Kumar",
    role: "ADMINISTRATOR",
    action: "Configuration Changed",
    bed: "SYSTEM",
    event: "THRESHOLD_UPDATE",
    result: "SUCCESS",
  },
];
