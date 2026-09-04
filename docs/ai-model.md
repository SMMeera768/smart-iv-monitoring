# AI Sensor Health & Drift Model
## Lightweight Isolation Forest Architecture

### 1. Research Scope & Constraints
The AI component is restricted strictly to **Sensor Health & Behavioral Anomaly Detection**.
- It does **NOT** diagnose clinical problems.
- It does **NOT** classify low IV volume or normal infusion flow as its primary responsibility.
- It protects against sensor failure, mechanical drift, external disturbances, and electrical disconnection.

### 2. Model Architecture
- **Algorithm**: `scikit-learn` `IsolationForest`
- **Hyperparameters**:
  - `n_estimators`: 100
  - `contamination`: 0.05
  - `random_state`: 42
- **Input Features (Strict Canonical Order)**:
  1. `weightSlope`: Linear regression slope in grams/minute.
  2. `standardDeviation`: Rolling window standard deviation.
  3. `rollingVariance`: Rolling window variance.
  4. `signalNoise`: Standard deviation of difference between raw and filtered weight.
  5. `baselineDeviation`: Residual difference from adaptive reference baseline.
  6. `stuckSignalDuration`: Seconds elapsed with signal variance $< 10^{-5}$.

### 3. Anomaly Score Normalization
The raw Isolation Forest decision score is non-probabilistic. To produce a continuous $[0.0, 1.0]$ index without misleading reviewers, we apply a deterministic sigmoidal transformation:
$$\text{anomalyScore} = \frac{1}{1 + \exp(10.0 \times \text{raw\_decision\_score})}$$
- **Interpretation**: A value near $0.0$ represents normal operation. A value $> 0.60$ flags elevated behavioral irregularity. It is explicitly documented as a **normalized anomaly index**, not a probability.

### 4. Drift Score Formulation
To distinguish actual mechanical/thermal sensor baseline drift from real fluid loss, the drift service uses frozen experimental weights:
$$\text{driftScore} = 0.50 \times \min\left(1.0, \frac{|\text{baselineDeviation}|}{\text{tolerance}}\right) + 0.30 \times \text{anomalyScore} + 0.20 \times \text{slopeFactor}$$
If $\text{driftScore} \ge 0.50$, the system reports `POSSIBLE_DRIFT`.

### 5. Resilient Fallback Handling
If the Python microservice is offline or encounters an HTTP timeout ($> 5000\text{ ms}$):
- Spring Boot records `sensorStatus = AI_UNAVAILABLE`.
- Ingestion, moving average filtering, and rule-based event detection continue uninterrupted.
- System never crashes or blocks hospital telemetry due to an AI service outage.
