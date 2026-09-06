import React, { useState } from 'react';
import DropIcon from './DropIcon.jsx';
import { api } from '../api.js';
import { mockUsers } from '../mock/ivMockData.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Login Component
 *
 * Supports:
 * 1. Role-based fast login for development (Nurse, Biomedical Engineer, Doctor, Administrator)
 * 2. Standard credentials login wired to POST /api/auth/login
 */

export default function Login({ onLogin, onDemoLogin }) {
  const [mode, setMode] = useState('demo'); // Default to demo for instant testing
  const [email, setEmail] = useState('priya.nurse@hospital.test');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState('NURSE');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (mode === 'demo') {
      const user = mockUsers[selectedRole.toLowerCase()] || mockUsers.nurse;
      onDemoLogin(user);
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ email, password });
      onLogin(res);
    } catch (err) {
      setError(
        err.message?.includes('Failed to fetch')
          ? "Cannot connect to Spring Boot backend at localhost:8080. Try Demo Mode below."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function handleQuickRoleSelect(roleKey) {
    setSelectedRole(roleKey.toUpperCase());
    const user = mockUsers[roleKey.toLowerCase()] || mockUsers.nurse;
    onDemoLogin(user);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <DropIcon size={24} color="#0E7C7B" />
          <span className="login-brand-text">IV Monitor POC</span>
        </div>
        <p className="login-sub">Smart Multi-Bed IV Workflow & Event Monitoring</p>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            type="button"
            className={mode === 'demo' ? 'active' : ''}
            onClick={() => setMode('demo')}
          >
            Demo / Mock Mode
          </button>
          <button
            type="button"
            className={mode === 'live' ? 'active' : ''}
            onClick={() => setMode('live')}
          >
            Connect to REST API
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        {mode === 'demo' ? (
          <div className="quick-roles-container">
            <label className="field-label">Select Clinical Role to Enter:</label>
            <div className="role-buttons-grid">
              <button
                type="button"
                className={`btn-role-select ${selectedRole === 'NURSE' ? 'active' : ''}`}
                onClick={() => handleQuickRoleSelect('nurse')}
              >
                <div className="role-title">👩‍⚕️ Nurse</div>
                <small>Dashboard &amp; Alerts Triage</small>
              </button>

              <button
                type="button"
                className={`btn-role-select ${selectedRole === 'BIOMEDICAL_ENGINEER' ? 'active' : ''}`}
                onClick={() => handleQuickRoleSelect('biomed')}
              >
                <div className="role-title">🔧 Bio-Medical Eng.</div>
                <small>Hardware Status, Calibration &amp; Settings</small>
              </button>

              <button
                type="button"
                className={`btn-role-select ${selectedRole === 'DOCTOR' ? 'active' : ''}`}
                onClick={() => handleQuickRoleSelect('doctor')}
              >
                <div className="role-title">🩺 Doctor</div>
                <small>Dashboard, Events &amp; Analytics</small>
              </button>

              <button
                type="button"
                className={`btn-role-select ${selectedRole === 'ADMINISTRATOR' ? 'active' : ''}`}
                onClick={() => handleQuickRoleSelect('admin')}
              >
                <div className="role-title">⚙️ Administrator</div>
                <small>Full System Access &amp; Audit Logs</small>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Staff Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Authenticating with Backend…' : 'Sign In via REST API'}
            </button>
          </form>
        )}

        <div className="login-demo-note">
          {mode === 'demo'
            ? 'Demo mode allows immediate testing of all 10 views, 2 beds, charts, events, and role-based permissions without hardware or database setup.'
            : 'Points at POST /api/auth/login. Seeded credentials: priya.nurse@hospital.test / password123.'}
        </div>
      </div>
    </div>
  );
}
