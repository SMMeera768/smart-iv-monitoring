/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Centralized API Service Layer & Endpoint Contracts
 *
 * Implements all 19 standardized service methods and 20 endpoint placeholders.
 * Supports toggling between MOCK API and REAL REST API seamlessly.
 */

import {
  adaptBed,
  adaptReading,
  adaptEvent,
  adaptAlert,
  adaptDeviceStatus,
} from './adapters/dataAdapter.js';

import {
  mockBeds,
  generateMockReadings,
  mockEvents,
  mockAlerts,
  mockDeviceStatus,
  mockCalibration,
  mockConfiguration,
  mockAnalytics,
  mockResearchMetrics,
  mockAuditLogs,
  mockUsers,
} from './mock/ivMockData.js';

// Base API configuration
export const API_BASE = window.__IVMONITOR_API_BASE__ || 'http://localhost:8080';
export const TOKEN_KEY = 'ivmonitor_token';
export const USER_KEY = 'ivmonitor_user';

// State-level toggle: Set to true for software-only demo mode
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
  DASHBOARD_BED: (bedId) => `/api/dashboard/bed/${bedId}`,
  DASHBOARD_READINGS: (bedId) => `/api/dashboard/bed/${bedId}/readings`,
  EVENTS: '/api/events',
  EVENTS_BED: (bedId) => `/api/events/${bedId}`,
  EVENT_DETAILS: (eventId) => `/api/events/details/${eventId}`,
  ALERTS: '/api/alerts',
  ALERT_ACKNOWLEDGE: (id) => `/api/alerts/${id}/acknowledge`,
  ALERT_RESOLVE: (id) => `/api/alerts/${id}/resolve`,
  ANALYTICS: '/api/analytics',
  DEVICES: '/api/devices',
  DEVICE_DETAILS: (id) => `/api/devices/${id}`,
  AUDIT: '/api/audit',
  CONFIGURATION: '/api/configuration',
  CALIBRATION: (bedId) => `/api/calibration/${bedId}`,
  CALIBRATION_TARE: (bedId) => `/api/calibration/${bedId}/tare`,
  RESEARCH_METRICS: '/api/research/metrics',
};

// In-memory mock alert and audit states for interactive demo actions
let activeMockAlerts = [...mockAlerts];
let activeMockAudit = [...mockAuditLogs];
let activeMockConfig = { ...mockConfiguration };
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
      message = body.error || body.message || message;
    } catch {
      /* non-json body fallback */
    }
    throw new Error(message);
  }

  if (res.status === 204 || res.status === 202) return null;
  return res.json();
}

// Helper to simulate short async latency in mock mode
function mockDelay(ms = 80) {
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
      body: JSON.stringify(credentials),
    });
  },

  // 2. Dashboard Summary
  async getDashboardSummary() {
    if (_isMockMode) {
      await mockDelay();
      return mockBeds.map(adaptBed);
    }
    const raw = await request(ENDPOINTS.DASHBOARD_SUMMARY);
    return Array.isArray(raw) ? raw.map(adaptBed) : [];
  },

  // 3. Bed Status
  async getBedStatus(bedId) {
    if (_isMockMode) {
      await mockDelay();
      const bed = mockBeds.find((b) => String(b.bedId) === String(bedId)) || mockBeds[0];
      return adaptBed(bed);
    }
    const raw = await request(ENDPOINTS.DASHBOARD_BED(bedId));
    return adaptBed(raw);
  },

  // 4. Bed Readings (Weight & Flow vs Time)
  async getBedReadings(bedId) {
    if (_isMockMode) {
      await mockDelay();
      return generateMockReadings(bedId, 30).map(adaptReading);
    }
    const raw = await request(ENDPOINTS.DASHBOARD_READINGS(bedId));
    return Array.isArray(raw) ? raw.map(adaptReading) : [];
  },

  // 5. Current Events
  async getCurrentEvents() {
    if (_isMockMode) {
      await mockDelay();
      return mockEvents.map(adaptEvent);
    }
    const raw = await request(ENDPOINTS.EVENTS);
    return Array.isArray(raw) ? raw.map(adaptEvent) : [];
  },

  // 6. Bed Events
  async getBedEvents(bedId) {
    if (_isMockMode) {
      await mockDelay();
      return mockEvents.filter((e) => String(e.bedId) === String(bedId)).map(adaptEvent);
    }
    const raw = await request(ENDPOINTS.EVENTS_BED(bedId));
    return Array.isArray(raw) ? raw.map(adaptEvent) : [];
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
  async getAlerts() {
    if (_isMockMode) {
      await mockDelay();
      return activeMockAlerts.map(adaptAlert);
    }
    const raw = await request(ENDPOINTS.ALERTS);
    return Array.isArray(raw) ? raw.map(adaptAlert) : [];
  },

  // 9. Acknowledge Alert
  async acknowledgeAlert(alertId, userName = 'Priya Sharma') {
    if (_isMockMode) {
      await mockDelay();
      activeMockAlerts = activeMockAlerts.map((a) =>
        String(a.id) === String(alertId)
          ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString(), acknowledgedByName: userName }
          : a
      );
      activeMockAudit.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: userName,
        role: 'NURSE',
        action: 'Alert Acknowledged',
        bed: 'Bed 2',
        event: alertId,
        result: 'SUCCESS',
      });
      return { success: true, alertId, status: 'ACKNOWLEDGED' };
    }
    return request(ENDPOINTS.ALERT_ACKNOWLEDGE(alertId), { method: 'POST' });
  },

  // 10. Resolve Alert
  async resolveAlert(alertId, userName = 'Priya Sharma') {
    if (_isMockMode) {
      await mockDelay();
      activeMockAlerts = activeMockAlerts.map((a) =>
        String(a.id) === String(alertId)
          ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString() }
          : a
      );
      activeMockAudit.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: userName,
        role: 'NURSE',
        action: 'Alert Resolved',
        bed: 'Bed 2',
        event: alertId,
        result: 'SUCCESS',
      });
      return { success: true, alertId, status: 'RESOLVED' };
    }
    return request(ENDPOINTS.ALERT_RESOLVE(alertId), { method: 'POST' });
  },

  // 11. Analytics
  async getAnalytics() {
    if (_isMockMode) {
      await mockDelay();
      return mockAnalytics;
    }
    return request(ENDPOINTS.ANALYTICS);
  },

  // 12. Device Status
  async getDeviceStatus() {
    if (_isMockMode) {
      await mockDelay();
      return {
        ...mockDeviceStatus,
        devices: mockDeviceStatus.devices.map(adaptDeviceStatus),
      };
    }
    const raw = await request(ENDPOINTS.DEVICES);
    return {
      systemStatus: raw.systemStatus || 'ONLINE',
      serverTime: raw.serverTime || new Date().toISOString(),
      devices: Array.isArray(raw.devices) ? raw.devices.map(adaptDeviceStatus) : [],
    };
  },

  // 13. Audit Logs
  async getAuditLogs() {
    if (_isMockMode) {
      await mockDelay();
      return [...activeMockAudit];
    }
    return request(ENDPOINTS.AUDIT);
  },

  // 14. Configuration
  async getConfiguration() {
    if (_isMockMode) {
      await mockDelay();
      return { ...activeMockConfig };
    }
    return request(ENDPOINTS.CONFIGURATION);
  },

  // 15. Update Configuration
  async updateConfiguration(newConfig) {
    if (_isMockMode) {
      await mockDelay();
      activeMockConfig = { ...activeMockConfig, ...newConfig, lastUpdated: new Date().toISOString() };
      return { success: true, configuration: activeMockConfig };
    }
    return request(ENDPOINTS.CONFIGURATION, {
      method: 'PUT',
      body: JSON.stringify(newConfig),
    });
  },

  // 16. Calibration Status
  async getCalibration(bedId) {
    if (_isMockMode) {
      await mockDelay();
      return activeMockCalibration[String(bedId)] || activeMockCalibration['1'];
    }
    return request(ENDPOINTS.CALIBRATION(bedId));
  },

  // 17. Save Calibration
  async saveCalibration(bedId, calData) {
    if (_isMockMode) {
      await mockDelay();
      activeMockCalibration[String(bedId)] = {
        ...activeMockCalibration[String(bedId)],
        ...calData,
        lastCalibrationTime: new Date().toISOString(),
      };
      return { success: true, bedId, calibration: activeMockCalibration[String(bedId)] };
    }
    return request(ENDPOINTS.CALIBRATION(bedId), {
      method: 'POST',
      body: JSON.stringify(calData),
    });
  },

  // 18. Tare Bed
  async tareBed(bedId) {
    if (_isMockMode) {
      await mockDelay();
      if (activeMockCalibration[String(bedId)]) {
        activeMockCalibration[String(bedId)].zeroTareStatus = 'ZEROED';
        activeMockCalibration[String(bedId)].lastCalibrationTime = new Date().toISOString();
      }
      return { success: true, bedId, zeroTareStatus: 'ZEROED', timestamp: new Date().toISOString() };
    }
    return request(ENDPOINTS.CALIBRATION_TARE(bedId), { method: 'POST' });
  },

  // 19. Research Metrics
  async getResearchMetrics() {
    if (_isMockMode) {
      await mockDelay();
      return mockResearchMetrics;
    }
    return request(ENDPOINTS.RESEARCH_METRICS);
  },

  // Legacy mappings for backwards-compatibility
  getWardStatus: (wardId) => api.getDashboardSummary(),
  getWardAlerts: (wardId) => api.getAlerts(),
  getAlertFrequency: () => api.getAnalytics().then((a) => a.eventTypesDistribution || []),
};

// ==================================================
// REAL-TIME SUBSCRIPTION ABSTRACTION
// ==================================================
/**
 * Polling/stream abstraction that prepares the UI for future WebSockets or SSE.
 * Allows components to subscribe to updates without direct protocol dependencies.
 */
export function subscribeToBedUpdates(bedId, callback, intervalMs = 3000) {
  let isCancelled = false;

  const poll = async () => {
    if (isCancelled) return;
    try {
      const data = bedId ? await api.getBedStatus(bedId) : await api.getDashboardSummary();
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
