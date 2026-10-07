"""
IoT Sensor Data Producer (Kafka)
Simulates agricultural IoT sensors sending environmental measurements continuously.
"""
import argparse
import json
import random
import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path
from kafka import KafkaProducer

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "irrigation.db"

CROP_TYPES = ["Wheat", "Corn", "Rice", "Soybeans", "Cotton", "Tomatoes"]
SENSOR_IDS = ["SENSOR-01", "SENSOR-02", "SENSOR-03", "SENSOR-04", "SENSOR-05"]

# Realistic ranges for sensor readings
RANGES = {
    "temperature": (18.0, 42.0),     # in °C
    "rainfall": (0.0, 45.0),          # in mm
    "soil_moisture": (15.0, 85.0),    # in %
}


def get_latest_user_id() -> int:
    """Finds the most recently registered user in SQLite."""
    try:
        if DB_PATH.is_file():
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT id FROM users ORDER BY id DESC LIMIT 1")
            row = cur.fetchone()
            conn.close()
            if row and row[0]:
                return int(row[0])
    except Exception:
        pass
    return 1


def generate_sensor_payload(sensor_id: str = None, user_id: int = None) -> dict:
    """Generates a single synthetic sensor observation."""
    crop = random.choice(CROP_TYPES)
    temp = round(random.uniform(*RANGES["temperature"]), 1)
    rain = round(random.uniform(*RANGES["rainfall"]), 1)
    moisture = round(random.uniform(*RANGES["soil_moisture"]), 1)
    sid = sensor_id or random.choice(SENSOR_IDS)
    uid = user_id if user_id is not None else get_latest_user_id()

    # Add realistic environmental correlation
    if rain > 20:
        moisture = min(95.0, round(moisture + random.uniform(5.0, 15.0), 1))
    if temp > 35:
        moisture = max(5.0, round(moisture - random.uniform(5.0, 15.0), 1))

    return {
        "sensor_id": sid,
        "user_id": uid,
        "crop_type": crop,
        "temperature": temp,
        "rainfall": rain,
        "soil_moisture": moisture,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def run_producer(
    broker: str = "localhost:9092",
    topic: str = "irrigation_sensors",
    interval: float = 2.0,
    user_id: int = None,
    max_messages: int = 0,
):
    print(f"Connecting to Kafka Broker at {broker}...")
    producer = KafkaProducer(
        bootstrap_servers=[broker],
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        acks="all",
        retries=3,
    )

    target_user_id = user_id if user_id is not None else get_latest_user_id()
    print(f"Streaming IoT data for User ID #{target_user_id} to topic '{topic}' every {interval}s (Ctrl+C to stop)...")
    count = 0

    try:
        while True:
            # Refresh target user ID in case a new user registered
            current_uid = user_id if user_id is not None else get_latest_user_id()
            payload = generate_sensor_payload(user_id=current_uid)
            producer.send(topic, value=payload)
            producer.flush()
            count += 1
            print(
                f"[{count}] Sent: User={payload['user_id']} | "
                f"Sensor={payload['sensor_id']} | "
                f"Crop={payload['crop_type']} | "
                f"Temp={payload['temperature']}°C | "
                f"Rain={payload['rainfall']}mm | "
                f"Moisture={payload['soil_moisture']}%"
            )

            if 0 < max_messages <= count:
                print(f"Reached maximum requested messages ({max_messages}). Exiting.")
                break

            time.sleep(interval)
    except KeyboardInterrupt:
        print("IoT Producer stopped by user.")
    finally:
        producer.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Smart Irrigation IoT Kafka Producer")
    parser.add_argument("--broker", default="localhost:9092", help="Kafka broker host:port")
    parser.add_argument("--topic", default="irrigation_sensors", help="Kafka topic name")
    parser.add_argument("--interval", type=float, default=2.0, help="Interval between messages in seconds")
    parser.add_argument("--user-id", type=int, default=None, help="Associated user ID (default: auto-detect latest user)")
    parser.add_argument("--max-messages", type=int, default=0, help="Max messages to send (0 = infinite)")

    args = parser.parse_args()
    run_producer(
        broker=args.broker,
        topic=args.topic,
        interval=args.interval,
        user_id=args.user_id,
        max_messages=args.max_messages,
    )
