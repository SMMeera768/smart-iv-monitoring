/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Centralized Data Adapter (Production & PoC Ready)
 *
 * Strict 1:1 mapping with Spring Boot Backend DTOs:
 * - DashboardSummaryResponse, BedStatusResponse, ReadingPoint
 * - AlertResponse (Page<AlertResponse>)
 * - EventResponse (Page<EventResponse>)
 * - DeviceResponse (List<DeviceResponse>)
 * - ConfigurationResponse (List<ConfigurationResponse>)
 * - AuditLogResponse (Page<AuditLogResponse>)
 * - CalibrationResponse
 * - ResearchMetricsResponse
 */

/**
 * Extracts items from paginated responses (Page<T>) or standard arrays.
 */
export function extractPageContent(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.content)) return raw.content;
  if (Array.isArray(raw.beds)) return raw.beds;
  if (Array.isArray(raw.devices)) return raw.devices;
  return [];
}

/**
 * Adapts DashboardSummaryResponse from GET /api/dashboard/summary
 */
export function adaptDashboardSummary(raw = {}) {
  const bedsList = Array.isArray(raw) ? raw : (raw.beds || []);
  const adaptedBeds = bedsList.map(adaptBed);

  return {
    beds: adaptedBeds,
    summary: {
      systemStatus: raw.systemStatus || (adaptedBeds.some(b => b.deviceStatus === 'OFFLINE') ? 'DEGRADED' : 'ONLINE'),
      totalBeds: raw.totalBeds ?? adaptedBeds.length,
      normalBeds: raw.normalBeds ?? adaptedBeds.filter(b => b.status === 'NORMAL').length,
      activeAlerts: raw.activeAlerts ?? 0,
      physicalDevicesOnline: raw.physicalDevicesOnline ?? (adaptedBeds.length > 0 ? 1 : 0),
      sensorChannelsOnline: raw.sensorChannelsOnline ?? adaptedBeds.filter(b => b.dataFresh).length,
      timestamp: raw.timestamp || new Date().toISOString(),
    }
  };
}

/**
 * Adapts BedStatusResponse from GET /api/dashboard/bed/{bedCode} or summary.beds
 */
export function adaptBed(raw = {}) {
  const currentWeight = raw.currentWeight ?? raw.currentVolumeMl ?? 0;
  const filteredWeight = raw.filteredWeight ?? currentWeight;
  const flowRate = raw.flowRate ?? raw.flowRateMlPerHr ?? 0;
  const smoothedFlowRate = raw.smoothedFlowRate ?? flowRate;
  const baseline = raw.baseline ?? 500.0;

  // Evidence score is 0-100 integer in Spring Boot DTO
  let evidenceScore = raw.evidenceScore;
  if (evidenceScore != null) {
    evidenceScore = Number(evidenceScore);
    if (evidenceScore <= 1.0 && evidenceScore > 0) {
      evidenceScore = Math.round(evidenceScore * 100);
    }
  }

  // Percent remaining
  let percentRemaining = raw.percentRemaining;
  if (percentRemaining == null) {
    percentRemaining = baseline > 0 ? (filteredWeight / baseline) * 100 : 0;
  }
  percentRemaining = Math.max(0, Math.min(100, Math.round(percentRemaining)));

  const bedCode = raw.bedCode || (raw.bedId ? (String(raw.bedId).startsWith('BED_') ? raw.bedId : `BED_${raw.bedId}`) : 'BED_1');
  const channelId = bedCode === 'BED_2' ? 'HX711_2' : 'HX711_1';

  // Sensor status mapping
  let sensorStatus = raw.sensorStatus || 'NORMAL';
  if (sensorStatus === 'POSSIBLE_DRIFT') sensorStatus = 'DRIFT';
  if (sensorStatus === 'POSSIBLE_SENSOR_FAILURE') sensorStatus = 'FAILURE';

  return {
    id: String(raw.id ?? raw.bedId ?? bedCode),
    bedId: String(raw.bedId ?? bedCode),
    bedCode: bedCode,
    name: raw.name || (bedCode === 'BED_2' ? 'Bed 2' : 'Bed 1'),
    deviceId: raw.deviceId || 'ESP32_01',
    channelId: channelId,
    currentWeight: Number(Number(currentWeight).toFixed(1)),
    filteredWeight: Number(Number(filteredWeight).toFixed(1)),
    flowRate: Number(Number(flowRate).toFixed(1)),
    smoothedFlowRate: Number(Number(smoothedFlowRate).toFixed(1)),
    percentRemaining: percentRemaining,
    baseline: Number(baseline),
    flowStatus: raw.flowStatus ?? (flowRate > 0.1 ? 'ACTIVE' : 'IDLE'),
    status: raw.deviceStatus === 'OFFLINE' ? 'OFFLINE' : (raw.currentEventType && raw.currentEventType !== 'NORMAL_FLOW' ? 'CRITICAL' : 'NORMAL'),
    currentEvent: raw.currentEventType || raw.currentEvent || 'NORMAL_FLOW',
    currentEventType: raw.currentEventType || raw.currentEvent || 'NORMAL_FLOW',
    currentEventStatus: raw.currentEventStatus || 'ACTIVE',
    evidenceScore: evidenceScore,
    driftScore: raw.driftScore != null ? Number(Number(raw.driftScore).toFixed(2)) : 0.0,
    anomalyScore: raw.anomalyScore != null ? Number(Number(raw.anomalyScore).toFixed(2)) : 0.0,
    alertPriority: (raw.currentEventType === 'LOW_VOLUME' || raw.currentEventType === 'FLOW_INTERRUPTION') ? 'CRITICAL' : 'NORMAL',
    sensorStatus: sensorStatus,
    deviceStatus: raw.deviceStatus || 'ONLINE',
    aiAvailable: raw.sensorStatus !== 'AI_UNAVAILABLE' && raw.aiAvailable !== false,
    aiStatusText: raw.sensorStatus === 'AI_UNAVAILABLE' ? 'AI UNAVAILABLE' : (raw.sensorStatus || 'NOMINAL'),
    lastUpdated: raw.lastUpdated ? new Date(raw.lastUpdated).toISOString() : new Date().toISOString(),
    dataFresh: raw.dataFresh !== false,
  };
}

/**
 * Adapts ReadingPoint from GET /api/dashboard/bed/{bedCode}/readings
 * Record shape: (Instant timestamp, Double rawWeight, Double filteredWeight, Double flowRate, Double baseline)
 */
export function adaptReading(raw = {}) {
  const ts = raw.timestamp ? new Date(raw.timestamp) : new Date();
  const timeStr = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return {
    timestamp: timeStr,
    rawTimestamp: ts.toISOString(),
    weight: Number(Number(raw.rawWeight ?? raw.weight ?? 0).toFixed(1)),
    filteredWeight: Number(Number(raw.filteredWeight ?? raw.weight ?? 0).toFixed(1)),
    flowRate: Number(Number(raw.flowRate ?? 0).toFixed(1)),
    baseline: raw.baseline != null ? Number(raw.baseline) : null,
  };
}

/**
 * Adapts AlertResponse from GET /api/alerts (Page<AlertResponse>)
 */
export function adaptAlert(raw = {}) {
  const bedCode = raw.bedCode || (raw.bedId ? `BED_${raw.bedId}` : 'BED_1');
  const alertType = raw.alertType || raw.type || 'LOW_VOLUME';

  let evidenceScore = raw.evidenceScore;
  if (evidenceScore != null) {
    evidenceScore = Number(evidenceScore);
    if (evidenceScore <= 1.0 && evidenceScore > 0) evidenceScore = Math.round(evidenceScore * 100);
  }

  return {
    id: raw.id != null ? String(raw.id) : (raw.alertUuid ? String(raw.alertUuid) : `alt-${Date.now()}`),
    alertUuid: raw.alertUuid,
    bedCode: bedCode,
    bedId: bedCode === 'BED_2' ? '2' : '1',
    type: alertType,
    alertType: alertType,
    severity: raw.severity || 'WARNING',
    evidenceScore: evidenceScore,
    message: raw.message || `Alert detected on ${bedCode}.`,
    status: raw.status || 'DETECTED', // ACTIVE, ACKNOWLEDGED, RESOLVED, DETECTED
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    acknowledgedAt: raw.acknowledgedAt ? new Date(raw.acknowledgedAt).toISOString() : null,
    acknowledgedBy: raw.acknowledgedBy || raw.acknowledgedByName || null,
    resolvedAt: raw.resolvedAt ? new Date(raw.resolvedAt).toISOString() : null,
    resolvedBy: raw.resolvedBy || null,
  };
}

/**
 * Adapts EventResponse from GET /api/events (Page<EventResponse>)
 */
export function adaptEvent(raw = {}) {
  const bedCode = raw.bedCode || (raw.bedId ? `BED_${raw.bedId}` : 'BED_1');
  const eventType = raw.eventType || raw.type || 'NORMAL_FLOW';

  let evidenceScore = raw.evidenceScore;
  if (evidenceScore != null) {
    evidenceScore = Number(evidenceScore);
    if (evidenceScore <= 1.0 && evidenceScore > 0) evidenceScore = Math.round(evidenceScore * 100);
  }

  // Duration formatting
  let durationStr = raw.duration;
  if (!durationStr && raw.durationMs != null) {
    const mins = Math.round(raw.durationMs / 60000);
    durationStr = mins > 0 ? `${mins} min` : `${Math.round(raw.durationMs / 1000)} sec`;
  } else if (!durationStr) {
    durationStr = raw.endTime ? 'Completed' : 'Ongoing';
  }

  return {
    id: raw.id != null ? String(raw.id) : (raw.eventUuid ? String(raw.eventUuid) : `evt-${Date.now()}`),
    eventUuid: raw.eventUuid,
    bedCode: bedCode,
    bedId: bedCode === 'BED_2' ? '2' : '1',
    deviceCode: raw.deviceCode || 'ESP32_01',
    type: eventType,
    eventType: eventType,
    detectedAt: raw.detectedAt ? new Date(raw.detectedAt).toISOString() : (raw.startTime ? new Date(raw.startTime).toISOString() : new Date().toISOString()),
    startTime: raw.startTime ? new Date(raw.startTime).toISOString() : new Date().toISOString(),
    endTime: raw.endTime ? new Date(raw.endTime).toISOString() : null,
    duration: durationStr,
    durationMs: raw.durationMs,
    severity: raw.severity || 'INFO',
    evidenceScore: evidenceScore,
    reason: raw.explanation || raw.reason || 'Nominal infusion flow observed.',
    explanation: raw.explanation || raw.reason || 'Nominal infusion flow observed.',
    triggeringFeatures: raw.triggeringFeatures || {},
    status: raw.status || 'ACTIVE',
    acknowledgedBy: raw.acknowledgedBy || null,
    acknowledgedAt: raw.acknowledgedAt || null,
    resolvedBy: raw.resolvedBy || null,
    resolvedAt: raw.resolvedAt || null,
  };
}

/**
 * Adapts DeviceResponse from GET /api/devices (List<DeviceResponse>)
 */
export function adaptDevice(raw = {}) {
  const associatedBeds = Array.isArray(raw.associatedBeds) ? raw.associatedBeds : ['BED_1', 'BED_2'];

  return {
    id: raw.id,
    deviceCode: raw.deviceCode || 'ESP32_01',
    hardwareType: raw.hardwareType || 'ESP32 DevKit V1',
    firmwareVersion: raw.firmwareVersion || 'v1.0.0',
    wifiStatus: raw.wifiStatus || 'CONNECTED',
    deviceStatus: raw.deviceStatus || 'ONLINE',
    lastSeenAt: raw.lastSeenAt ? new Date(raw.lastSeenAt).toISOString() : new Date().toISOString(),
    registeredAt: raw.registeredAt ? new Date(raw.registeredAt).toISOString() : null,
    active: raw.active !== false,
    associatedBeds: associatedBeds,
    channels: [
      { channelId: 'HX711_1', bedCode: 'BED_1', pins: 'DT 21 / SCK 22' },
      { channelId: 'HX711_2', bedCode: 'BED_2', pins: 'DT 19 / SCK 18' }
    ]
  };
}

/**
 * Adapts ConfigurationResponse from GET /api/configuration (List<ConfigurationResponse>)
 */
export function adaptConfigurationList(rawList = []) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(c => ({
    id: c.id,
    configKey: c.configKey,
    configValue: c.configValue,
    description: c.description || '',
    updatedAt: c.updatedAt,
    updatedBy: c.updatedBy || 'admin',
  }));
}

/**
 * Adapts AuditLogResponse from GET /api/audit (Page<AuditLogResponse>)
 */
export function adaptAuditLog(raw = {}) {
  const username = raw.username || raw.user || 'system';
  const bedCode = raw.bedCode || '';
  const entityType = raw.entityType || '';
  const entityId = raw.entityId != null ? String(raw.entityId) : '';
  const action = raw.action || 'SYSTEM_EVENT';
  const role = raw.metadata?.role || (username.includes('nurse') ? 'NURSE' : username.includes('biomed') ? 'BIOMED_ENGINEER' : (username === 'admin' ? 'CLINICAL_ADMIN' : 'STAFF'));
  const eventDesc = entityType ? `${entityType}${entityId ? ' #' + entityId : ''}` : action;

  return {
    id: raw.id != null ? String(raw.id) : `aud-${Date.now()}`,
    timestamp: raw.timestamp ? new Date(raw.timestamp).toISOString() : new Date().toISOString(),
    username: username,
    user: username,
    role: role,
    action: action,
    entityType: entityType,
    entityId: entityId,
    bedCode: bedCode,
    bed: bedCode ? bedCode.replace('_', ' ') : (entityType.includes('SYSTEM') || entityType.includes('CONFIG') ? 'System' : 'Ward'),
    event: eventDesc,
    previousValue: raw.previousValue != null ? String(raw.previousValue) : '',
    newValue: raw.newValue != null ? String(raw.newValue) : '',
    result: raw.result || 'SUCCESS',
    metadata: raw.metadata || {}
  };
}

/**
 * Adapts CalibrationResponse from GET /api/calibration/{bedCode}
 */
export function adaptCalibration(raw = {}) {
  return {
    id: raw.id,
    bedCode: raw.bedCode || 'BED_1',
    deviceCode: raw.deviceCode || 'ESP32_01',
    channelId: raw.channelId || (raw.bedCode === 'BED_2' ? 'HX711_2' : 'HX711_1'),
    calibrationFactor: Number(raw.calibrationFactor ?? 1.0),
    zeroOffset: Number(raw.zeroOffset ?? 0.0),
    knownReferenceWeight: raw.knownReferenceWeight != null ? Number(raw.knownReferenceWeight) : null,
    calibratedAt: raw.calibratedAt ? new Date(raw.calibratedAt).toLocaleString() : 'Pending laboratory calibration',
    calibratedBy: raw.calibratedBy || 'Uncalibrated',
    notes: raw.notes || 'Experimental baseline — not yet certified',
    active: raw.active !== false,
  };
}

/**
 * Adapts AnalyticsResponse from GET /api/analytics
 */
export function adaptAnalytics(raw = {}) {
  const eventTypesDistribution = [
    { type: 'NORMAL_FLOW', label: 'Normal Flow', count: Number(raw.normalFlowEvents ?? 0) },
    { type: 'FLOW_INTERRUPTION', label: 'Flow Interruption', count: Number(raw.flowInterruptionEvents ?? 0) },
    { type: 'LOW_VOLUME', label: 'Low Volume', count: Number(raw.lowVolumeEvents ?? 0) },
    { type: 'BAG_REPLACEMENT', label: 'Bag Replacement', count: Number(raw.bagReplacementEvents ?? 0) },
    { type: 'SENSOR_DRIFT', label: 'Sensor Drift', count: Number(raw.sensorDriftEvents ?? 0) },
    { type: 'SENSOR_FAILURE', label: 'Sensor Failure', count: Number(raw.sensorFailureEvents ?? 0) },
  ].filter(e => e.count > 0 || e.type === 'NORMAL_FLOW' || e.type === 'LOW_VOLUME');

  let eventsByBedList = [];
  if (raw.eventsByBed && typeof raw.eventsByBed === 'object') {
    if (Array.isArray(raw.eventsByBed)) {
      eventsByBedList = raw.eventsByBed;
    } else {
      eventsByBedList = Object.entries(raw.eventsByBed).map(([bedCode, count]) => ({
        bedId: bedCode,
        bedCode: bedCode,
        bedName: bedCode.replace('_', ' '),
        count: Number(count),
      }));
    }
  }

  const alertsBySeverity = raw.alertsBySeverity || {
    CRITICAL: Number(raw.openAlerts ?? 0),
    WARNING: 0,
    INFO: 0,
  };

  const flowGPerMin = Number(raw.averageFlowRateGPerMin ?? 0.81);
  const flowMlHr = Number((flowGPerMin * 60).toFixed(1));

  let evidenceScore = Number(raw.averageEvidenceScore ?? 92);
  if (evidenceScore <= 1.0 && evidenceScore > 0) evidenceScore = Math.round(evidenceScore * 100);

  return {
    timestamp: raw.timestamp ? new Date(raw.timestamp).toISOString() : new Date().toISOString(),
    totalEvents: Number(raw.totalEvents ?? 0),
    totalAlerts: Number(raw.totalAlerts ?? 0),
    openAlerts: Number(raw.openAlerts ?? 0),
    acknowledgedAlerts: Number(raw.acknowledgedAlerts ?? 0),
    resolvedAlerts: Number(raw.resolvedAlerts ?? 0),
    summary: {
      totalBedsMonitored: eventsByBedList.length || 2,
      activeAlerts: Number(raw.openAlerts ?? 0),
      resolvedAlerts24h: Number(raw.resolvedAlerts ?? 0),
      averageFlowRateMlHr: flowMlHr,
      averageFlowRateGPerMin: flowGPerMin,
      averageEvidenceScore: evidenceScore,
    },
    eventTypesDistribution,
    eventsByBed: eventsByBedList,
    alertsBySeverity,
  };
}
