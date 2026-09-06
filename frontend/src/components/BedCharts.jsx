import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * BedCharts Component
 *
 * Renders:
 * 1. Weight vs Time (Raw Weight vs Filtered Weight)
 * 2. Flow Rate vs Time
 *
 * Strictly driven by api.getBedReadings(bedId) via the centralized data adapter.
 * NO random values generated in the component.
 */

function SimpleLineChart({
  data = [],
  dataKeys = [],
  colors = [],
  labels = [],
  yUnit = '',
  height = 180,
  minY,
  maxY,
}) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No telemetry readings recorded for this window.</div>;
  }

  // Determine min and max Y values
  let valMin = minY !== undefined ? minY : Infinity;
  let valMax = maxY !== undefined ? maxY : -Infinity;

  data.forEach((d) => {
    dataKeys.forEach((k) => {
      const v = d[k];
      if (v != null) {
        if (v < valMin) valMin = v;
        if (v > valMax) valMax = v;
      }
    });
  });

  if (valMin === Infinity) valMin = 0;
  if (valMax === -Infinity) valMax = 100;
  if (valMin === valMax) {
    valMin = Math.max(0, valMin - 10);
    valMax = valMax + 10;
  }

  // Add 10% padding to bounds
  const range = valMax - valMin || 1;
  const chartMin = Math.max(0, valMin - range * 0.08);
  const chartMax = valMax + range * 0.08;
  const chartRange = chartMax - chartMin;

  const width = 560;
  const paddingLeft = 46;
  const paddingRight = 16;
  const paddingTop = 16;
  const paddingBottom = 28;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  function getX(index) {
    if (data.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  }

  function getY(value) {
    return paddingTop + plotHeight - ((value - chartMin) / chartRange) * plotHeight;
  }

  // Generate paths for each key
  const paths = dataKeys.map((key) => {
    return data
      .map((d, i) => {
        const x = getX(i);
        const y = getY(d[key] ?? chartMin);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  });

  // Sample horizontal gridlines
  const yTicks = [
    chartMin,
    chartMin + chartRange * 0.5,
    chartMax,
  ];

  // Sample X labels (first, middle, last)
  const xLabels = [
    { text: data[0]?.timestamp || '', x: paddingLeft },
    { text: data[Math.floor(data.length / 2)]?.timestamp || '', x: paddingLeft + plotWidth / 2 },
    { text: data[data.length - 1]?.timestamp || '', x: paddingLeft + plotWidth },
  ];

  return (
    <div className="svg-chart-wrapper">
      <div className="chart-legend">
        {dataKeys.map((k, idx) => (
          <div key={k} className="legend-item">
            <span className="legend-swatch" style={{ background: colors[idx] }} />
            <span>{labels[idx] || k}</span>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart" preserveAspectRatio="none">
        {/* Grid lines & Y tick labels */}
        {yTicks.map((tickVal, idx) => {
          const y = getY(tickVal);
          return (
            <g key={idx} className="chart-grid-row">
              <line
                x1={paddingLeft}
                y1={y}
                x2={paddingLeft + plotWidth}
                y2={y}
                stroke="rgba(0,0,0,0.08)"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="#6B7280"
              >
                {tickVal.toFixed(0)} {idx === yTicks.length - 1 ? yUnit : ''}
              </text>
            </g>
          );
        })}

        {/* Polylines for data */}
        {paths.map((p, idx) => (
          <path
            key={idx}
            d={p}
            fill="none"
            stroke={colors[idx]}
            strokeWidth={idx === 0 ? 2 : 1.5}
            strokeDasharray={idx === 1 ? '4 2' : undefined}
          />
        ))}

        {/* X axis baseline */}
        <line
          x1={paddingLeft}
          y1={paddingTop + plotHeight}
          x2={paddingLeft + plotWidth}
          y2={paddingTop + plotHeight}
          stroke="rgba(0,0,0,0.18)"
        />

        {/* X labels */}
        {xLabels.map((lbl, idx) => (
          <text
            key={idx}
            x={lbl.x}
            y={height - 8}
            textAnchor={idx === 0 ? 'start' : idx === 2 ? 'end' : 'middle'}
            fontSize="10"
            fill="#6B7280"
          >
            {lbl.text}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function BedCharts({ bedId: initialBedId = '1' }) {
  const [selectedBed, setSelectedBed] = useState(String(initialBedId));
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    api.getBedReadings(selectedBed)
      .then((data) => {
        if (active) {
          setReadings(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to fetch readings');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedBed]);

  return (
    <div className="bed-charts-container">
      {/* Bed Selector Tabs */}
      <div className="charts-bed-selector">
        <button
          type="button"
          className={`btn-selector ${selectedBed === '1' ? 'active' : ''}`}
          onClick={() => setSelectedBed('1')}
        >
          Bed 1 Telemetry (Channel 1)
        </button>
        <button
          type="button"
          className={`btn-selector ${selectedBed === '2' ? 'active' : ''}`}
          onClick={() => setSelectedBed('2')}
        >
          Bed 2 Telemetry (Channel 2)
        </button>
      </div>

      {loading && (
        <div className="chart-loading-indicator">Loading time-series stream…</div>
      )}

      {error && (
        <div className="chart-error-banner">Error loading readings: {error}</div>
      )}

      {!loading && !error && (
        <div className="charts-pair-grid">
          {/* Chart 1: Weight vs Time */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h4>1. Weight vs Time</h4>
              <span className="badge-adapter">Data Adapter Filtered</span>
            </div>
            <p className="chart-description">
              Displays raw load-cell response (dashed) vs backend-filtered signal (solid).
            </p>
            <SimpleLineChart
              data={readings}
              dataKeys={['filteredWeight', 'weight']}
              colors={['#0E7C7B', '#8FA8A7']}
              labels={['Filtered Weight (g)', 'Raw Weight (g)']}
              yUnit="g"
              height={190}
            />
          </div>

          {/* Chart 2: Flow Rate vs Time */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h4>2. Flow Rate vs Time</h4>
              <span className="badge-adapter">Derivative Derived</span>
            </div>
            <p className="chart-description">
              Computed mass delta slope over time (\(-dm/dt\)) converted to mL/hr.
            </p>
            <SimpleLineChart
              data={readings}
              dataKeys={['flowRate']}
              colors={['#2A6F97']}
              labels={['Flow Rate (mL/hr)']}
              yUnit="mL/hr"
              height={190}
            />
          </div>
        </div>
      )}
    </div>
  );
}
