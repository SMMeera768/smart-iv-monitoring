/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Centralized Mock & Development Data Store (Backend DTO Aligned)
 *
 * Clearly labeled as DEMO / SYNTHETIC DATA for software-only validation.
 * Represents 1 ESP32 (ESP32_01) with 2 channels serving Bed 1 (BED_1) and Bed 2 (BED_2).
 */

export const IS_DEMO_DATA = true;
export const DATA_LABEL = "DEMO DATA (SYNTHETIC / DEVELOPMENT)";

export const mockUsers = {
  nurse: { id: "1", username: "priya_nurse", fullName: "Nurse Priya Sharma", role: "NURSE", email: "priya.nurse@smartiv.local" },
  doctor: { id: "2", username: "ananya_doc", fullName: "Dr. Ananya Ray", role: "DOCTOR", email: "ananya.doc@smartiv.local" },
  biomed: { id: "3", username: "biomed_engineer", fullName: "Er. Karthik V.", role: "BIOMEDICAL_ENGINEER", email: "karthik.biomed@smartiv.local" },
  admin: { id: "4", username: "admin", fullName: "Admin Rajesh Kumar", role: "ADMINISTRATOR", email: "admin@smartiv.local" },
};

export const mockBeds = [
  {
    bedId: "1",
    bedCode: "BED_1",
    name: "Bed 1",
    deviceId: "ESP32_01",
    deviceStatus: "ONLINE",
    lastUpdated: new Date().toISOString(),
    dataFresh: true,
    currentWeight: 382.4,
    filteredWeight: 381.9,
    flowRate: 54.5,
    smoothedFlowRate: 54.2,
    percentRemaining: 76.0,
    baseline: 500.0,
    currentEventType: "NORMAL_FLOW",
    currentEventStatus: "ACTIVE",
    evidenceScore: 94,
    anomalyScore: -0.05,
    driftScore: 0.02,
    sensorStatus: "NORMAL",
  },
  {
    bedId: "2",
    bedCode: "BED_2",
    name: "Bed 2",
    deviceId: "ESP32_01",
    deviceStatus: "ONLINE",
    lastUpdated: new Date().toISOString(),
    dataFresh: true,
    currentWeight: 38.6,
    filteredWeight: 38.2,
    flowRate: 0.0,
    smoothedFlowRate: 0.2,
    percentRemaining: 8.0,
    baseline: 500.0,
    currentEventType: "LOW_VOLUME",
    currentEventStatus: "ACTIVE",
    evidenceScore: 91,
    anomalyScore: -0.32,
    driftScore: 0.04,
    sensorStatus: "NORMAL",
  },
];

export const mockDashboardSummary = {
  systemStatus: "ONLINE",
  totalBeds: 2,
  normalBeds: 1,
  activeAlerts: 1,
  physicalDevicesOnline: 1,
  sensorChannelsOnline: 2,
  beds: mockBeds,
  timestamp: new Date().toISOString(),
};

export function generateMockReadings(bedCode = "BED_1", count = 30) {
  const readings = [];
  const now = Date.now();
  const stepMs = 60 * 1000;
  const isBed1 = bedCode === "BED_1" || bedCode === "1";
  
  let baseWeight = isBed1 ? 420.0 : 55.0;
  const ratePerMin = isBed1 ? 0.9 : 0.05;

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * stepMs).toISOString();
    const noise = (Math.sin(i * 0.5) * 0.4);
    const weight = Math.max(10, baseWeight - (count - i) * ratePerMin + noise);
    const filteredWeight = weight - (noise * 0.7);
    const flowRate = isBed1 ? Math.max(0, 52.0 + Math.cos(i * 0.3) * 3.5) : (i > 15 ? 0.0 : 45.0);

    readings.push({
      timestamp: time,
      rawWeight: Number(weight.toFixed(1)),
      filteredWeight: Number(filteredWeight.toFixed(1)),
      flowRate: Number(flowRate.toFixed(1)),
      baseline: 500.0,
    });
  }
  return readings;
}

export const mockEvents = [
  {
    id: 101,
    eventUuid: "e101-0000-0000-000000000001",
    bedCode: "BED_1",
    deviceCode: "ESP32_01",
    eventType: "NORMAL_FLOW",
    detectedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    startTime: new Date(Date.now() - 45 * 60000).toISOString(),
    endTime: null,
    durationMs: 45 * 60000,
    severity: "INFO",
    evidenceScore: 95,
    explanation: "Consistent downward mass slope (-0.91 g/min) matching ordered 55 mL/hr rate.",
    triggeringFeatures: { slope: -0.91, rSquared: 0.98 },
    status: "ACTIVE",
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedBy: null,
    resolvedAt: null,
  },
  {
    id: 102,
    eventUuid: "e102-0000-0000-000000000002",
    bedCode: "BED_2",
    deviceCode: "ESP32_01",
    eventType: "LOW_VOLUME",
    detectedAt: new Date(Date.now() - 14 * 60000).toISOString(),
    startTime: new Date(Date.now() - 14 * 60000).toISOString(),
    endTime: null,
    durationMs: 14 * 60000,
    severity: "CRITICAL",
    evidenceScore: 91,
    explanation: "Infusion bag weight dropped below 50.0g configured low-volume safety threshold.",
    triggeringFeatures: { weightG: 38.6, thresholdG: 50.0 },
    status: "ACTIVE",
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedBy: null,
    resolvedAt: null,
  },
  {
    id: 103,
    eventUuid: "e103-0000-0000-000000000003",
    bedCode: "BED_2",
    deviceCode: "ESP32_01",
    eventType: "FLOW_INTERRUPTION",
    detectedAt: new Date(Date.now() - 32 * 60000).toISOString(),
    startTime: new Date(Date.now() - 32 * 60000).toISOString(),
    endTime: new Date(Date.now() - 18 * 60000).toISOString(),
    durationMs: 14 * 60000,
    severity: "WARNING",
    evidenceScore: 88,
    explanation: "Zero delta weight observed for >120 consecutive seconds while clamp suspected closed.",
    triggeringFeatures: { flowRate: 0.0, persistenceMs: 140000 },
    status: "RESOLVED",
    acknowledgedBy: "Nurse Priya Sharma",
    acknowledgedAt: new Date(Date.now() - 28 * 60000).toISOString(),
    resolvedBy: "Nurse Priya Sharma",
    resolvedAt: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: 104,
    eventUuid: "e104-0000-0000-000000000004",
    bedCode: "BED_1",
    deviceCode: "ESP32_01",
    eventType: "BAG_REPLACEMENT",
    detectedAt: new Date(Date.now() - 120 * 60000).toISOString(),
    startTime: new Date(Date.now() - 120 * 60000).toISOString(),
    endTime: new Date(Date.now() - 116 * 60000).toISOString(),
    durationMs: 4 * 60000,
    severity: "INFO",
    evidenceScore: 96,
    explanation: "Positive mass step (+475g) detected followed by standard 30s stabilization period.",
    triggeringFeatures: { weightDeltaG: 475.0, stabilityScore: 0.99 },
    status: "RESOLVED",
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedBy: "Nurse Priya Sharma",
    resolvedAt: new Date(Date.now() - 116 * 60000).toISOString(),
  }
];

export const mockAlerts = [
  {
    id: 201,
    alertUuid: "a201-0000-0000-000000000001",
    bedCode: "BED_2",
    alertType: "LOW_VOLUME",
    severity: "CRITICAL",
    evidenceScore: 91,
    message: "BED_2: Remaining volume is 38 mL (< 50 mL threshold). Replace IV container immediately.",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
    acknowledgedAt: null,
    acknowledgedBy: null,
    resolvedAt: null,
    resolvedBy: null,
  },
  {
    id: 202,
    alertUuid: "a202-0000-0000-000000000002",
    bedCode: "BED_2",
    alertType: "FLOW_INTERRUPTION",
    severity: "WARNING",
    evidenceScore: 88,
    message: "BED_2: Flow interruption detected. Attending staff verified line cleared.",
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 32 * 60000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 28 * 60000).toISOString(),
    acknowledgedBy: "Nurse Priya Sharma",
    resolvedAt: new Date(Date.now() - 18 * 60000).toISOString(),
    resolvedBy: "Nurse Priya Sharma",
  },
];

// Single physical ESP32 device serving two beds (BED_1 and BED_2)
export const mockDevices = [
  {
    id: 1,
    deviceCode: "ESP32_01",
    hardwareType: "ESP32 DevKit V1",
    firmwareVersion: "v1.0.0",
    wifiStatus: "CONNECTED",
    deviceStatus: "ONLINE",
    lastSeenAt: new Date().toISOString(),
    registeredAt: "2026-09-01T00:00:00Z",
    active: true,
    associatedBeds: ["BED_1", "BED_2"]
  }
];

export const mockCalibration = {
  "BED_1": {
    id: 1,
    bedCode: "BED_1",
    deviceCode: "ESP32_01",
    channelId: "HX711_1",
    calibrationFactor: 420.50,
    zeroOffset: 0.0,
    knownReferenceWeight: 500.0,
    calibratedAt: new Date().toISOString(),
    calibratedBy: "biomed_engineer",
    notes: "Software simulated baseline — laboratory calibration pending",
    active: true,
  },
  "BED_2": {
    id: 2,
    bedCode: "BED_2",
    deviceCode: "ESP32_01",
    channelId: "HX711_2",
    calibrationFactor: 418.25,
    zeroOffset: 0.0,
    knownReferenceWeight: 500.0,
    calibratedAt: new Date().toISOString(),
    calibratedBy: "biomed_engineer",
    notes: "Software simulated baseline — laboratory calibration pending",
    active: true,
  },
};

export const mockConfigurationList = [
  { id: 1, configKey: 'signal.movingAverageWindow', configValue: '10', description: 'Moving average filter window size (samples) — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 2, configKey: 'signal.flowSmoothingWindow', configValue: '5', description: 'Flow rate smoothing window (samples) — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 3, configKey: 'signal.featureWindow', configValue: '20', description: 'Feature extraction rolling window (samples) — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 4, configKey: 'signal.baselineWindow', configValue: '60', description: 'Baseline estimation window (samples) — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 5, configKey: 'rules.flowInterruptionThreshold', configValue: '0.5', description: 'Near-zero flow threshold (g/min) — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 6, configKey: 'rules.flowInterruptionMinDuration', configValue: '120000', description: 'Min duration for flow interruption (ms) — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 7, configKey: 'rules.lowVolumeThreshold', configValue: '15.0', description: 'Low volume alert threshold (% remaining) — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 8, configKey: 'rules.bagReplacementWeightJump', configValue: '50.0', description: 'Min weight jump for bag replacement (g) — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 9, configKey: 'rules.bagReplacementStability', configValue: '30000', description: 'Post-jump stability duration (ms) — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 10, configKey: 'ai.anomalyThreshold', configValue: '0.6', description: 'Normalized anomaly index threshold — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 11, configKey: 'ai.driftThreshold', configValue: '0.5', description: 'Drift score threshold — EXPERIMENTAL', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
  { id: 12, configKey: 'device.offlineTimeoutMs', configValue: '300000', description: 'Device offline timeout (ms)', updatedAt: new Date().toISOString(), updatedBy: 'admin' },
];

export const mockAnalytics = {
  timestamp: new Date().toISOString(),
  totalEvents: 18,
  normalFlowEvents: 11,
  flowInterruptionEvents: 3,
  lowVolumeEvents: 2,
  bagReplacementEvents: 1,
  sensorDriftEvents: 1,
  sensorFailureEvents: 0,
  totalAlerts: 6,
  openAlerts: 1,
  acknowledgedAlerts: 1,
  resolvedAlerts: 4,
  averageFlowRateGPerMin: 0.81,
  averageEvidenceScore: 92.4,
  eventsByBed: {
    "BED_1": 8,
    "BED_2": 10,
  },
  alertsBySeverity: {
    "CRITICAL": 2,
    "WARNING": 3,
    "INFO": 1,
  },
};

/**
 * RESEARCH METRICS
 * Strict compliance with Section 10 & 35:
 * Labeled explicitly as "Development/Synthetic data — not validated experimental results".
 */
export const mockResearchMetrics = {
  evaluationType: "SYNTHETIC_DATASET_RESULT",
  timestamp: new Date().toISOString(),
  modelVersion: "IsolationForest-v1.0-dev",
  meanAbsoluteErrorWeightG: 0.0,
  rootMeanSquareErrorWeightG: 0.0,
  flowRateMaeGPerMin: 0.0,
  eventAccuracy: 0.0,
  eventPrecision: 0.0,
  eventRecall: 0.0,
  eventF1Score: 0.0,
  averageDetectionLatencyMs: 0.0,
  aiDriftDetectionRate: 0.0,
  aiAnomalyPrecision: 0.0,
  aiAnomalyRecall: 0.0,
  confusionMatrix: {},
  disclaimer: "Development/Synthetic data — not validated experimental results. Awaiting physical experimental data.",
  statusText: "Awaiting experimental data",
};

export const mockAuditLogs = [
  {
    id: 501,
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    username: "priya_nurse",
    action: "ALERT_VIEWED",
    entityType: "ALERT",
    entityId: "201",
    bedCode: "BED_2",
    previousValue: null,
    newValue: null,
    result: "SUCCESS",
    metadata: { view: "ALERTS" }
  },
  {
    id: 502,
    timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
    username: "priya_nurse",
    action: "ALERT_ACKNOWLEDGED",
    entityType: "ALERT",
    entityId: "202",
    bedCode: "BED_2",
    previousValue: "ACTIVE",
    newValue: "ACKNOWLEDGED",
    result: "SUCCESS",
    metadata: { note: "Attending line check" }
  },
  {
    id: 503,
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    username: "priya_nurse",
    action: "ALERT_RESOLVED",
    entityType: "ALERT",
    entityId: "202",
    bedCode: "BED_2",
    previousValue: "ACKNOWLEDGED",
    newValue: "RESOLVED",
    result: "SUCCESS",
    metadata: { note: "Infusion flowing nominally" }
  },
  {
    id: 504,
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    username: "biomed_engineer",
    action: "CALIBRATION_TARE",
    entityType: "CALIBRATION",
    entityId: "1",
    bedCode: "BED_1",
    previousValue: "0.0",
    newValue: "0.0",
    result: "SUCCESS",
    metadata: { channel: "HX711_1" }
  },
  {
    id: 505,
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    username: "admin",
    action: "CONFIGURATION_UPDATE",
    entityType: "SYSTEM_CONFIGURATION",
    entityId: "7",
    bedCode: "SYSTEM",
    previousValue: "10.0",
    newValue: "15.0",
    result: "SUCCESS",
    metadata: { key: "rules.lowVolumeThreshold" }
  }
];
