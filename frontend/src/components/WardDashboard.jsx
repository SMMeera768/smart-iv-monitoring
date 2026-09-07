import React, { useState } from 'react';
import BedCard from './BedCard.jsx';
import BedCharts from './BedCharts.jsx';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Two-Bed Clinical Ward Dashboard
 * 
 * Consumes DashboardSummaryResponse:
 * - systemStatus, totalBeds, normalBeds, activeAlerts, physicalDevicesOnline, sensorChannelsOnline
 * - beds: List<BedStatusResponse>
 */
export default function WardDashboard({
  beds = [],
  summary = {},
  loading = false,
  error = null,
  onAcknowledge,
  onResolve,
  isDemo = true,
}) {
  const [selectedBedForCharts, setSelectedBedForCharts] = useState(null);

  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <div className="spinner" />
        <p>Loading two-bed telemetry from backend stream…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error-state">
        <div className="alert-badge badge-critical">ERROR</div>
        <h3>Failed to load bed telemetry</h3>
        <p>{error.message || String(error)}</p>
        <button
          className="btn-secondary"
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const bedList = Array.isArray(beds) && beds.length > 0 ? beds : (Array.isArray(summary?.beds) ? summary.beds : []);

  if (!bedList || bedList.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Bed Telemetry Active</h3>
        <p>Two IV beds (Bed 1 & Bed 2) will appear here once connected or initialized.</p>
      </div>
    );
  }

  const systemStatus = summary?.systemStatus || 'ONLINE';
  const physicalDevicesOnline = summary?.physicalDevicesOnline ?? 1;
  const sensorChannelsOnline = summary?.sensorChannelsOnline ?? 2;
  const activeAlertCount = summary?.activeAlerts ?? bedList.filter(b => b.status === 'CRITICAL').length;

  return (
    <div className="ward-dashboard-container">
      {/* Centralized Demo Data Banner */}
      {isDemo && (
        <div className="demo-data-banner">
          <div className="banner-badge">DEMO DATA</div>
          <div className="banner-text">
            <strong>SMART MULTI-BED IV PLATFORM (SOFTWARE POC)</strong> — Operating on simulated telemetry.
            Physical ESP32 &amp; load cells are independently undergoing laboratory testing.
          </div>
        </div>
      )}

      {/* Two-Bed Header Bar — Genuine Backend Summary Metrics */}
      <div className="dashboard-top-metrics">
        <div className="metric-pill">
          <span>Physical Hardware:</span>
          <strong>{physicalDevicesOnline} ESP32 Online (Dual-Channel)</strong>
        </div>
        <div className="metric-pill">
          <span>Active Sensor Channels:</span>
          <strong>{sensorChannelsOnline} / 2 Channels Monitored</strong>
        </div>
        <div className="metric-pill">
          <span>System Status:</span>
          <strong className={systemStatus === 'ONLINE' ? 'status-online' : 'status-alert'}>
            {systemStatus} {isDemo ? '(MOCK)' : '(LIVE)'}
          </strong>
        </div>
        <div className="metric-pill">
          <span>Active Alerts:</span>
          <strong className={activeAlertCount > 0 ? 'text-critical' : ''}>
            {activeAlertCount} {activeAlertCount === 1 ? 'Alert' : 'Alerts'}
          </strong>
        </div>
      </div>

      {/* Two-Bed Grid: Bed 1 and Bed 2 */}
      <div className="bed-grid two-bed-layout">
        {bedList.map((bed) => (
          <BedCard
            key={bed.bedCode || bed.bedId || bed.id}
            bed={bed}
            onAcknowledge={onAcknowledge}
            onResolve={onResolve}
            onViewCharts={(bedCode) => setSelectedBedForCharts(bedCode)}
          />
        ))}
      </div>

      {/* Modal for Time Series Charts */}
      {selectedBedForCharts && (
        <div className="modal-backdrop" onClick={() => setSelectedBedForCharts(null)}>
          <div className="modal-content chart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedBedForCharts === 'BED_2' || selectedBedForCharts === '2' ? 'Bed 2' : 'Bed 1'} — Gravimetric Telemetry</h3>
              <button
                className="btn-close"
                onClick={() => setSelectedBedForCharts(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <BedCharts bedCode={selectedBedForCharts} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
