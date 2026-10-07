"""Train RF, Linear Regression, Decision Tree; pick best by test MAE; save backend/model.pkl."""
import sys
from pathlib import Path

_MODELS = Path(__file__).resolve().parent
if str(_MODELS) not in sys.path:
    sys.path.insert(0, str(_MODELS))

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor

from data_utils import load_xy

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "model.pkl"


def main():
    X, y, crop_encoder = load_xy()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    candidates = [
        (
            "RandomForest",
            RandomForestRegressor(n_estimators=120, random_state=42),
        ),
        ("LinearRegression", LinearRegression()),
        (
            "DecisionTree",
            DecisionTreeRegressor(max_depth=6, random_state=42),
        ),
    ]

    best = None
    best_mae = np.inf
    best_name = ""

    for name, est in candidates:
        est.fit(X_train, y_train)
        pred = est.predict(X_test)
        mae = mean_absolute_error(y_test, pred)
        r2 = r2_score(y_test, pred)
        print(f"{name:18} MAE: {mae:.3f}  R²: {r2:.3f}")
        if mae < best_mae:
            best_mae = mae
            best = est
            best_name = name

    print(f"\nBest (lowest MAE): {best_name}")
    joblib.dump({"model": best, "crop_encoder": crop_encoder}, OUT)
    print(f"Saved: {OUT}")


if __name__ == "__main__":
    main()
