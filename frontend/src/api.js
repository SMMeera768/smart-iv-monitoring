/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Centralized API Service Layer & Endpoint Contracts
 *
 * Fully aligned with Spring Boot Controllers and DTOs:
 * - DashboardSummaryResponse, BedStatusResponse, ReadingPoint
 * - Page<AlertResponse>, Page<EventResponse>, Page<AuditLogResponse>
 * - List<DeviceResponse>, List<ConfigurationResponse>
 * - CalibrationResponse, ResearchMetricsResponse, AnalyticsResponse
 */

import {
  adaptDashboardSummary,
  adaptBed,
  adaptReading,
  adaptEvent,
  adaptAlert,
  adaptDevice,
  adaptConfigurationList,
  adaptAuditLog,
  adaptCalibration,
  adaptAnalytics,
  extractPageContent,
} from './adapters/dataAdapter.js';

import {
  mockDashboardSummary,
  mockBeds,
  generateMockReadings,
  mockEvents,
  mockAlerts,
  mockDevices,
  mockCalibration,
  mockConfigurationList,
  mockAnalytics,
  mockResearchMetrics,
  mockAuditLogs,
  mockUsers,
} from './mock/ivMockData.js';

// Base API configuration (Points at Spring Boot port 8080 by default)
export const API_BASE = window.__IVMONITOR_API_BASE__ || 'http://localhost:8080';
export const TOKEN_KEY = 'ivmonitor_token';
export const USER_KEY = 'ivmonitor_user';

// State-level toggle: default to true for standalone PoC demo
let _isMockMode = true;

export function setMockMode(val) {
  _isMockMode = Boolean(val);
}

export function isMockMode() {
  return _isMockMode;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ==================================================
// CENTRALIZED API ENDPOINT CONSTANTS
// ==================================================
export const ENDPOINTS = {
  AUTH_LOGIN: '/api/auth/login',
  DEVICE_DATA: '/api/device/data',
  DASHBOARD_SUMMARY: '/api/dashboard/summary',
  DASHBOARD_BED: (bedCode) => `/api/dashboard/bed/${bedCode}`,
  DASHBOARD_READINGS: (bedCode) => `/api/dashboard/bed/${bedCode}/readings?limit=200`,
  EVENTS: '/api/events?page=0&size=50',
  EVENTS_BED: (bedId) => `/api/events/${bedId}?page=0&size=50`,
  EVENT_DETAILS: (eventId) => `/api/events/details/${eventId}`,
  ALERTS: '/api/alerts?page=0&size=50',
  ALERT_ACKNOWLEDGE: (id) => `/api/alerts/${id}/acknowledge`,
  ALERT_RESOLVE: (id) => `/api/alerts/${id}/resolve`,
  ANALYTICS: '/api/analytics',
  DEVICES: '/api/devices',
  DEVICE_DETAILS: (id) => `/api/devices/${id}`,
  AUDIT: '/api/audit?page=0&size=50',
  CONFIGURATION: '/api/configuration',
  CONFIGURATION_UPDATE: (username = 'admin') => `/api/configuration?username=${encodeURIComponent(username)}`,
  CALIBRATION: (bedCode) => `/api/calibration/${bedCode}`,
  CALIBRATION_SAVE: (bedCode, username = 'biomed_engineer') => `/api/calibration/${bedCode}?username=${encodeURIComponent(username)}`,
  CALIBRATION_TARE: (bedCode, username = 'biomed_engineer') => `/api/calibration/${bedCode}/tare?username=${encodeURIComponent(username)}`,
  RESEARCH_METRICS: '/api/research/metrics',
};

// In-memory mock states for interactive demo actions
let activeMockAlerts = [...mockAlerts];
let activeMockAudit = [...mockAuditLogs];
let activeMockConfig = [...mockConfigurationList];
let activeMockCalibration = { ...mockCalibration };

// Generic REST request handler
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      /* non-json body fallback */
    }
    throw new Error(message);
  }

  if (res.status === 204 || res.status === 202) return null;
  return res.json();
}

function mockDelay(ms = 60) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================================================
// STANDARDIZED API SERVICE OBJECT
// ==================================================
export const api = {
  // 1. Authentication
  async login(credentials = {}) {
    if (_isMockMode) {
      await mockDelay();
      const role = credentials.role || 'NURSE';
      const user = mockUsers[role.toLowerCase()] || mockUsers.nurse;
      return { token: 'mock-jwt-token-demo', ...user };
    }
    return request(ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username || credentials.email,
        password: credentials.password
      }),
    });
  },

  // 2. Dashboard Summary
  // Backend returns: DashboardSummaryResponse { systemStatus, totalBeds, normalBeds, activeAlerts, physicalDevicesOnline, sensorChannelsOnline, beds: [...], timestamp }
  async getDashboardSummary() {
    if (_isMockMode) {
      await mockDelay();
      return adaptDashboardSummary(mockDashboardSummary);
    }
    const raw = await request(ENDPOINTS.DASHBOARD_SUMMARY);
    return adaptDashboardSummary(raw);
  },

  // 3. Bed Status
  async getBedStatus(bedCode = 'BED_1') {
    const code = bedCode.startsWith('BED_') ? bedCode : (bedCode === '2' ? 'BED_2' : 'BED_1');
    if (_isMockMode) {
      await mockDelay();
      const bed = mockBeds.find((b) => b.bedCode === code) || mockBeds[0];
      return adaptBed(bed);
    }
    const raw = await request(ENDPOINTS.DASHBOARD_BED(code));
    return adaptBed(raw);
  },

  // 4. Bed Readings (Weight & Flow vs Time)
  // Backend returns List<ReadingPoint> { timestamp, rawWeight, filteredWeight, flowRate, baseline }
  async getBedReadings(bedCode = 'BED_1') {
    const code = bedCode.startsWith('BED_') ? bedCode : (bedCode === '2' ? 'BED_2' : 'BED_1');
    if (_isMockMode) {
      await mockDelay();
      return generateMockReadings(code, 30).map(adaptReading);
    }
    const raw = await request(ENDPOINTS.DASHBOARD_READINGS(code));
    const list = Array.isArray(raw) ? raw : (raw.readings || []);
    return list.map(adaptReading);
  },

  // 5. Current Events
  // Backend returns Page<EventResponse>
  async getCurrentEvents() {
    if (_isMockMode) {
      await mockDelay();
      return mockEvents.map(adaptEvent);
    }
    const raw = await request(ENDPOINTS.EVENTS);
    return extractPageContent(raw).map(adaptEvent);
  },

  // 6. Bed Events
  async getBedEvents(bedId = 1) {
    if (_isMockMode) {
      await mockDelay();
      const targetBedCode = String(bedId).includes('2') ? 'BED_2' : 'BED_1';
      return mockEvents.filter((e) => e.bedCode === targetBedCode).map(adaptEvent);
    }
    const raw = await request(ENDPOINTS.EVENTS_BED(bedId));
    return extractPageContent(raw).map(adaptEvent);
  },

  // 7. Event Details
  async getEventDetails(eventId) {
    if (_isMockMode) {
      await mockDelay();
      const evt = mockEvents.find((e) => String(e.id) === String(eventId)) || mockEvents[0];
      return adaptEvent(evt);
    }
    const raw = await request(ENDPOINTS.EVENT_DETAILS(eventId));
    return adaptEvent(raw);
  },

  // 8. Alerts List
  // Backend returns Page<AlertResponse>
  async getAlerts() {
    if (_isMockMode) {
      await mockDelay();
      return activeMockAlerts.map(adaptAlert);
    }
    const raw = await request(ENDPOINTS.ALERTS);
    return extractPageContent(raw).map(adaptAlert);
  },

  // 9. Acknowledge Alert
  async acknowledgeAlert(alertId, userName = 'nurse_user') {
    if (_isMockMode) {
      await mockDelay();
      activeMockAlerts = activeMockAlerts.map((a) =>
        String(a.id) === String(alertId)
          ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString(), acknowledgedBy: userName }
          : a
      );
      activeMockAudit.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        username: userName,
        action: 'ALERT_ACKNOWLEDGED',
        entityType: 'ALERT',
        entityId: String(alertId),
        bedCode: 'BED_2',
        result: 'SUCCESS',
      });
      return { success: true, alertId, status: 'ACKNOWLEDGED' };
    }
    return request(ENDPOINTS.ALERT_ACKNOWLEDGE(alertId), {
      method: 'POST',
      body: JSON.stringify({ userId: userName }),
    });
  },

  // 10. Resolve Alert
  async resolveAlert(alertId, userName = 'nurse_user') {
    if (_isMockMode) {
      await mockDelay();
      activeMockAlerts = activeMockAlerts.map((a) =>
        String(a.id) === String(alertId)
          ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString(), resolvedBy: userName }
          : a
      );
      activeMockAudit.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        username: userName,
        action: 'ALERT_RESOLVED',
        entityType: 'ALERT',
        entityId: String(alertId),
        bedCode: 'BED_2',
        result: 'SUCCESS',
      });
      return { success: true, alertId, status: 'RESOLVED' };
    }
    return request(ENDPOINTS.ALERT_RESOLVE(alertId), {
      method: 'POST',
      body: JSON.stringify({ userId: userName }),
    });
  },

  // 11. Analytics
  // Backend returns AnalyticsResponse
  async getAnalytics() {
    if (_isMockMode) {
      await mockDelay();
      return adaptAnalytics(mockAnalytics);
    }
    const raw = await request(ENDPOINTS.ANALYTICS);
    return adaptAnalytics(raw);
  },

  // 12. Device Status
  // Backend returns List<DeviceResponse>
  async getDeviceStatus() {
    if (_isMockMode) {
      await mockDelay();
      return mockDevices.map(adaptDevice);
    }
    const raw = await request(ENDPOINTS.DEVICES);
    return extractPageContent(raw).map(adaptDevice);
  },

  // 13. Audit Logs
  // Backend returns Page<AuditLogResponse>
  async getAuditLogs() {
    if (_isMockMode) {
      await mockDelay();
      return activeMockAudit.map(adaptAuditLog);
    }
    const raw = await request(ENDPOINTS.AUDIT);
    return extractPageContent(raw).map(adaptAuditLog);
  },

  // 14. Configuration List
  // Backend returns List<ConfigurationResponse>
  async getConfiguration() {
    if (_isMockMode) {
      await mockDelay();
      return adaptConfigurationList(activeMockConfig);
    }
    const raw = await request(ENDPOINTS.CONFIGURATION);
    return adaptConfigurationList(raw);
  },

  // 15. Update Configuration
  // Backend takes ConfigurationRequest { configKey, configValue, description }
  async updateConfiguration(configKey, configValue, description = '', username = 'admin') {
    if (_isMockMode) {
      await mockDelay();
      const existing = activeMockConfig.find(c => c.configKey === configKey);
      if (existing) {
        existing.configValue = String(configValue);
        if (description) existing.description = description;
        existing.updatedAt = new Date().toISOString();
        existing.updatedBy = username;
      } else {
        activeMockConfig.push({
          id: Date.now(),
          configKey,
          configValue: String(configValue),
          description,
          updatedAt: new Date().toISOString(),
          updatedBy: username,
        });
      }
      return { success: true, configuration: adaptConfigurationList(activeMockConfig) };
    }
    return request(ENDPOINTS.CONFIGURATION_UPDATE(username), {
      method: 'PUT',
      body: JSON.stringify({ configKey, configValue: String(configValue), description }),
    });
  },

  // 16. Calibration Status
  // Backend returns CalibrationResponse
  async getCalibration(bedCode = 'BED_1') {
    const code = bedCode.startsWith('BED_') ? bedCode : (bedCode === '2' ? 'BED_2' : 'BED_1');
    if (_isMockMode) {
      await mockDelay();
      return adaptCalibration(activeMockCalibration[code] || activeMockCalibration['BED_1']);
    }
    const raw = await request(ENDPOINTS.CALIBRATION(code));
    return adaptCalibration(raw);
  },

  // 17. Save Calibration
  // Backend takes CalibrationRequest { calibrationFactor, zeroOffset, knownReferenceWeight, notes }
  async saveCalibration(bedCode = 'BED_1', calData = {}, username = 'biomed_engineer') {
    const code = bedCode.startsWith('BED_') ? bedCode : (bedCode === '2' ? 'BED_2' : 'BED_1');
    if (_isMockMode) {
      await mockDelay();
      activeMockCalibration[code] = {
        ...activeMockCalibration[code],
        ...calData,
        calibratedAt: new Date().toISOString(),
        calibratedBy: username,
      };
      return adaptCalibration(activeMockCalibration[code]);
    }
    const raw = await request(ENDPOINTS.CALIBRATION_SAVE(code, username), {
      method: 'POST',
      body: JSON.stringify(calData),
    });
    return adaptCalibration(raw);
  },

  // 18. Tare Bed
  async tareBed(bedCode = 'BED_1', username = 'biomed_engineer') {
    const code = bedCode.startsWith('BED_') ? bedCode : (bedCode === '2' ? 'BED_2' : 'BED_1');
    if (_isMockMode) {
      await mockDelay();
      if (activeMockCalibration[code]) {
        activeMockCalibration[code].zeroOffset = 0.0;
        activeMockCalibration[code].calibratedAt = new Date().toISOString();
        activeMockCalibration[code].calibratedBy = username;
      }
      return adaptCalibration(activeMockCalibration[code]);
    }
    const raw = await request(ENDPOINTS.CALIBRATION_TARE(code, username), {
      method: 'POST',
    });
    return adaptCalibration(raw);
  },

  // 19. Research Metrics
  // Backend returns ResearchMetricsResponse
  async getResearchMetrics() {
    if (_isMockMode) {
      await mockDelay();
      return mockResearchMetrics;
    }
    return request(ENDPOINTS.RESEARCH_METRICS);
  },
};

// ==================================================
// REAL-TIME SUBSCRIPTION ABSTRACTION
// ==================================================
export function subscribeToBedUpdates(bedCode, callback, intervalMs = 3000) {
  let isCancelled = false;

  const poll = async () => {
    if (isCancelled) return;
    try {
      const data = bedCode ? await api.getBedStatus(bedCode) : await api.getDashboardSummary();
      if (!isCancelled) callback(null, data);
    } catch (err) {
      if (!isCancelled) callback(err, null);
    }
  };

  poll();
  const timer = setInterval(poll, intervalMs);

  return function unsubscribe() {
    isCancelled = true;
    clearInterval(timer);
  };
}
