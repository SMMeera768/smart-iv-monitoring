# Rule Engine & State Machine
## Primary IV Workflow Event Rules

The Spring Boot backend acts as the central deterministic system of record for IV infusion events.

### Rule Hierarchy & Priority
When multiple rules trigger concurrently, the engine resolves states in deterministic precedence:
1. **Sensor Failure Check**: If sensor status is `POSSIBLE_SENSOR_FAILURE`, infusion classification is inhibited to prevent false alarms.
2. **Bag Replacement Transition**: Confirms large positive mass jumps.
3. **Flow Interruption Rule**: Confirms sustained near-zero flow conditions.
4. **Low Volume Rule**: Evaluates remaining bag volume percentage (can coexist as secondary flag).
5. **Normal Flow Rule**: Default operating state.

---

### Rule 1: Normal Flow
- **Conditions**:
  - Weight slope is negative ($\le -0.1\text{ g/min}$).
  - Smoothed flow is within configured operational boundaries ($0.5\text{ to }25.0\text{ g/min}$).
  - No persistent interruption or sensor abnormality.
- **Action**: Event status resolves to `NORMAL_FLOW`. Open active alerts for this bed are automatically marked `RESOLVED`.

---

### Rule 2: Flow Interruption
- **Conditions**:
  - Smoothed flow drops below threshold ($\le 0.5\text{ g/min}$).
  - Remaining volume $> 0$ (bag is not empty).
  - Condition persists continuously for at least `flow-interruption-min-duration-ms` ($120\text{ seconds}$).
- **Action**: Event confirmed as `FLOW_INTERRUPTION`. Single active alert generated. Open event duration tracked continuously.

---

### Rule 3: Low Volume
- **Conditions**:
  - Calculated percent remaining $\le 15.0\%$.
  - Measurement validity confirmed.
- **Action**: If coexisting with another primary event, raises secondary alert. Otherwise classifies as `LOW_VOLUME`.

---

### Rule 4: Bag Replacement
- **Conditions**:
  - Instantaneous filtered weight jump $> +50.0\text{ g}$.
  - Post-jump signal variance remains stable for $\ge 30\text{ seconds}$.
- **Action**: Event classified as `BAG_REPLACEMENT`. Closes active bag session, initializes new bag baseline, resets cumulative volume metrics.
