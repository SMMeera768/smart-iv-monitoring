# Signal Processing & Feature Extraction
## Mathematical Specifications for IEEE Reproducibility

### 1. Moving Average Filter
For raw digital weight sample stream $W(t)$, the filtered value $\bar{W}(t)$ over window size $N$ is:
$$\bar{W}(t) = \frac{1}{N} \sum_{i=0}^{N-1} W(t - i)$$
- Configurable window parameter: `smartiv.signal.moving-average-window` (default $N=10$).
- When fewer than $N$ samples are present in memory, the filter flags a `warmingUp=true` state.

### 2. Flow Rate Estimation
Mass flow rate converts continuous mass loss into a positive flow quantity:
$$\text{flowRate}_{\text{instant}}(t) = -\frac{\bar{W}(t) - \bar{W}(t - \Delta t)}{\Delta t} \times 60000 \quad (\text{g/min})$$
Where $\Delta t$ is elapsed time in milliseconds.

The **Smoothed Flow Rate** is calculated as the rolling average of instantaneous flow values over $M$ samples:
$$\text{flowRate}_{\text{smoothed}}(t) = \frac{1}{M} \sum_{k=0}^{M-1} \text{flowRate}_{\text{instant}}(t - k)$$
- Configurable window parameter: `smartiv.signal.flow-smoothing-window` (default $M=5$).

### 3. Linear Regression Slope
The rate of weight change over the rolling window ($K$ points) is calculated using ordinary least squares:
$$\text{Slope} = \frac{\sum_{i=1}^K (t_i - \bar{t})(W_i - \bar{W})}{\sum_{i=1}^K (t_i - \bar{t})^2} \times 60000 \quad (\text{g/min})$$

### 4. Short-Term Signal Noise
Noise level represents high-frequency variance between raw and smoothed signals:
$$\text{Noise} = \sqrt{\frac{1}{K}\sum_{i=1}^K \left(W_{\text{raw}}(t_i) - W_{\text{filtered}}(t_i)\right)^2}$$

### 5. Adaptive Baseline
To distinguish gradual load-cell drift from normal IV infusion fluid loss, the baseline updates as an exponential moving average during stable, non-event periods:
$$\text{Baseline}(t) = \alpha \cdot \bar{W}(t) + (1 - \alpha) \cdot \text{Baseline}(t - 1)$$
$$\alpha = \frac{2}{\text{baselineWindow} + 1}$$
When a major transition occurs (e.g. Bag Replacement), the baseline is re-anchored.

### 6. Percent Volume Remaining
$$\text{PercentRemaining} = \left[ \frac{\bar{W}(t) - W_{\text{tare}}}{W_{\text{initial}} - W_{\text{tare}}} \right] \times 100\%$$
Clamped between $0.0\%$ and $100.0\%$.
