# Baseline & Synthetic Research Datasets

This directory contains research datasets for training and testing the AI sensor-health layer and rule engine.

### Dataset Structure
- `synthetic_normal_baseline.csv`: Synthetic baseline recordings simulating unoccluded IV flow across multiple container volumes (100mL to 1000mL) with Gaussian sensor noise.
- `synthetic_induced_drift.csv`: Simulated thermal and mechanical load-cell creep.
- `synthetic_stuck_sensor.csv`: Simulated HX711 disconnection or bit-stuck ADC failures.

> [!NOTE]
> All synthetic datasets are explicitly labelled with metadata tag `SYNTHETIC_DATASET_RESULT` to maintain scientific integrity in conference publication. Real experimental data gathered from the physical test rig will be stored under separate run identifiers.
