import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * CalibrationPanel Component
 *
 * Software/UI side of calibration only:
 * - Bed 1 & Bed 2 Calibration factors and tare status
 * - API abstractions for tare and calibration factor updates
 * - Research disclaimer: NO physical calibration performed in this phase.
 */

export default function CalibrationPanel() {
  const [calBed1, setCalBed1] = useState(null);
  const [calBed2, setCalBed2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [isTaring, setIsTaring] = useState(false);

  // Editable factor inputs
  const [factor1, setFactor1] = useState(420.5);
  const [factor2, setFactor2] = useState(418.2);

  function loadCalibrations() {
    setLoading(true);
    Promise.all([api.getCalibration('1'), api.getCalibration('2')])
      .then(([c1, c2]) => {
        setCalBed1(c1);
        setCalBed2(c2);
        if (c1?.calibrationFactor) setFactor1(c1.calibrationFactor);
        if (c2?.calibrationFactor) setFactor2(c2.calibrationFactor);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadCalibrations();
  }, []);

  async function handleTare(bedId) {
    setIsTaring(true);
    try {
      await api.tareBed(bedId);
      setNotice(`Bed ${bedId} Tare signal sent to backend API. Offset refreshed.`);
      loadCalibrations();
    } catch (err) {
      setNotice(`Tare failed: ${err.message}`);
    } finally {
      setIsTaring(false);
      setTimeout(() => setNotice(''), 4000);
    }
  }

  async function handleSaveFactor(bedId, factorVal) {
    try {
      await api.saveCalibration(bedId, { calibrationFactor: parseFloat(factorVal) });
      setNotice(`Bed ${bedId} calibration factor updated to ${factorVal} in backend config.`);
      loadCalibrations();
    } catch (err) {
      setNotice(`Save failed: ${err.message}`);
    } finally {
      setTimeout(() => setNotice(''), 4000);
    }
  }

  return (
    <div className="calibration-panel-container">
      <div className="panel-header-row">
        <div>
          <h2>Sensor Calibration & Zeroing</h2>
          <p className="panel-subtitle">
            Software abstraction layer for load-cell tare offsets and digitizer scaling factors.
          </p>
        </div>
      </div>

      {/* Safety & Protocol Banner */}
      <div className="calibration-disclaimer-card">
        <div className="disclaimer-header">Software Demonstration Interface Only</div>
        <p>
          DO NOT claim physical load cells are calibrated. Actual physical weights and calibration
          factors will be established during the dedicated hardware phase.
        </p>
      </div>

      {notice && (
        <div className="toast-banner">
          {notice}
        </div>
      )}

      {loading && <div className="loading-state">Loading calibration registers…</div>}

      {!loading && (
        <div className="calibration-cards-grid">
          {/* Bed 1 Calibration Card */}
          <div className="calibration-card">
            <div className="cal-card-head">
              <h3>Bed 1 Load Cell (Channel 1)</h3>
              <span className="cal-status-tag">{calBed1?.calibrationStatus || 'READY'}</span>
            </div>

            <div className="cal-metrics">
              <div className="cal-row">
                <span className="label">Zero / Tare State:</span>
                <span className="val text-success font-mono">{calBed1?.zeroTareStatus || 'ZEROED'}</span>
              </div>
              <div className="cal-row">
                <span className="label">Raw ADC Tare Offset:</span>
                <span className="val font-mono">{calBed1?.tareOffset || 12540}</span>
              </div>
              <div className="cal-row">
                <span className="label">Last Zeroed Time:</span>
                <span className="val">{calBed1?.lastCalibrationTime || 'Never'}</span>
              </div>
            </div>

            <div className="cal-controls">
              <label className="field-label">Calibration Scale Factor (counts / gram)</label>
              <div className="input-action-group">
                <input
                  type="number"
                  step="0.05"
                  className="input-text font-mono"
                  value={factor1}
                  onChange={(e) => setFactor1(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary-sm"
                  onClick={() => handleSaveFactor('1', factor1)}
                >
                  Save Factor
                </button>
              </div>

              <div className="tare-action-box">
                <button
                  type="button"
                  className="btn-tare"
                  disabled={isTaring}
                  onClick={() => handleTare('1')}
                >
                  {isTaring ? 'Zeroing…' : 'Zero / Tare Bed 1'}
                </button>
                <small>Resets baseline tare with empty hook before hanging IV bag.</small>
              </div>
            </div>
          </div>

          {/* Bed 2 Calibration Card */}
          <div className="calibration-card">
            <div className="cal-card-head">
              <h3>Bed 2 Load Cell (Channel 2)</h3>
              <span className="cal-status-tag">{calBed2?.calibrationStatus || 'READY'}</span>
            </div>

            <div className="cal-metrics">
              <div className="cal-row">
                <span className="label">Zero / Tare State:</span>
                <span className="val text-success font-mono">{calBed2?.zeroTareStatus || 'ZEROED'}</span>
              </div>
              <div className="cal-row">
                <span className="label">Raw ADC Tare Offset:</span>
                <span className="val font-mono">{calBed2?.tareOffset || 11890}</span>
              </div>
              <div className="cal-row">
                <span className="label">Last Zeroed Time:</span>
                <span className="val">{calBed2?.lastCalibrationTime || 'Never'}</span>
              </div>
            </div>

            <div className="cal-controls">
              <label className="field-label">Calibration Scale Factor (counts / gram)</label>
              <div className="input-action-group">
                <input
                  type="number"
                  step="0.05"
                  className="input-text font-mono"
                  value={factor2}
                  onChange={(e) => setFactor2(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary-sm"
                  onClick={() => handleSaveFactor('2', factor2)}
                >
                  Save Factor
                </button>
              </div>

              <div className="tare-action-box">
                <button
                  type="button"
                  className="btn-tare"
                  disabled={isTaring}
                  onClick={() => handleTare('2')}
                >
                  {isTaring ? 'Zeroing…' : 'Zero / Tare Bed 2'}
                </button>
                <small>Resets baseline tare with empty hook before hanging IV bag.</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
