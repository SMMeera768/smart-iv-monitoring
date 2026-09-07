import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * ResearchPerformancePanel Component
 *
 * Consumes ResearchMetricsResponse from GET /api/research/metrics.
 * STRICT COMPLIANCE (Section 10 & 35):
 * All metrics explicitly labelled as "Development/Synthetic data — not validated experimental results".
 * Physical laboratory values are marked "Awaiting experimental data".
 */

export default function ResearchPerformancePanel() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getResearchMetrics()
      .then((data) => {
        if (active) {
          setMetrics(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const benchmarkDefinitions = [
    { key: 'eventAccuracy', label: 'Event Classification Accuracy', unit: '%', desc: 'Accuracy in classifying normal flow, occlusion, low volume, and container changes.' },
    { key: 'eventPrecision', label: 'Precision (PPV)', unit: '%', desc: 'Positive predictive value for critical flow stoppage and occlusion.' },
    { key: 'eventRecall', label: 'Recall (Sensitivity)', unit: '%', desc: 'Sensitivity in detecting subtle occlusion and low-volume states.' },
    { key: 'eventF1Score', label: 'F1 Score', unit: '', desc: 'Harmonic mean of precision and recall over all event classes.' },
    { key: 'meanAbsoluteErrorWeightG', label: 'Mass Estimation MAE', unit: 'g', desc: 'Mean Absolute Error against precision reference balance.' },
    { key: 'rootMeanSquareErrorWeightG', label: 'Mass Estimation RMSE', unit: 'g', desc: 'Root Mean Square Error capturing high-frequency noise spikes.' },
    { key: 'flowRateMaeGPerMin', label: 'Flow Rate MAE', unit: 'g/min', desc: 'Error between numerical derivative flow and true gravimetric rate.' },
    { key: 'averageDetectionLatencyMs', label: 'Detection Latency', unit: 'ms', desc: 'Mean elapsed time from physical occlusion to alarm triggering.' },
    { key: 'aiDriftDetectionRate', label: 'AI Drift Detection Rate', unit: '%', desc: 'Isolation Forest accuracy in catching non-physiological baseline creep.' },
  ];

  return (
    <div className="research-performance-container">
      <div className="panel-header-row">
        <div>
          <h2>Research Validation &amp; Benchmark Metrics</h2>
          <p className="panel-subtitle">
            Scientific performance evaluation framework awaiting physical load-cell trial completion.
          </p>
        </div>

        <span className="source-tag">Status: Pre-Hardware Laboratory Phase</span>
      </div>

      {/* Mandatory Research Integrity Banner */}
      <div className="research-integrity-banner">
        <div className="integrity-icon">🔬</div>
        <div className="integrity-text">
          <strong>Research Integrity Notice (Section 10 &amp; 35)</strong>
          <p>
            {metrics?.disclaimer ||
              'Development/Synthetic data — not validated experimental results. All experimental evaluation metrics remain "Awaiting experimental data" until the hardware team completes benchtop testing and validated datasets are recorded.'}
          </p>
        </div>
      </div>

      {loading && <div className="loading-state">Loading research benchmark registers…</div>}

      {!loading && (
        <>
          {/* Benchmarks Grid */}
          <div className="benchmarks-cards-grid">
            {benchmarkDefinitions.map((item) => {
              const rawVal = metrics?.[item.key];
              const isNonZero = rawVal != null && Number(rawVal) > 0;

              return (
                <div key={item.key} className="benchmark-card">
                  <div className="bench-header">
                    <h4>{item.label}</h4>
                    <span className="pending-badge">Pending Laboratory Validation</span>
                  </div>

                  <div className="bench-val-box">
                    <span className="bench-pending-text">
                      {isNonZero
                        ? `${Number(rawVal).toFixed(2)} ${item.unit} (Development Baseline)`
                        : 'Awaiting experimental data'}
                    </span>
                  </div>

                  <p className="bench-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Confusion Matrix Section */}
          <div className="confusion-matrix-card">
            <div className="matrix-header">
              <h3>Multi-Class Event Confusion Matrix</h3>
              <span className="pending-badge">Awaiting experimental data</span>
            </div>
            <p className="card-subtext">
              Target event classes: <code>NORMAL_FLOW</code>, <code>FLOW_INTERRUPTION</code>, <code>LOW_VOLUME</code>, <code>BAG_REPLACEMENT</code>, <code>SENSOR_DRIFT</code>.
            </p>

            <div className="matrix-placeholder-box">
              <div className="matrix-placeholder-content">
                <span className="placeholder-icon">📊</span>
                <strong>Awaiting experimental data</strong>
                <p>
                  Empirical confusion matrix will be rendered after collecting controlled trial recordings
                  from the physical dual-bed load-cell rig. No synthetic matrix values are shown as real.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
