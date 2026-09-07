import React, { useState } from 'react';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * AlertsPanel Component
 *
 * Full clinical alert lifecycle:
 * DETECTED -> ACKNOWLEDGED -> RESOLVED
 * Displays Bed, Event Type, Severity, Evidence Score, Created Time, Status
 */

const TYPE_LABELS = {
  LOW_VOLUME: 'Low Volume (<50g)',
  LOW_FLUID: 'Low Fluid',
  FLOW_INTERRUPTION: 'Flow Interruption (>180s)',
  OCCLUSION_SUSPECTED: 'Occlusion Suspected',
  BAG_REPLACEMENT: 'Bag Replacement Detected',
  SENSOR_DRIFT: 'Sensor Drift Flagged by AI',
  PREDICTED_EMPTY: 'Predicted Empty Soon',
};

const TYPE_ICONS = {
  LOW_VOLUME: '⚠',
  LOW_FLUID: '⚠',
  FLOW_INTERRUPTION: '⛔',
  OCCLUSION_SUSPECTED: '⛔',
  BAG_REPLACEMENT: '🔄',
  SENSOR_DRIFT: '📈',
  PREDICTED_EMPTY: '⏱',
};

function timeAgo(iso) {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export default function AlertsPanel({
  alerts = [],
  filter = 'ALL',
  onFilterChange,
  onAcknowledge,
  onResolve,
  loading = false,
}) {
  const [internalFilter, setInternalFilter] = useState(filter);
  const activeFilter = onFilterChange ? filter : internalFilter;
  const setFilter = onFilterChange || setInternalFilter;

  const filtered = alerts.filter((a) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DETECTED') return a.status === 'DETECTED' || a.status === 'OPEN';
    return a.status === activeFilter;
  });

  return (
    <div className="alerts-panel-container">
      <div className="panel-header-row">
        <div>
          <h2>Active Alerts & Triage</h2>
          <p className="panel-subtitle">
            Prioritized clinical alerts with evidence confidence scores.
          </p>
        </div>

        {/* Lifecycle Tabs */}
        <div className="filter-button-group">
          {['ALL', 'DETECTED', 'ACKNOWLEDGED', 'RESOLVED'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`btn-filter ${activeFilter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab === 'DETECTED' ? 'Detected (Open)' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="simulation-notice-bar">
        <span>Software Demonstration: Alerts are triggered by simulated test scenarios.</span>
      </div>

      {loading && <div className="loading-state">Loading alerts queue…</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <h3>No {activeFilter !== 'ALL' ? activeFilter.toLowerCase() : ''} alerts</h3>
          <p>All monitored IV lines are currently in nominal state.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="alert-list-grid">
          {filtered.map((alert) => {
            const isDetected = alert.status === 'DETECTED' || alert.status === 'OPEN';
            const isAck = alert.status === 'ACKNOWLEDGED';
            const isResolved = alert.status === 'RESOLVED';
            const severityClass = (alert.severity || 'WARNING').toLowerCase();

            return (
              <div key={alert.id} className={`alert-card-item sev-${severityClass}`}>
                <div className="alert-card-header">
                  <div className="alert-type-group">
                    <span className="alert-icon-symbol" aria-hidden="true">
                      {TYPE_ICONS[alert.type] || '•'}
                    </span>
                    <div>
                      <span className="alert-type-title">
                        {TYPE_LABELS[alert.type] || alert.type}
                      </span>
                      <span className="alert-id-tag font-mono">ID: {alert.id}</span>
                    </div>
                  </div>

                  <div className="alert-header-meta">
                    <span className="bed-pill">
                      {alert.bedCode ? alert.bedCode.replace('_', ' ') : `Bed ${alert.bedId}`}
                    </span>
                    <span className={`pill-severity pill-${severityClass}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>

                <div className="alert-card-body">
                  <p className="alert-message-text">{alert.message}</p>

                  <div className="alert-evidence-bar">
                    <span className="evidence-title">Algorithm Evidence Score:</span>
                    <span className="evidence-value">
                      {alert.evidenceScore != null ? (
                        <strong>{Math.round(alert.evidenceScore)}% confidence</strong>
                      ) : (
                        'Under computation'
                      )}
                    </span>
                  </div>

                  <div className="alert-timestamps-row">
                    <span>Created: <strong>{timeAgo(alert.createdAt)}</strong></span>
                    {(alert.acknowledgedByName || alert.acknowledgedBy) && (
                      <span>Ack by: <strong>{alert.acknowledgedByName || alert.acknowledgedBy}</strong></span>
                    )}
                    {alert.resolvedAt && (
                      <span>Resolved: <strong>{timeAgo(alert.resolvedAt)}</strong></span>
                    )}
                  </div>
                </div>

                {/* Workflow Transitions */}
                <div className="alert-card-actions">
                  <span className={`status-tag-pill status-${alert.status.toLowerCase()}`}>
                    Status: {alert.status}
                  </span>

                  <div className="action-buttons-group">
                    {isDetected && onAcknowledge && (
                      <button
                        type="button"
                        className="btn-alert-action btn-ack"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </button>
                    )}
                    {(isDetected || isAck) && onResolve && (
                      <button
                        type="button"
                        className="btn-alert-action btn-resolve"
                        onClick={() => onResolve(alert.id)}
                      >
                        Resolve Alert
                      </button>
                    )}
                    {isResolved && (
                      <span className="resolved-checkmark">✓ Resolved</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
