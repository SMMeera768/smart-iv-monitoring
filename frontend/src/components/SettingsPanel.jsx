import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * SettingsPanel Component
 *
 * Configurable thresholds for backend rule engine and anomaly detection:
 * - Low-volume threshold
 * - Flow interruption threshold
 * - Minimum interruption duration
 * - Bag replacement threshold
 * - Drift threshold
 * - Anomaly threshold
 * - Sampling interval
 *
 * Labeled dynamically as "Configured by backend".
 */

export default function SettingsPanel() {
  const [config, setConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', isError: false });

  useEffect(() => {
    let active = true;
    setLoading(true);

    api.getConfiguration()
      .then((cfg) => {
        if (active) {
          setConfig(cfg);
          setFormData(cfg);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setStatusMsg({ text: `Failed to load config: ${err.message}`, isError: true });
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function handleChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || value,
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', isError: false });

    try {
      const res = await api.updateConfiguration(formData);
      setConfig(res.configuration || formData);
      setStatusMsg({ text: 'Configuration saved and broadcast to backend rule engine.', isError: false });
    } catch (err) {
      setStatusMsg({ text: `Error updating settings: ${err.message}`, isError: true });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg({ text: '', isError: false }), 4000);
    }
  }

  if (loading) {
    return <div className="loading-state">Loading backend configuration…</div>;
  }

  return (
    <div className="settings-panel-container">
      <div className="panel-header-row">
        <div>
          <h2>Platform Settings & Event Thresholds</h2>
          <p className="panel-subtitle">
            Scientific thresholds parameterized and stored in backend configuration.
          </p>
        </div>

        <span className="source-tag">
          {config?.source || 'Configured by backend'}
        </span>
      </div>

      {statusMsg.text && (
        <div className={`toast-banner ${statusMsg.isError ? 'toast-error' : 'toast-success'}`}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-section">
          <h3>1. Volume & Flow Interruption Thresholds</h3>
          <p className="section-note">
            Controls critical alert generation during active patient infusion.
          </p>

          <div className="settings-grid">
            <div className="form-field">
              <label>Low-Volume Trigger Threshold</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  step="1"
                  value={formData.lowVolumeThreshold ?? 50}
                  onChange={(e) => handleChange('lowVolumeThreshold', e.target.value)}
                />
                <span className="unit-label">grams / mL</span>
              </div>
              <small>Triggers LOW_VOLUME alarm when weight drops below this value.</small>
            </div>

            <div className="form-field">
              <label>Flow Interruption Cutoff</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  step="0.1"
                  value={formData.flowInterruptionThreshold ?? 0.5}
                  onChange={(e) => handleChange('flowInterruptionThreshold', e.target.value)}
                />
                <span className="unit-label">mL / hr</span>
              </div>
              <small>Minimum flow rate below which occlusion is suspected.</small>
            </div>

            <div className="form-field">
              <label>Minimum Interruption Persistence</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  step="10"
                  value={formData.minInterruptionDurationSec ?? 180}
                  onChange={(e) => handleChange('minInterruptionDurationSec', e.target.value)}
                />
                <span className="unit-label">seconds</span>
              </div>
              <small>Prevents false alarms caused by brief transient tube movement.</small>
            </div>

            <div className="form-field">
              <label>Bag Replacement Minimum Delta</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  step="10"
                  value={formData.bagReplacementThreshold ?? 200}
                  onChange={(e) => handleChange('bagReplacementThreshold', e.target.value)}
                />
                <span className="unit-label">grams</span>
              </div>
              <small>Positive step change required to log BAG_REPLACEMENT event.</small>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>2. AI Anomaly & Drift Parameters</h3>
          <p className="section-note">
            Isolation Forest score cutoffs for sensor drift and signal anomalies.
          </p>

          <div className="settings-grid">
            <div className="form-field">
              <label>Sensor Drift Rate Threshold</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  step="0.01"
                  value={formData.driftThreshold ?? 0.15}
                  onChange={(e) => handleChange('driftThreshold', e.target.value)}
                />
                <span className="unit-label">g / min</span>
              </div>
              <small>Non-physiological upward slope flagging baseline creep.</small>
            </div>

            <div className="form-field">
              <label>Isolation Forest Anomaly Score Cutoff</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  step="0.05"
                  value={formData.anomalyThreshold ?? -0.25}
                  onChange={(e) => handleChange('anomalyThreshold', e.target.value)}
                />
                <span className="unit-label">score</span>
              </div>
              <small>Scores below this cutoff flag uncharacteristic sensor noise.</small>
            </div>

            <div className="form-field">
              <label>ADC Sampling Interval</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  step="10"
                  value={formData.samplingIntervalMs ?? 100}
                  onChange={(e) => handleChange('samplingIntervalMs', e.target.value)}
                />
                <span className="unit-label">ms (10 Hz)</span>
              </div>
              <small>Digitizer sampling cadence for dual HX711 modules.</small>
            </div>
          </div>
        </div>

        <div className="form-action-footer">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving to Backend…' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
