import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * CalibrationPanel Component
 *
 * Consumes CalibrationResponse from GET /api/calibration/{bedCode}.
 * Executes tare via POST /api/calibration/{bedCode}/tare.
 * Saves factor via POST /api/calibration/{bedCode}.
 * Truthfully displays calibration state without fabricating certified weights.
 */

export default function CalibrationPanel({ user = {} }) {
  const [calBed1, setCalBed1] = useState(null);
  const [calBed2, setCalBed2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [taringBed, setTaringBed] = useState(null);

  // Form inputs
  const [factor1, setFactor1] = useState(1.0);
  const [factor2, setFactor2] = useState(1.0);
  const [refWeight1, setRefWeight1] = useState(500.0);
  const [refWeight2, setRefWeight2] = useState(500.0);

  function loadCalibrations() {
    setLoading(true);
    Promise.all([api.getCalibration('BED_1'), api.getCalibration('BED_2')])
      .then(([c1, c2]) => {
        setCalBed1(c1);
        setCalBed2(c2);
        if (c1?.calibrationFactor) setFactor1(c1.calibrationFactor);
        if (c2?.calibrationFactor) setFactor2(c2.calibrationFactor);
        if (c1?.knownReferenceWeight) setRefWeight1(c1.knownReferenceWeight);
        if (c2?.knownReferenceWeight) setRefWeight2(c2.knownReferenceWeight);
        setLoading(false);
      })
      .catch((err) => {
        setNotice(`Error loading calibration: ${err.message}`);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadCalibrations();
  }, []);

  async function handleTare(bedCode) {
    setTaringBed(bedCode);
    const username = user.username || user.fullName || 'biomed_engineer';
    try {
      const res = await api.tareBed(bedCode, username);
      setNotice(`Zero/Tare command executed on ${bedCode}. Zero offset refreshed in database.`);
      loadCalibrations();
    } catch (err) {
      setNotice(`Tare failed: ${err.message}`);
    } finally {
      setTaringBed(null);
      setTimeout(() => setNotice(''), 4000);
    }
  }

  async function handleSaveCalibration(bedCode, factorVal, refWeightVal) {
    const username = user.username || user.fullName || 'biomed_engineer';
    const calData = {
      calibrationFactor: parseFloat(factorVal),
      knownReferenceWeight: parseFloat(refWeightVal),
      zeroOffset: 0.0,
      notes: 'Updated via Biomedical Engineer console',
    };

    try {
      await api.saveCalibration(bedCode, calData, username);
      setNotice(`Calibration record for ${bedCode} updated to factor ${factorVal}.`);
      loadCalibrations();
    } catch (err) {
      setNotice(`Calibration save failed: ${err.message}`);
    } finally {
      setTimeout(() => setNotice(''), 4000);
    }
  }

  return (
    <div className="calibration-panel-container">
      <div className="panel-header-row">
        <div>
          <h2>Sensor Calibration &amp; Tare Management</h2>
          <p className="panel-subtitle">
            PostgreSQL calibration parameters for dual HX711 digitizers (Bed 1 &amp; Bed 2).
          </p>
        </div>
      </div>

      {/* Scope Disclaimer */}
      <div className="calibration-disclaimer-card">
        <div className="disclaimer-header">Pre-Hardware Integration Interface</div>
        <p>
          Physical load-cell calibration factors are pending certified balance testing.
          Values shown below are baseline development records from the <code>calibrations</code> table.
        </p>
      </div>

      {notice && (
        <div className="toast-banner">
          {notice}
        </div>
      )}

      {loading && <div className="loading-state">Loading calibration registers from backend…</div>}

      {!loading && (
        <div className="calibration-cards-grid">
          {/* Bed 1 Calibration Card */}
          <div className="calibration-card">
            <div className="cal-card-head">
              <div>
                <span className="channel-badge font-mono">CHANNEL 1 (HX711_1)</span>
                <h3>Bed 1 Load Cell (BED_1)</h3>
              </div>
              <span className="cal-status-tag font-mono">Pins: DT 21 / SCK 22</span>
            </div>

            <div className="cal-metrics">
              <div className="cal-row">
                <span className="label">Zero Offset (Counts):</span>
                <span className="val font-mono">{calBed1?.zeroOffset ?? 0.0}</span>
              </div>
              <div className="cal-row">
                <span className="label">Last Calibrated At:</span>
                <span className="val">{calBed1?.calibratedAt || 'Pending physical testing'}</span>
              </div>
              <div className="cal-row">
                <span className="label">Calibrated Operator:</span>
                <span className="val font-mono">{calBed1?.calibratedBy || 'biomed_engineer'}</span>
              </div>
              <div className="cal-row">
                <span className="label">Calibration Notes:</span>
                <span className="val text-muted">{calBed1?.notes || 'Baseline record'}</span>
              </div>
            </div>

            <div className="cal-controls">
              <div className="cal-input-group">
                <label className="field-label">Scaling Factor (counts / gram)</label>
                <input
                  type="number"
                  step="0.05"
                  className="input-text font-mono"
                  value={factor1}
                  onChange={(e) => setFactor1(e.target.value)}
                />
              </div>

              <div className="cal-input-group">
                <label className="field-label">Reference Test Weight (grams)</label>
                <input
                  type="number"
                  step="1"
                  className="input-text font-mono"
                  value={refWeight1}
                  onChange={(e) => setRefWeight1(e.target.value)}
                />
              </div>

              <div className="cal-action-row">
                <button
                  type="button"
                  className="btn-primary-sm"
                  onClick={() => handleSaveCalibration('BED_1', factor1, refWeight1)}
                >
                  Save Calibration
                </button>

                <button
                  type="button"
                  className="btn-tare"
                  disabled={taringBed === 'BED_1'}
                  onClick={() => handleTare('BED_1')}
                >
                  {taringBed === 'BED_1' ? 'Taring…' : 'Zero / Tare Bed 1'}
                </button>
              </div>
            </div>
          </div>

          {/* Bed 2 Calibration Card */}
          <div className="calibration-card">
            <div className="cal-card-head">
              <div>
                <span className="channel-badge font-mono">CHANNEL 2 (HX711_2)</span>
                <h3>Bed 2 Load Cell (BED_2)</h3>
              </div>
              <span className="cal-status-tag font-mono">Pins: DT 19 / SCK 18</span>
            </div>

            <div className="cal-metrics">
              <div className="cal-row">
                <span className="label">Zero Offset (Counts):</span>
                <span className="val font-mono">{calBed2?.zeroOffset ?? 0.0}</span>
              </div>
              <div className="cal-row">
                <span className="label">Last Calibrated At:</span>
                <span className="val">{calBed2?.calibratedAt || 'Pending physical testing'}</span>
              </div>
              <div className="cal-row">
                <span className="label">Calibrated Operator:</span>
                <span className="val font-mono">{calBed2?.calibratedBy || 'biomed_engineer'}</span>
              </div>
              <div className="cal-row">
                <span className="label">Calibration Notes:</span>
                <span className="val text-muted">{calBed2?.notes || 'Baseline record'}</span>
              </div>
            </div>

            <div className="cal-controls">
              <div className="cal-input-group">
                <label className="field-label">Scaling Factor (counts / gram)</label>
                <input
                  type="number"
                  step="0.05"
                  className="input-text font-mono"
                  value={factor2}
                  onChange={(e) => setFactor2(e.target.value)}
                />
              </div>

              <div className="cal-input-group">
                <label className="field-label">Reference Test Weight (grams)</label>
                <input
                  type="number"
                  step="1"
                  className="input-text font-mono"
                  value={refWeight2}
                  onChange={(e) => setRefWeight2(e.target.value)}
                />
              </div>

              <div className="cal-action-row">
                <button
                  type="button"
                  className="btn-primary-sm"
                  onClick={() => handleSaveCalibration('BED_2', factor2, refWeight2)}
                >
                  Save Calibration
                </button>

                <button
                  type="button"
                  className="btn-tare"
                  disabled={taringBed === 'BED_2'}
                  onClick={() => handleTare('BED_2')}
                >
                  {taringBed === 'BED_2' ? 'Taring…' : 'Zero / Tare Bed 2'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
