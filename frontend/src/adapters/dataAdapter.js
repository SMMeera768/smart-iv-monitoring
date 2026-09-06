/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Centralized Data Adapter
 *
 * Normalizes backend payloads to UI models and prevents duplicated mapping logic.
 * Ensures consistent handling of all backend fields without silent renaming.
 */

/**
 * Adapts raw bed data from REST API or Mock Store to standard UI Bed model.
 * 
 * Target fields handled:
 * - currentWeight, filteredWeight, flowRate, smoothedFlowRate, percentRemaining, baseline
 * - currentEventType, currentEventStatus, evidenceScore, anomalyScore, driftScore
 * - sensorStatus, deviceStatus, lastUpdated, dataFresh
 */
export function adaptBed(raw = {}) {
  const currentWeight = raw.currentWeight ?? raw.currentVolumeMl ?? 0;
  const filteredWeight = raw.filteredWeight ?? currentWeight;
  const flowRate = raw.flowRate ?? raw.flowRateMlPerHr ?? 0;
  const smoothedFlowRate = raw.smoothedFlowRate ?? flowRate;
  const baseline = raw.baseline ?? 500;
  
  // Compute or pass through remaining percentage
  const percentRemaining = raw.percentRemaining != null
    ? Math.max(0, Math.min(100, raw.percentRemaining))
    : baseline > 0
      ? Math.max(0, Math.min(100, (filteredWeight / baseline) * 100))
      : 0;

  return {
    id: String(raw.id ?? raw.bedId ?? raw.bedNumber ?? '1'),
    bedId: String(raw.bedId ?? raw.id ?? raw.bedNumber ?? '1'),
    name: raw.name ?? (raw.bedNumber ? `Bed ${raw.bedNumber}` : `Bed ${raw.id ?? '1'}`),
    deviceId: raw.deviceId ?? raw.deviceCode ?? 'ESP32-DEV',
    channelId: raw.channelId ?? 1,
    currentWeight: Number(Number(currentWeight).toFixed(1)),
    filteredWeight: Number(Number(filteredWeight).toFixed(1)),
    flowRate: Number(Number(flowRate).toFixed(1)),
    smoothedFlowRate: Number(Number(smoothedFlowRate).toFixed(1)),
    percentRemaining: Math.round(percentRemaining),
    baseline: Number(baseline),
    flowStatus: raw.flowStatus ?? (flowRate > 1.0 ? 'ACTIVE' : 'IDLE'),
    status: raw.status ?? 'NORMAL',
    currentEvent: raw.currentEvent ?? raw.currentEventType ?? 'NORMAL_FLOW',
    currentEventType: raw.currentEventType ?? raw.currentEvent ?? 'NORMAL_FLOW',
    currentEventStatus: raw.currentEventStatus ?? 'ACTIVE',
    evidenceScore: raw.evidenceScore != null ? Number(raw.evidenceScore) : null,
    driftScore: raw.driftScore != null ? Number(raw.driftScore) : 0,
    anomalyScore: raw.anomalyScore != null ? Number(raw.anomalyScore) : 0,
    alertPriority: raw.alertPriority ?? raw.severity ?? 'NORMAL',
    sensorStatus: raw.sensorStatus ?? 'NORMAL', // NORMAL | DRIFT | FAILURE
    deviceStatus: raw.deviceStatus ?? 'ONLINE', // ONLINE | DEGRADED | OFFLINE
    aiAvailable: raw.aiAvailable !== false,
    aiStatusText: raw.aiAvailable === false ? 'AI UNAVAILABLE' : (raw.aiStatusText ?? 'NOMINAL'),
    lastUpdated: raw.lastUpdated ?? raw.timestamp ?? new Date().toISOString(),
    dataFresh: raw.dataFresh !== false,
  };
}

/**
 * Adapts time-series reading payloads for chart consumption.
 * Expected format: { bedId, timestamp, weight, filteredWeight, flowRate }
 */
export function adaptReading(raw = {}) {
  return {
    bedId: String(raw.bedId ?? raw.bedNumber ?? '1'),
    timestamp: raw.timestamp ? new Date(raw.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
    rawTimestamp: raw.timestamp ?? new Date().toISOString(),
    weight: Number(Number(raw.weight ?? raw.rawWeight ?? raw.currentWeight ?? 0).toFixed(1)),
    filteredWeight: Number(Number(raw.filteredWeight ?? raw.weight ?? 0).toFixed(1)),
    flowRate: Number(Number(raw.flowRate ?? raw.smoothedFlowRate ?? 0).toFixed(1)),
  };
}

/**
 * Adapts event records.
 * Target format: { id, bedId, type, startTime, endTime, duration, severity, evidenceScore, status, reason }
 */
export function adaptEvent(raw = {}) {
  return {
    id: String(raw.id ?? raw.eventId ?? `evt-${Math.random()}`),
    bedId: String(raw.bedId ?? raw.bedNumber ?? '1'),
    type: raw.type ?? raw.eventType ?? 'NORMAL_FLOW',
    startTime: raw.startTime ?? raw.createdAt ?? new Date().toISOString(),
    endTime: raw.endTime ?? null,
    duration: raw.duration ?? (raw.endTime ? 'Ended' : 'Ongoing'),
    severity: raw.severity ?? 'INFO', // INFO | WARNING | CRITICAL
    evidenceScore: raw.evidenceScore != null ? Number(raw.evidenceScore) : null,
    status: raw.status ?? 'ACTIVE', // ACTIVE | RESOLVED
    reason: raw.reason ?? raw.explanation ?? raw.message ?? 'Standard nominal weight decrease observed.',
  };
}

/**
 * Adapts alert records.
 * Target format: { id, bedId, eventId, type, severity, evidenceScore, createdAt, acknowledgedAt, resolvedAt, status }
 */
export function adaptAlert(raw = {}) {
  return {
    id: String(raw.id ?? raw.alertId ?? `alt-${Math.random()}`),
    bedId: String(raw.bedId ?? raw.bedNumber ?? '1'),
    eventId: raw.eventId ? String(raw.eventId) : null,
    type: raw.type ?? raw.alertType ?? 'INFO',
    severity: raw.severity ?? 'WARNING', // WARNING | CRITICAL
    evidenceScore: raw.evidenceScore != null ? Number(raw.evidenceScore) : null,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    acknowledgedAt: raw.acknowledgedAt ?? null,
    resolvedAt: raw.resolvedAt ?? null,
    status: raw.status ?? 'DETECTED', // DETECTED | ACKNOWLEDGED | RESOLVED
    message: raw.message ?? raw.description ?? 'System alert detected.',
    acknowledgedByName: raw.acknowledgedByName ?? null,
  };
}

/**
 * Adapts AI telemetry status.
 */
export function adaptAiStatus(raw = {}) {
  return {
    bedId: String(raw.bedId ?? '1'),
    baseline: raw.baseline ?? 500,
    driftScore: Number(raw.driftScore ?? 0),
    anomalyScore: Number(raw.anomalyScore ?? 0),
    driftStatus: raw.driftStatus ?? 'NORMAL', // NORMAL | DRIFT_DETECTED
    failureStatus: raw.failureStatus ?? 'NORMAL', // NORMAL | FAILURE_DETECTED
    timestamp: raw.timestamp ?? new Date().toISOString(),
    aiAvailable: raw.aiAvailable !== false,
  };
}

/**
 * Adapts device health records.
 */
export function adaptDeviceStatus(raw = {}) {
  return {
    deviceId: String(raw.deviceId ?? raw.deviceCode ?? 'ESP32-DEV'),
    bedId: String(raw.bedId ?? '1'),
    esp32Status: raw.esp32Status ?? 'ONLINE',
    wifiStatus: raw.wifiStatus ?? 'CONNECTED',
    lastPacket: raw.lastPacket ?? raw.lastUpdated ?? new Date().toISOString(),
    samplingStatus: raw.samplingStatus ?? 'ACTIVE',
    hx711Status: raw.hx711Status ?? 'HEALTHY',
    sensorStatus: raw.sensorStatus ?? 'NORMAL',
    rssi: raw.rssi ?? -58,
    ipAddress: raw.ipAddress ?? '192.168.1.101',
  };
}
