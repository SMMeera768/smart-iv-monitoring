import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * AuditLogPanel Component
 *
 * Displays:
 * - timestamp, user, role, action, bed, event, result
 * - Clearly identifies actions as mock/development records
 */

export default function AuditLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  function fetchLogs() {
    setLoading(true);
    api.getAuditLogs()
      .then((data) => {
        setLogs(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const isDemo = api.isMockMode ? api.isMockMode() : true;

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (log.user && log.user.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.bed && log.bed.toLowerCase().includes(term)) ||
      (log.event && log.event.toLowerCase().includes(term)) ||
      (log.role && log.role.toLowerCase().includes(term)) ||
      (log.result && log.result.toLowerCase().includes(term))
    );
  });

  return (
    <div className="audit-log-container">
      <div className="panel-header-row">
        <div>
          <h2>System Audit & Compliance Log</h2>
          <p className="panel-subtitle">
            Immutable log of user clinical actions, alarms acknowledged, zeroing, and configuration updates.
          </p>
        </div>

        <div className="search-filter-box">
          <input
            type="text"
            placeholder="Filter by user, action, or bed…"
            className="input-text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="demo-data-banner">
        <div className="banner-badge">{isDemo ? 'DEMO AUDIT LOG' : 'AUDIT TRAIL'}</div>
        <div className="banner-text">
          {isDemo
            ? 'Audit entries displayed below reflect interactive mock actions and seeded events.'
            : 'Audit entries retrieved from PostgreSQL immutable event ledger.'}
        </div>
      </div>

      {loading && <div className="loading-state">Retrieving audit chain…</div>}

      {!loading && filteredLogs.length === 0 && (
        <div className="empty-state">No audit log records match the search filter.</div>
      )}

      {!loading && filteredLogs.length > 0 && (
        <div className="table-responsive">
          <table className="data-table audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Operator</th>
                <th>Role</th>
                <th>Action Executed</th>
                <th>Bed / Target</th>
                <th>Details / Transition</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-muted">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <strong>{log.user || log.username}</strong>
                  </td>
                  <td>
                    <span className="role-tag font-mono">{log.role || 'STAFF'}</span>
                  </td>
                  <td>
                    <span className="action-badge">{log.action}</span>
                  </td>
                  <td>
                    <span className="bed-tag">{log.bed || log.bedCode || 'System'}</span>
                  </td>
                  <td className="font-mono text-small">
                    {log.previousValue && log.newValue ? (
                      <span>{log.event}: <del>{log.previousValue}</del> → <strong>{log.newValue}</strong></span>
                    ) : (
                      log.event || '—'
                    )}
                  </td>
                  <td>
                    <span className={`result-pill ${log.result === 'SUCCESS' ? 'pill-success' : 'pill-failure'}`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
