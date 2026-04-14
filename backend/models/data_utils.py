"""Load irrigation dataset and build feature matrix + crop encoder."""
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder

DATA_PATH = Path(__file__).resolve().parent.parent / "dataset" / "dataset.csv"
CROP_ORDER = ["Wheat", "Corn", "Rice", "Soybeans", "Cotton", "Tomatoes"]


def load_xy():
    df = pd.read_csv(DATA_PATH)
    le = LabelEncoder()
    le.fit(CROP_ORDER)
    df = df[df["crop_type"].isin(CROP_ORDER)].copy()
    X = np.column_stack(
        [
            df["temperature"].astype(float).values,
            df["rainfall"].astype(float).values,
            df["soil_moisture"].astype(float).values,
            le.transform(df["crop_type"]),
        ]
    )
    y = df["water_stress"].astype(float).values
    return X, y, le
