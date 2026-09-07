import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * SettingsPanel Component
 *
 * Consumes List<ConfigurationResponse> from GET /api/configuration.
 * Updates via PUT /api/configuration?username=admin.
 * Displays all parameterized pipeline & rule thresholds dynamically from backend.
 */

export default function SettingsPanel({ user = {} }) {
  const [configList, setConfigList] = useState([]);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ text: '', isError: false });

  function loadConfig() {
    setLoading(true);
    api.getConfiguration()
      .then((list) => {
        const safeList = Array.isArray(list) ? list : [];
        setConfigList(safeList);
        const map = {};
        safeList.forEach((c) => {
          map[c.configKey] = c.configValue;
        });
        setEditValues(map);
        setLoading(false);
      })
      .catch((err) => {
        setStatusMsg({ text: `Failed to load settings: ${err.message}`, isError: true });
        setLoading(false);
      });
  }

  useEffect(() => {
    loadConfig();
  }, []);

  function handleValueChange(key, val) {
    setEditValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSaveKey(key, originalDesc) {
    setSavingKey(key);
    setStatusMsg({ text: '', isError: false });
    const username = user.username || user.fullName || 'admin';

    try {
      await api.updateConfiguration(key, editValues[key], originalDesc, username);
      setStatusMsg({ text: `Configuration "${key}" successfully saved to backend.`, isError: false });
      loadConfig();
    } catch (err) {
      setStatusMsg({ text: `Error updating "${key}": ${err.message}`, isError: true });
    } finally {
      setSavingKey(null);
      setTimeout(() => setStatusMsg({ text: '', isError: false }), 4000);
    }
  }

  if (loading && configList.length === 0) {
    return <div className="loading-state">Loading backend configuration registry…</div>;
  }

  // Categorize configuration items
  const signalConfigs = configList.filter(c => c.configKey.startsWith('signal.'));
  const ruleConfigs = configList.filter(c => c.configKey.startsWith('rules.'));
  const aiConfigs = configList.filter(c => c.configKey.startsWith('ai.'));
  const otherConfigs = configList.filter(c => !c.configKey.startsWith('signal.') && !c.configKey.startsWith('rules.') && !c.configKey.startsWith('ai.'));

  function renderGroup(title, items, note) {
    if (items.length === 0) return null;

    return (
      <div className="settings-section">
        <h3>{title}</h3>
        {note && <p className="section-note">{note}</p>}

        <div className="settings-table-wrapper">
          <table className="data-table settings-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Parameter Key</th>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ width: '22%' }}>Configured Value</th>
                <th style={{ width: '20%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isModified = editValues[item.configKey] !== item.configValue;
                const isSaving = savingKey === item.configKey;

                return (
                  <tr key={item.configKey}>
                    <td className="font-mono text-strong">{item.configKey}</td>
                    <td className="text-muted">{item.description}</td>
                    <td>
                      <input
                        type="text"
                        className="input-text font-mono inline-config-input"
                        value={editValues[item.configKey] ?? ''}
                        onChange={(e) => handleValueChange(item.configKey, e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn-primary-sm ${isModified ? 'btn-save-active' : ''}`}
                        disabled={isSaving || !isModified}
                        onClick={() => handleSaveKey(item.configKey, item.description)}
                      >
                        {isSaving ? 'Saving…' : 'Update'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-panel-container">
      <div className="panel-header-row">
        <div>
          <h2>System Configuration &amp; Event Thresholds</h2>
          <p className="panel-subtitle">
            Parameterized thresholds stored in PostgreSQL (<code>system_configuration</code>).
          </p>
        </div>

        <span className="source-tag">Configured by Backend</span>
      </div>

      {statusMsg.text && (
        <div className={`toast-banner ${statusMsg.isError ? 'toast-error' : 'toast-success'}`}>
          {statusMsg.text}
        </div>
      )}

      <div className="settings-sections-list">
        {renderGroup(
          '1. IV Workflow Event Detection Rules',
          ruleConfigs,
          'Controls flow interruption, low volume alert, and container replacement thresholds.'
        )}

        {renderGroup(
          '2. Signal Processing Pipeline',
          signalConfigs,
          'Rolling window moving-average and derivative flow smoothing parameters.'
        )}

        {renderGroup(
          '3. AI Anomaly & Drift Thresholds',
          aiConfigs,
          'Cutoff values for Isolation Forest baseline creep and stuck-sensor detection.'
        )}

        {renderGroup(
          '4. Gateway & System Parameters',
          otherConfigs,
          'Hardware timeout and device connectivity parameters.'
        )}
      </div>
    </div>
  );
}
