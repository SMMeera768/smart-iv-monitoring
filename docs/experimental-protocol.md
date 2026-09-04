# Experimental Protocol & Reproducibility Guide
## Controlled Benchtop Validation for IEEE Research Paper

### 1. Experimental Objectives
1. **Flow Interruption Sensitivity**: Measure detection latency after manual tube clamping.
2. **Bag Replacement Resilience**: Verify state transitions upon swapping a depleted bag (e.g. 50g) with a full bag (e.g. 500g).
3. **Cross-Talk Verification**: Validate mechanical independence between Bed 1 and Bed 2 mounts on the same pole.
4. **AI Drift Detection**: Evaluate baseline deviation sensitivity under controlled mechanical/thermal drift.

---

### 2. Dual-Bed Cross-Talk Protocol
1. Suspend calibrated 500g water bag on Bed 1 (HX711_1).
2. Suspend calibrated 500g water bag on Bed 2 (HX711_2).
3. Keep Bed 2 undisturbed in stationary state.
4. Induce strong fluid tapping or flow variation on Bed 1.
5. Record Bed 2 weight reading deviation.
   - **Target**: Maximum cross-talk deviation $< 0.5\text{ g}$.
   - **Variance**: Baseline standard deviation on undisturbed channel remains $< 0.05\text{ g}$.
6. Repeat with Bed 1 stationary and Bed 2 manipulated.

---

### 3. Flow Interruption Scenario
1. Establish stable baseline infusion rate (e.g. $4.0\text{ g/min}$).
2. At timestamp $T_0$, close roller clamp completely.
3. Observe Spring Boot telemetry:
   - Instantaneous flow drops to $\approx 0.0\text{ g/min}$.
   - Event candidate timer activates.
   - At $T_0 + 120\text{ seconds}$, event status switches from candidate to confirmed `FLOW_INTERRUPTION`.
   - Alert generated with evidence score $\ge 85\%$.
4. Release clamp at $T_1$.
   - Confirm event automatically resolves to `NORMAL_FLOW`.
   - Active alert transitions to `RESOLVED`.

---

### 4. Induced Drift Evaluation Protocol
1. Induce slow mechanical creep or temperature deviation on Load Cell 1.
2. Measure time until Python AI service flags `POSSIBLE_DRIFT`.
3. Verify that normal bag weight reduction is NOT misclassified as sensor drift.
