import React, { useState } from 'react';
import BedCard from './BedCard.jsx';
import BedCharts from './BedCharts.jsx';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Two-Bed Clinical Ward Dashboard
 */
export default function WardDashboard({
  beds = [],
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
        <p>Loading real-time two-bed telemetry from backend / mock stream…</p>
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

  if (!beds || beds.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Bed Telemetry Active</h3>
        <p>Two IV beds (Bed 1 & Bed 2) will appear here once connected or initialized.</p>
      </div>
    );
  }

  return (
    <div className="ward-dashboard-container">
      {/* Centralized Demo Data Banner */}
      <div className="demo-data-banner">
        <div className="banner-badge">DEMO DATA</div>
        <div className="banner-text">
          <strong>SMART MULTI-BED IV PLATFORM (SOFTWARE POC)</strong> — Operating on simulated telemetry.
          No physical ESP32 / HX711 hardware connected.
        </div>
      </div>

      {/* Two-Bed Header Bar */}
      <div className="dashboard-top-metrics">
        <div className="metric-pill">
          <span>Active Beds:</span>
          <strong>{beds.length} (Bed 1 & Bed 2)</strong>
        </div>
        <div className="metric-pill">
          <span>System Status:</span>
          <strong className="status-online">ONLINE (SIMULATED)</strong>
        </div>
        <div className="metric-pill">
          <span>AI Anomaly Service:</span>
          <strong>Isolation Forest (Synthetic Testing)</strong>
        </div>
      </div>

      {/* Two-Bed Grid */}
      <div className="bed-grid two-bed-layout">
        {beds.map((bed) => (
          <BedCard
            key={bed.bedId || bed.id}
            bed={bed}
            onAcknowledge={onAcknowledge}
            onResolve={onResolve}
            onViewCharts={(bedId) => setSelectedBedForCharts(bedId)}
          />
        ))}
      </div>

      {/* Modal / Slide-out for Time Series Charts */}
      {selectedBedForCharts && (
        <div className="modal-backdrop" onClick={() => setSelectedBedForCharts(null)}>
          <div className="modal-content chart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Bed {selectedBedForCharts} — Real-Time Weight & Flow Telemetry</h3>
              <button
                className="btn-close"
                onClick={() => setSelectedBedForCharts(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <BedCharts bedId={selectedBedForCharts} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
