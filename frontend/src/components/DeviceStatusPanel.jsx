import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * DeviceStatusPanel Component
 *
 * Telemetry health view for:
 * - BED 1 DEVICE (ESP32-WROOM-01, Dual HX711 channel 1)
 * - BED 2 DEVICE (ESP32-WROOM-02, Dual HX711 channel 2)
 *
 * Clearly labeled as software-simulated states for pre-hardware testing.
 */

function timeAgo(iso) {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const secs = Math.max(0, Math.round(diffMs / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  return `${mins}m ago`;
}

export default function DeviceStatusPanel() {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    api.getDeviceStatus()
      .then((res) => {
        if (active) {
          setDeviceData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to fetch device status');
          setLoading(false);
        }
      });

    const interval = setInterval(() => {
      api.getDeviceStatus().then((res) => {
        if (active) setDeviceData(res);
      });
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (loading && !deviceData) {
    return <div className="loading-state">Querying device telemetry gateways…</div>;
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  const systemStatus = deviceData?.systemStatus || 'ONLINE';
  const devices = deviceData?.devices || [];

  return (
    <div className="device-status-container">
      {/* Panel Header */}
      <div className="panel-header-row">
        <div>
          <h2>Device & Sensor Health</h2>
          <p className="panel-subtitle">
            ESP32 microcontrollers, 2 × HX711 load-cell digitizers & network link telemetry.
          </p>
        </div>

        <div className="overall-health-badge">
          <span className="health-label">System Health:</span>
          <span className={`pill-system status-${systemStatus.toLowerCase()}`}>
            ● {systemStatus} (SOFTWARE SIMULATED)
          </span>
        </div>
      </div>

      {/* Integration Boundary Notice */}
      <div className="hardware-boundary-card">
        <div className="boundary-title">Hardware Independence Notice</div>
        <p>
          Telemetry values displayed below reflect the pre-integration software contract.
          Physical ESP32 microcontrollers and load cells remain isolated in physical testing.
        </p>
      </div>

      {/* Devices Grid */}
      <div className="devices-two-bed-grid">
        {devices.map((dev) => {
          const isHealthy = dev.esp32Status === 'ONLINE' && dev.sensorStatus === 'NORMAL';

          return (
            <div key={dev.deviceId} className="device-telemetry-card">
              <div className="card-top-header">
                <div>
                  <div className="bed-assoc-badge">BED {dev.bedId} DEVICE</div>
                  <h3 className="device-id-code font-mono">{dev.deviceId}</h3>
                </div>
                <span className={`pill-device-status ${isHealthy ? 'status-good' : 'status-alert'}`}>
                  {dev.esp32Status}
                </span>
              </div>

              <div className="device-specs-list">
                <div className="spec-row">
                  <span className="spec-label">ESP32 Status</span>
                  <span className="spec-val font-mono">{dev.esp32Status}</span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">Wi-Fi Link</span>
                  <span className="spec-val">
                    {dev.wifiStatus} <small>({dev.rssi || -55} dBm)</small>
                  </span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">IP Address</span>
                  <span className="spec-val font-mono">{dev.ipAddress || '192.168.1.101'}</span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">Last Packet Received</span>
                  <span className="spec-val highlight-val">{timeAgo(dev.lastPacket)}</span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">Sampling Status</span>
                  <span className="spec-val">{dev.samplingStatus || 'ACTIVE (10 Hz)'}</span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">HX711 Digitizer</span>
                  <span className="spec-val text-success">{dev.hx711Status || 'HEALTHY'}</span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">Sensor Physical State</span>
                  <span className={`pill-sensor-status chip-${(dev.sensorStatus || 'NORMAL').toLowerCase()}`}>
                    {dev.sensorStatus || 'NORMAL'}
                  </span>
                </div>

                <div className="spec-row">
                  <span className="spec-label">Hardware Pin Assignment</span>
                  <span className="spec-val font-mono text-muted">{dev.gpioPins || 'GPIO DT/SCK'}</span>
                </div>
              </div>

              <div className="device-card-footer">
                <div className="sim-tag">Test Payload Gateway Active</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
