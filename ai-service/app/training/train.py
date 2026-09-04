import os
import json
import numpy as np
from datetime import datetime

FEATURE_NAMES = [
    "weightSlope",
    "standardDeviation",
    "rollingVariance",
    "signalNoise",
    "baselineDeviation",
    "stuckSignalDuration"
]

def generate_synthetic_normal_dataset(n_samples: int = 1500, random_state: int = 42) -> np.ndarray:
    """
    Generates synthetic normal baseline sensor readings for research prototype initialization.
    Clearly designated as SYNTHETIC DATASET RESULT.
    """
    rng = np.random.default_rng(random_state)

    # Normal IV decrease slope: -3.0 to -0.5 g/min
    slope = rng.normal(loc=-1.8, scale=0.4, size=(n_samples, 1))

    # Low standard deviation: ~0.05 to 0.25 g
    std = np.abs(rng.normal(loc=0.12, scale=0.04, size=(n_samples, 1)))

    # Rolling variance ~ std^2
    var = np.square(std) + rng.normal(loc=0.0, scale=0.002, size=(n_samples, 1))
    var = np.clip(var, 0.0001, None)

    # Signal noise ~ raw - filtered std
    noise = np.abs(rng.normal(loc=0.07, scale=0.02, size=(n_samples, 1)))

    # Baseline deviation ~ centered around 0.0 with small drift noise
    drift = rng.normal(loc=0.0, scale=0.15, size=(n_samples, 1))

    # Stuck signal duration ~ 0 during normal active infusion
    stuck = np.zeros((n_samples, 1), dtype=np.float64)

    X = np.hstack([slope, std, var, noise, drift, stuck])
    return X

def train_and_save(output_dir: str = None):
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
    os.makedirs(output_dir, exist_ok=True)

    print("Generating training dataset (normal sensor operation)...")
    X_train = generate_synthetic_normal_dataset(n_samples=2000, random_state=42)

    try:
        from sklearn.ensemble import IsolationForest
        from sklearn.preprocessing import StandardScaler
        import joblib

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_train)

        print("Fitting Isolation Forest (contamination=0.05)...")
        model = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_scaled)

        model_path = os.path.join(output_dir, "isolation_forest.joblib")
        scaler_path = os.path.join(output_dir, "scaler.joblib")
        metadata_path = os.path.join(output_dir, "metadata.json")

        joblib.dump(model, model_path)
        joblib.dump(scaler, scaler_path)

        metadata = {
            "modelVersion": "iforest-v1",
            "algorithm": "IsolationForest",
            "trainingDate": datetime.utcnow().isoformat() + "Z",
            "datasetType": "SYNTHETIC_PROTOTYPE_BASELINE",
            "sampleCount": len(X_train),
            "featureNames": FEATURE_NAMES,
            "contamination": 0.05,
            "randomState": 42
        }

        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        print(f"Successfully serialized model, scaler, and metadata to {output_dir}")

    except ImportError:
        print("scikit-learn or joblib not installed in environment. Generating fallback metadata.json...")
        metadata_path = os.path.join(output_dir, "metadata.json")
        metadata = {
            "modelVersion": "iforest-v1",
            "algorithm": "AnalyticalFallbackWrapper",
            "trainingDate": datetime.utcnow().isoformat() + "Z",
            "datasetType": "SYNTHETIC_PROTOTYPE_BASELINE",
            "featureNames": FEATURE_NAMES,
            "contamination": 0.05
        }
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

if __name__ == "__main__":
    train_and_save()
