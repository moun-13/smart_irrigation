"""
PySpark Structured Streaming Consumer & ML Inference Pipeline.
Consumes IoT sensor data from Kafka, predicts water stress, and stores predictions in SQLite DB.
"""
import argparse
import os
import sqlite3
import sys
from pathlib import Path

import joblib
import numpy as np
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json
from pyspark.sql.types import (
    FloatType,
    IntegerType,
    StringType,
    StructField,
    StructType,
)

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "model.pkl"
DB_PATH = BASE_DIR / "irrigation.db"

# Schema of JSON incoming from Kafka
SENSOR_SCHEMA = StructType(
    [
        StructField("sensor_id", StringType(), True),
        StructField("user_id", IntegerType(), True),
        StructField("crop_type", StringType(), True),
        StructField("temperature", FloatType(), True),
        StructField("rainfall", FloatType(), True),
        StructField("soil_moisture", FloatType(), True),
        StructField("timestamp", StringType(), True),
    ]
)


def compute_recommendations(
    score: float, temperature: float, rainfall: float, soil_moisture: float
) -> tuple[str, float, int, str]:
    """Calculates stress level, recommended water (L/m2), frequency (days) and explanation."""
    if score >= 70:
        level = "high"
        frequency_days = 1
        level_reason = "severe stress"
    elif score >= 40:
        level = "medium"
        frequency_days = 2
        level_reason = "moderate stress"
    else:
        level = "low"
        frequency_days = 4
        level_reason = "low stress"

    recommended_water_l_m2 = round(max(5.0, min(35.0, 6.0 + (score * 0.25))), 1)
    moisture_state = "low" if soil_moisture < 40 else "adequate"
    rain_state = "low rainfall" if rainfall < 10 else "sufficient rainfall"
    temp_state = "high temperature" if temperature >= 30 else "moderate temperature"

    explanation = (
        f"Crop under {level_reason} due to {temp_state}, "
        f"{moisture_state} soil moisture, and {rain_state}."
    )
    return level, recommended_water_l_m2, frequency_days, explanation


def process_micro_batch(batch_df, batch_id):
    """Callback executed by Spark Structured Streaming on each micro-batch."""
    if batch_df.isEmpty():
        return

    print(f"\n==================== [Micro-Batch #{batch_id}] Processing ====================")
    pandas_df = batch_df.toPandas()

    if not MODEL_PATH.is_file():
        print(f"Error: Model artifact not found at {MODEL_PATH}")
        return

    # Load ML model and label encoder
    artifact = joblib.load(MODEL_PATH)
    model = artifact["model"]
    encoder = artifact["crop_encoder"]
    valid_classes = set(encoder.classes_)

    results_to_insert = []

    for _, row in pandas_df.iterrows():
        crop = str(row["crop_type"]).strip()
        if crop not in valid_classes:
            print(f"Warning: Unknown crop_type '{crop}', skipping row.")
            continue

        temp = float(row["temperature"])
        rain = float(row["rainfall"])
        moisture = float(row["soil_moisture"])
        user_id = int(row["user_id"]) if row["user_id"] is not None else 1
        created_at = str(row["timestamp"])
        sensor_id = str(row.get("sensor_id", "UNKNOWN"))

        crop_encoded = encoder.transform([crop])[0]
        feature_vector = np.array([[temp, rain, moisture, crop_encoded]], dtype=float)

        raw_pred = float(model.predict(feature_vector)[0])
        water_stress = round(max(0.0, min(100.0, raw_pred)), 2)

        stress_lvl, rec_water, freq_days, explanation = compute_recommendations(
            water_stress, temp, rain, moisture
        )

        results_to_insert.append(
            (
                user_id,
                temp,
                rain,
                moisture,
                crop,
                water_stress,
                stress_lvl,
                rec_water,
                freq_days,
                explanation,
                created_at,
            )
        )

        # Live console output
        stress_emoji = "🔴" if stress_lvl == "high" else ("🟡" if stress_lvl == "medium" else "🟢")
        print(
            f"[{sensor_id}] Crop={crop:<8} | Temp={temp:4.1f}°C | Rain={rain:4.1f}mm | "
            f"Moisture={moisture:4.1f}% => {stress_emoji} Stress: {water_stress:5.1f}% ({stress_lvl.upper()}) | "
            f"Water: {rec_water} L/m² every {freq_days}d"
        )

    # Insert into SQLite Database
    if results_to_insert:
        try:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.executemany(
                """
                INSERT INTO predictions (
                    user_id, temperature, rainfall, soil_moisture, crop_type,
                    water_stress, stress_level, recommended_water_l_m2,
                    irrigation_frequency_days, explanation, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                results_to_insert,
            )
            conn.commit()
            conn.close()
            print(f"Successfully saved {len(results_to_insert)} predictions to SQLite database ({DB_PATH.name}).")
        except Exception as e:
            print(f"Database error: {e}")


def main():
    parser = argparse.ArgumentParser(description="Smart Irrigation Spark Streaming Processor")
    parser.add_argument("--broker", default="localhost:9092", help="Kafka broker address")
    parser.add_argument("--topic", default="irrigation_sensors", help="Kafka topic to consume")
    args = parser.parse_args()

    print("Initializing Apache Spark Session with Kafka connector...")
    spark = (
        SparkSession.builder.appName("SmartIrrigationSparkProcessor")
        .config(
            "spark.jars.packages",
            "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0",
        )
        .master("local[*]")
        .getOrCreate()
    )

    spark.sparkContext.setLogLevel("WARN")

    print(f"Subscribing to Kafka topic '{args.topic}' from broker '{args.broker}'...")

    # Read stream from Kafka
    kafka_stream = (
        spark.readStream.format("kafka")
        .option("kafka.bootstrap.servers", args.broker)
        .option("subscribe", args.topic)
        .option("startingOffsets", "latest")
        .load()
    )

    # Parse JSON payload from Kafka 'value' column
    parsed_stream = (
        kafka_stream.selectExpr("CAST(value AS STRING) as json_payload")
        .select(from_json(col("json_payload"), SENSOR_SCHEMA).alias("data"))
        .select("data.*")
    )

    # Start streaming query and execute micro-batches
    query = (
        parsed_stream.writeStream.foreachBatch(process_micro_batch)
        .outputMode("update")
        .start()
    )

    print("Spark Streaming Pipeline is LIVE! Waiting for IoT messages...")
    try:
        query.awaitTermination()
    except KeyboardInterrupt:
        print("Stopping Spark Streaming Pipeline...")
        query.stop()
        spark.stop()


if __name__ == "__main__":
    main()
