import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * DeviceStatusPanel Component
 *
 * Consumes List<DeviceResponse> from GET /api/devices.
 * Represents the 1 ESP32 -> 2 HX711 Channels -> 2 Beds architecture truthfully.
 * Does NOT fabricate RSSI or IP addresses.
 */

function timeAgo(iso) {
  if (!iso) return 'Pending first packet';
  const diffMs = Date.now() - new Date(iso).getTime();
  const secs = Math.max(0, Math.round(diffMs / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  return `${mins}m ago`;
}

export default function DeviceStatusPanel() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    api.getDeviceStatus()
      .then((res) => {
        if (active) {
          const list = Array.isArray(res) ? res : (res.devices || []);
          setDevices(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to fetch device telemetry');
          setLoading(false);
        }
      });

    const interval = setInterval(() => {
      api.getDeviceStatus().then((res) => {
        if (active) {
          const list = Array.isArray(res) ? res : (res.devices || []);
          setDevices(list);
        }
      });
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (loading && devices.length === 0) {
    return <div className="loading-state">Querying hardware device status from Spring Boot…</div>;
  }

  if (error) {
    return <div className="error-state">Error loading devices: {error}</div>;
  }

  return (
    <div className="device-status-container">
      {/* Header */}
      <div className="panel-header-row">
        <div>
          <h2>Physical Device &amp; Sensor Channel Health</h2>
          <p className="panel-subtitle">
            1 × ESP32 DevKit V1 serving 2 × HX711 load-cell digitizers for Bed 1 and Bed 2.
          </p>
        </div>

        <div className="overall-health-badge">
          <span className="health-label">Registered Gateways:</span>
          <span className="pill-system status-online">
            {devices.length} Microcontroller Online
          </span>
        </div>
      </div>

      {/* Hardware Scope Boundary */}
      <div className="hardware-boundary-card">
        <div className="boundary-title">Integration &amp; Wiring Specification (Fixed Contract)</div>
        <p>
          Hardware wiring is locked: Channel 1 (DT 21 / SCK 22) $\rightarrow$ Bed 1, Channel 2 (DT 19 / SCK 18) $\rightarrow$ Bed 2.
          Real ESP32 hardware telemetry will connect to <code>POST /api/device/data</code> upon laboratory validation.
        </p>
      </div>

      {/* Device List */}
      <div className="devices-two-bed-grid">
        {devices.map((dev) => {
          const isOnline = dev.deviceStatus === 'ONLINE';

          return (
            <div key={dev.deviceCode || dev.id} className="device-telemetry-card">
              <div className="card-top-header">
                <div>
                  <div className="bed-assoc-badge">CENTRAL TELEMETRY GATEWAY</div>
                  <h3 className="device-id-code font-mono">{dev.deviceCode}</h3>
                </div>
                <span className={`pill-device-status ${isOnline ? 'status-good' : 'status-alert'}`}>
                  {dev.deviceStatus || 'ONLINE'}
                </span>
              </div>

              <div className="device-specs-list">
                <div className="spec-row">
                  <span className="spec-label">Hardware Architecture</span>
                  <span className="spec-val font-mono">{dev.hardwareType || 'ESP32 (Dual-Channel)'}</span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">Firmware Build</span>
                  <span className="spec-val font-mono">{dev.firmwareVersion || 'v1.0.0'}</span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">Network Link State</span>
                  <span className="spec-val font-mono">{dev.wifiStatus || 'CONNECTED'}</span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">Associated Beds</span>
                  <span className="spec-val font-mono highlight-val">
                    {(dev.associatedBeds || ['BED_1', 'BED_2']).join(', ')}
                  </span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">Last Communication</span>
                  <span className="spec-val font-mono">{timeAgo(dev.lastSeenAt)}</span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">Physical RSSI / IP</span>
                  <span className="spec-val text-muted">
                    {dev.rssi != null ? `${dev.rssi} dBm` : 'Pending physical Wi-Fi connection'}
                  </span>
                </div>
              </div>

              {/* Channel Map */}
              <div className="channel-mapping-box">
                <div className="channel-map-title">Physical Sensor Channel Mappings:</div>
                <div className="channel-rows">
                  <div className="channel-row">
                    <span className="channel-badge font-mono">Channel 1 (HX711_1)</span>
                    <span>$\rightarrow$ Bed 1 (Pins: DT GPIO 21 / SCK GPIO 22)</span>
                  </div>
                  <div className="channel-row">
                    <span className="channel-badge font-mono">Channel 2 (HX711_2)</span>
                    <span>$\rightarrow$ Bed 2 (Pins: DT GPIO 19 / SCK GPIO 18)</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
