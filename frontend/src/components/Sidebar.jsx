import React from 'react';
import DropIcon from './DropIcon.jsx';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * Sidebar Component with Role-Based Navigation & Live Role Switcher
 */

export const ALL_NAV_ITEMS = [
  { key: 'dashboard', label: 'Two-Bed Dashboard', icon: '⬒' },
  { key: 'alerts', label: 'Alerts & Triage', icon: '⚑' },
  { key: 'events', label: 'IV Workflow Events', icon: '📋' },
  { key: 'analytics', label: 'Operational Analytics', icon: '▤' },
  { key: 'devices', label: 'Device & Sensor Health', icon: '📡' },
  { key: 'calibration', label: 'Calibration & Zeroing', icon: '⚖️' },
  { key: 'settings', label: 'Settings & Thresholds', icon: '⚙️' },
  { key: 'research', label: 'Research Performance', icon: '🔬' },
  { key: 'audit', label: 'Audit & Compliance Log', icon: '🛡️' },
];

export const ROLE_PERMISSIONS = {
  NURSE: ['dashboard', 'alerts'],
  DOCTOR: ['dashboard', 'events', 'analytics', 'research'],
  BIOMEDICAL_ENGINEER: ['devices', 'calibration', 'settings'],
  ADMINISTRATOR: ['dashboard', 'alerts', 'events', 'analytics', 'devices', 'calibration', 'settings', 'research', 'audit'],
};

export default function Sidebar({
  activeView,
  onNavigate,
  user,
  openAlertCount = 0,
  onLogout,
  isDemo = true,
  onSwitchRole,
}) {
  const currentRole = user?.role || 'NURSE';
  const allowedViews = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.NURSE;

  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => allowedViews.includes(item.key));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <DropIcon size={22} color="#48CFCB" />
        <div className="sidebar-brand-text">
          IV Monitor POC
          <small>{isDemo ? 'Software Demo Mode' : 'Connected to Backend'}</small>
        </div>
      </div>

      {/* Role Switcher Widget in Demo Mode */}
      {isDemo && onSwitchRole && (
        <div className="sidebar-role-switcher">
          <span className="role-switcher-label">Switch Active Role:</span>
          <select
            className="role-select-dropdown"
            value={currentRole}
            onChange={(e) => onSwitchRole(e.target.value)}
          >
            <option value="NURSE">Nurse</option>
            <option value="DOCTOR">Doctor</option>
            <option value="BIOMEDICAL_ENGINEER">Biomedical Engineer</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </select>
        </div>
      )}

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`nav-item ${activeView === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.key === 'alerts' && openAlertCount > 0 && (
              <span className="nav-badge">{openAlertCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-name">{user?.fullName || 'Clinical Staff'}</span>
          <span className="sidebar-user-role font-mono">{currentRole}</span>
        </div>
        <button type="button" className="logout-btn" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
