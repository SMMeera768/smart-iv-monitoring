import React from 'react';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * BedCard Component — Answers the 5 core clinical questions:
 * 1. WHAT IS HAPPENING? -> Weight, Filtered Weight, Flow Rate, Fill %
 * 2. IS SOMETHING WRONG? -> Current Event, Evidence Score, Alert Priority
 * 3. WHICH BED? -> Bed 1 / Bed 2 identifier badge
 * 4. IS THE SENSOR HEALTHY? -> Sensor Status (Normal / Drift / Failure) + Device Connectivity
 * 5. WHAT ACTION IS REQUIRED? -> Acknowledge / Resolve interactive controls
 */

export default function BedCard({
  bed,
  onAcknowledge,
  onResolve,
  onViewDetails,
  onViewCharts,
}) {
  if (!bed) {
    return (
      <div className="bed-card bed-card-empty">
        <div className="empty-state">No bed telemetry available.</div>
      </div>
    );
  }

  // 7 UI States: LOADING, NORMAL, WARNING, CRITICAL, EMPTY, ERROR, OFFLINE
  const isOffline = bed.deviceStatus === 'OFFLINE';
  const isError = bed.status === 'ERROR';
  const isCritical = bed.alertPriority === 'CRITICAL' || bed.status === 'CRITICAL' || bed.currentEvent === 'LOW_VOLUME';
  const isWarning = bed.alertPriority === 'WARNING' || bed.status === 'WARNING' || bed.currentEvent === 'FLOW_INTERRUPTION' || bed.sensorStatus === 'DRIFT';
  const isFlowing = bed.flowStatus === 'ACTIVE' && bed.flowRate > 0.5;

  let stateClass = 'state-normal';
  let statusBadgeLabel = 'Normal Operation';
  let statusBadgeClass = 'pill-stable';

  if (isOffline) {
    stateClass = 'state-offline';
    statusBadgeLabel = 'Device Offline';
    statusBadgeClass = 'pill-offline';
  } else if (isError) {
    stateClass = 'state-error';
    statusBadgeLabel = 'Sensor Error';
    statusBadgeClass = 'pill-critical';
  } else if (isCritical) {
    stateClass = 'has-critical state-critical';
    statusBadgeLabel = 'Critical Attention Required';
    statusBadgeClass = 'pill-critical';
  } else if (isWarning) {
    stateClass = 'has-warning state-warning';
    statusBadgeLabel = 'Warning / Review';
    statusBadgeClass = 'pill-watch';
  }

  // Fill percentage calculation
  const fillPct = Math.max(0, Math.min(100, bed.percentRemaining ?? 0));
  const fillClass = isCritical ? 'low' : isWarning ? 'watch' : '';

  // Format timestamp
  const lastUpdatedDisplay = bed.lastUpdated
    ? new Date(bed.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  return (
    <div className={`bed-card ${stateClass}`}>
      {/* Visual Drip Gauge (Fill % + flow animation) */}
      <div className="drip-gauge" aria-label={`Fill level ${fillPct}%`}>
        <div
          className={`drip-gauge-fill ${fillClass}`}
          style={{ height: `${fillPct}%` }}
        />
        {isFlowing && <div className="drip-dot" />}
      </div>

      <div className="bed-card-body">
        {/* Q3: WHICH BED? + Telemetry Header */}
        <div className="bed-card-head">
          <div>
            <div className="bed-identity-row">
              <span className="bed-number">{bed.name || `Bed ${bed.bedId}`}</span>
              <span className="bed-channel-badge">CH-{bed.channelId || bed.bedId}</span>
            </div>
            <span className="bed-device-code">{bed.deviceId}</span>
          </div>

          <div className="bed-head-badges">
            {/* Q4: IS THE SENSOR HEALTHY? */}
            <span className={`sensor-chip chip-${(bed.sensorStatus || 'NORMAL').toLowerCase()}`}>
              Sensor: {bed.sensorStatus || 'NORMAL'}
            </span>
            <span className={`device-chip chip-${(bed.deviceStatus || 'ONLINE').toLowerCase()}`}>
              {bed.deviceStatus || 'ONLINE'}
            </span>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bed-status-banner-row">
          <span className={`bed-status-pill ${statusBadgeClass}`}>
            {statusBadgeLabel}
          </span>
          {bed.aiAvailable === false ? (
            <span className="ai-unavailable-chip" title="Core IV monitoring active; AI anomaly model offline">
              AI UNAVAILABLE
            </span>
          ) : (
            <span className="ai-active-chip" title="Isolation Forest model active">
              AI Monitored
            </span>
          )}
        </div>

        {/* Q1: WHAT IS HAPPENING? (Weight + Flow) */}
        <div className="bed-clinical-section">
          <div className="section-title">What is happening?</div>
          <div className="bed-metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Current Weight</span>
              <span className="metric-val">{bed.currentWeight} <small>g</small></span>
              <span className="metric-sub">Filtered: {bed.filteredWeight} g</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Flow Rate</span>
              <span className="metric-val">{bed.flowRate} <small>mL/hr</small></span>
              <span className="metric-sub status-indicator">
                Status: <strong>{bed.flowStatus}</strong>
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Remaining Volume</span>
              <span className="metric-val">{bed.percentRemaining}%</span>
              <span className="metric-sub">Baseline: {bed.baseline} g</span>
            </div>
          </div>
        </div>

        {/* Q2: IS SOMETHING WRONG? (Event + Evidence + Alert) */}
        <div className="bed-clinical-section event-section">
          <div className="section-title">Is something wrong?</div>
          <div className="event-info-box">
            <div className="event-primary-row">
              <span className="event-name-tag">
                Event: <strong>{bed.currentEvent || 'NORMAL_FLOW'}</strong>
              </span>
              <span className={`priority-tag tag-${(bed.alertPriority || 'NORMAL').toLowerCase()}`}>
                Priority: {bed.alertPriority || 'NORMAL'}
              </span>
            </div>
            <div className="evidence-score-row">
              <span>Evidence Score:</span>
              <span className="evidence-val">
                {bed.evidenceScore != null ? (
                  <><strong>{(bed.evidenceScore * 100).toFixed(0)}%</strong> ({(bed.evidenceScore).toFixed(2)})</>
                ) : (
                  'Calculating…'
                )}
              </span>
            </div>
            <div className="ai-telemetry-row">
              <span>AI Drift: {bed.driftScore != null ? bed.driftScore.toFixed(2) : '0.00'}</span>
              <span>Anomaly Score: {bed.anomalyScore != null ? bed.anomalyScore.toFixed(2) : '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Q5: WHAT ACTION IS REQUIRED? + Quick Actions */}
        <div className="bed-card-footer">
          <div className="card-timestamp">
            Last update: <span>{lastUpdatedDisplay}</span>
          </div>

          <div className="card-action-buttons">
            {onViewCharts && (
              <button
                type="button"
                className="btn-card-action btn-charts"
                onClick={() => onViewCharts(bed.bedId)}
                title="View Weight & Flow Charts"
              >
                Charts
              </button>
            )}
            {onAcknowledge && (isWarning || isCritical) && (
              <button
                type="button"
                className="btn-card-action btn-ack"
                onClick={() => onAcknowledge(bed.bedId)}
              >
                Acknowledge
              </button>
            )}
            {onResolve && (isWarning || isCritical) && (
              <button
                type="button"
                className="btn-card-action btn-resolve"
                onClick={() => onResolve(bed.bedId)}
              >
                Resolve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
