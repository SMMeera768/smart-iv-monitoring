import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

/**
 * SMART MULTI-BED IV WORKFLOW & EVENT MONITORING PLATFORM
 * ResearchPerformancePanel Component
 *
 * SPECIFICATION REQUIREMENT (Section 11 & 35):
 * DO NOT hard-code fake experimental results (e.g. 96.2% accuracy, 0.42g MAE).
 * For now, all experimental benchmark metrics must show:
 * "Awaiting experimental data" / "No experimental results available."
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

  const benchmarkItems = [
    { key: 'accuracy', label: 'Classification Accuracy', unit: '%', desc: 'Event state classification over verified infusion cycles.' },
    { key: 'precision', label: 'Precision (PPV)', unit: '%', desc: 'Positive predictive value for critical flow stoppage.' },
    { key: 'recall', label: 'Recall (Sensitivity)', unit: '%', desc: 'Sensitivity in capturing subtle occlusion events.' },
    { key: 'f1Score', label: 'F1 Score', unit: '', desc: 'Harmonic mean of precision and recall.' },
    { key: 'mae', label: 'Weight MAE', unit: 'g', desc: 'Mean Absolute Error against precision calibrated reference balance.' },
    { key: 'rmse', label: 'Weight RMSE', unit: 'g', desc: 'Root Mean Square Error capturing transient noise peaks.' },
    { key: 'flowRateMae', label: 'Flow Rate MAE', unit: 'mL/hr', desc: 'Error between numeric derivative and physical gravimetric flow.' },
    { key: 'detectionLatency', label: 'Detection Latency', unit: 'ms', desc: 'Median elapsed time from occlusion to alarm emission.' },
    { key: 'driftDetectionRate', label: 'AI Drift Detection Rate', unit: '%', desc: 'Isolation Forest accuracy on synthetic/real sensor drift.' },
  ];

  return (
    <div className="research-performance-container">
      <div className="panel-header-row">
        <div>
          <h2>Research Validation & Benchmark Metrics</h2>
          <p className="panel-subtitle">
            Scientific performance benchmarks awaiting completed two-bed physical experimental trials.
          </p>
        </div>
      </div>

      {/* Mandatory Research Integrity Alert */}
      <div className="research-integrity-banner">
        <div className="integrity-icon">🔬</div>
        <div className="integrity-text">
          <strong>Research Integrity Notice (Section 11 & 35)</strong>
          <p>
            No simulated or arbitrary numbers are presented as validated laboratory results.
            All experimental evaluation metrics will remain <em>"Awaiting experimental data"</em> until
            the independent hardware team completes physical load-cell testing, gravimetric flow experiments,
            and two-bed cross-talk trials.
          </p>
        </div>
      </div>

      {loading && <div className="loading-state">Loading metric definitions…</div>}

      {!loading && (
        <>
          {/* Benchmarks Grid */}
          <div className="benchmarks-cards-grid">
            {benchmarkItems.map((item) => (
              <div key={item.key} className="benchmark-card">
                <div className="bench-header">
                  <h4>{item.label}</h4>
                  <span className="pending-badge">Pending Hardware Validation</span>
                </div>
                <div className="bench-val-box">
                  <span className="bench-pending-text">
                    {metrics?.[item.key] || 'Awaiting experimental data'}
                  </span>
                </div>
                <p className="bench-desc">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Confusion Matrix Placeholder */}
          <div className="confusion-matrix-card">
            <div className="matrix-header">
              <h3>Confusion Matrix (Multi-Class Event Detection)</h3>
              <span className="pending-badge">Awaiting experimental data</span>
            </div>
            <p className="card-subtext">
              Target classes: NORMAL_FLOW, FLOW_INTERRUPTION, LOW_VOLUME, BAG_REPLACEMENT, SENSOR_DRIFT.
            </p>

            <div className="matrix-placeholder-box">
              <div className="matrix-placeholder-content">
                <span className="placeholder-icon">📊</span>
                <strong>No experimental results available</strong>
                <p>
                  Empirical confusion matrix will be rendered after collecting controlled trial recordings
                  from the physical dual-bed test rig.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
