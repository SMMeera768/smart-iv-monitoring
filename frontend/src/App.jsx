import React, { useEffect, useState, useCallback } from 'react';
import Login from './components/Login.jsx';
import Sidebar, { ROLE_PERMISSIONS } from './components/Sidebar.jsx';
import WardDashboard from './components/WardDashboard.jsx';
import AlertsPanel from './components/AlertsPanel.jsx';
import EventsPanel from './components/EventsPanel.jsx';
import AnalyticsPanel from './components/AnalyticsPanel.jsx';
import DeviceStatusPanel from './components/DeviceStatusPanel.jsx';
import CalibrationPanel from './components/CalibrationPanel.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import ResearchPerformancePanel from './components/ResearchPerformancePanel.jsx';
import AuditLogPanel from './components/AuditLogPanel.jsx';
import Toast from './components/Toast.jsx';

import {
  api,
  getToken,
  getStoredUser,
  clearSession,
  setMockMode,
  isMockMode,
  TOKEN_KEY,
  USER_KEY,
} from './api.js';

import { mockUsers } from './mock/ivMockData.js';

const POLL_INTERVAL_MS = 5000;

export default function App() {
  const [session, setSession] = useState(() => {
    const token = getToken();
    const user = getStoredUser();
    // Default to demo nurse session if nothing stored
    return token && user
      ? { user, isDemo: isMockMode() }
      : { user: mockUsers.nurse, isDemo: true };
  });

  const [activeView, setActiveView] = useState('dashboard');
  const [beds, setBeds] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertFilter, setAlertFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', isError: false });

  const notify = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast({ message: '', isError: false }), 3500);
  }, []);

  function handleLogin(loginResponse) {
    const user = {
      fullName: loginResponse.fullName || loginResponse.name,
      role: loginResponse.role || 'NURSE',
      email: loginResponse.email,
    };
    localStorage.setItem(TOKEN_KEY, loginResponse.token || 'real-jwt-token');
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setMockMode(false);
    setSession({ user, isDemo: false });
    notify(`Welcome, ${user.fullName} (${user.role})`);
  }

  function handleDemoLogin(selectedUser) {
    const user = selectedUser || mockUsers.nurse;
    setMockMode(true);
    setSession({ user, isDemo: true });
    // Ensure active view is within allowed permissions
    const allowed = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.NURSE;
    if (!allowed.includes(activeView)) {
      setActiveView(allowed[0]);
    }
    notify(`Demo Mode: Active as ${user.fullName} [${user.role}]`);
  }

  function handleSwitchRole(newRole) {
    const user = mockUsers[newRole.toLowerCase()] || {
      fullName: `${newRole.replace('_', ' ')} (Demo)`,
      role: newRole,
    };
    setSession((prev) => ({ ...prev, user }));
    const allowed = ROLE_PERMISSIONS[newRole] || ROLE_PERMISSIONS.NURSE;
    if (!allowed.includes(activeView)) {
      setActiveView(allowed[0]);
    }
    notify(`Role switched to ${newRole}`);
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setActiveView('dashboard');
  }

  // Polling data refresh
  const refreshData = useCallback(async () => {
    if (!session) return;
    try {
      const [bedsData, alertsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getAlerts(),
      ]);
      setBeds(bedsData || []);
      setAlerts(alertsData || []);
    } catch (err) {
      if (!session.isDemo) {
        notify(err.message || 'Error fetching telemetry updates', true);
      }
    }
  }, [session, notify]);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    refreshData().finally(() => setLoading(false));

    const interval = setInterval(refreshData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [session, refreshData]);

  // Alert Actions
  async function handleAcknowledge(alertId) {
    try {
      await api.acknowledgeAlert(alertId, session?.user?.fullName);
      notify(`Alert ${alertId} acknowledged.`);
      refreshData();
    } catch (err) {
      notify(err.message, true);
    }
  }

  async function handleResolve(alertId) {
    try {
      await api.resolveAlert(alertId, session?.user?.fullName);
      notify(`Alert ${alertId} resolved.`);
      refreshData();
    } catch (err) {
      notify(err.message, true);
    }
  }

  if (!session) {
    return <Login onLogin={handleLogin} onDemoLogin={handleDemoLogin} />;
  }

  const openAlertCount = alerts.filter(
    (a) => a.status === 'DETECTED' || a.status === 'OPEN'
  ).length;

  const currentRole = session.user?.role || 'NURSE';
  const allowedViews = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.NURSE;

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        user={session.user}
        openAlertCount={openAlertCount}
        onLogout={handleLogout}
        isDemo={session.isDemo}
        onSwitchRole={handleSwitchRole}
      />

      <div className="main">
        {/* Top Clinical Header Bar */}
        <header className="topbar">
          <div>
            <h1>
              {activeView === 'dashboard' && 'Smart Multi-Bed IV Dashboard'}
              {activeView === 'alerts' && 'Active Alerts & Alarm Triage'}
              {activeView === 'events' && 'Workflow & Clinical Events'}
              {activeView === 'analytics' && 'Operational Telemetry Analytics'}
              {activeView === 'devices' && 'ESP32 & HX711 Sensor Health'}
              {activeView === 'calibration' && 'Sensor Zeroing & Tare Calibration'}
              {activeView === 'settings' && 'Platform Thresholds & Configuration'}
              {activeView === 'research' && 'Research Validation Benchmarks'}
              {activeView === 'audit' && 'System Audit & Compliance Log'}
            </h1>
            <div className="topbar-sub">
              Proof-of-Concept Software Platform · Dual Load-Cell Monitoring (Bed 1 & Bed 2)
            </div>
          </div>

          <div className="topbar-right-meta">
            {session.isDemo ? (
              <span className="demo-badge-pill">
                🔬 DEMO DATA (SYNTHETIC POC)
              </span>
            ) : (
              <span className="live-badge-pill">
                ● REST API CONNECTED
              </span>
            )}
            <span className="active-user-badge">
              {session.user.fullName} ({currentRole})
            </span>
          </div>
        </header>

        {/* Dynamic View Router */}
        <main className="content">
          {activeView === 'dashboard' && (
            <WardDashboard
              beds={beds}
              loading={loading}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
              isDemo={session.isDemo}
            />
          )}

          {activeView === 'alerts' && (
            <AlertsPanel
              alerts={alerts}
              filter={alertFilter}
              onFilterChange={setAlertFilter}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
              loading={loading}
            />
          )}

          {activeView === 'events' && (
            <EventsPanel />
          )}

          {activeView === 'analytics' && (
            <AnalyticsPanel />
          )}

          {activeView === 'devices' && (
            <DeviceStatusPanel />
          )}

          {activeView === 'calibration' && (
            <CalibrationPanel />
          )}

          {activeView === 'settings' && (
            <SettingsPanel />
          )}

          {activeView === 'research' && (
            <ResearchPerformancePanel />
          )}

          {activeView === 'audit' && (
            <AuditLogPanel />
          )}
        </main>
      </div>

      <Toast message={toast.message} isError={toast.isError} />
    </div>
  );
}
