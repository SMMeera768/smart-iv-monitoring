# Experimental Test Logs & Benchtop Scenarios

This directory stores experimental ground-truth logs from benchtop tests with the ESP32 and dual load-cell rig.

### Benchtop Scenario Structure
- `experimentRunId`: Unique UUID for each physical testing trial.
- `bedId`: `BED_1` or `BED_2`.
- `actualEvent`: Ground truth (`NORMAL_FLOW`, `INDUCED_FLOW_INTERRUPTION`, `LOW_VOLUME`, `BAG_REPLACEMENT`, `INDUCED_SENSOR_DRIFT`, `SENSOR_DISCONNECT`).
- `eventStartTime`: Wall clock timestamp when the physical action occurred (e.g. roller clamp closed).
- `eventEndTime`: Timestamp when the physical state was released (e.g. roller clamp reopened).
- `operator`: Name of researcher conducting trial.
- `notes`: Specific hardware conditions, bag initial volume, fluid type (saline demo fluid).
