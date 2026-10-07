# 🌊 Smart Irrigation — Pipeline Spark Streaming & Kafka

Ce sous-système remplace la saisie manuelle par un **flux continu de données IoT générées aléatoirement** (capteurs météo et humidité du sol) traitées en temps réel par **Apache Spark** et enrichies par le modèle de Machine Learning.

---

## 🏗️ Architecture

```text
[iot_producer.py] ──(JSON)──> [Apache Kafka: irrigation_sensors] 
                                         │
                                         ▼
                             [spark_processor.py] (PySpark)
                                 - Inférence ML (model.pkl)
                                 - Recommandations d'arrosage
                                         │
                                         ▼
                            [SQLite: irrigation.db] & Console
```

---

## 🚀 Guide de Démarrage Rapide

### 1. Démarrer Apache Kafka & Zookeeper

Si vous utilisez Docker :
```bash
docker compose up -d
```

*(Ou démarrez votre serveur Kafka local sur `localhost:9092`)*

---

### 2. Installer les dépendances Python

```bash
cd backend
pip install -r requirements.txt
```

*(Nécessite également Java 8, 11 ou 17 installé sur la machine pour Spark & Kafka)*

---

### 3. Lancer le processeur Spark Streaming

Dans un premier terminal :
```bash
cd backend
python streaming/spark_processor.py
```

*Spark se connecte au topic Kafka `irrigation_sensors`, charge le modèle `model.pkl` et attend les micro-lots.*

---

### 4. Lancer le générateur de capteurs IoT (Producer)

Dans un second terminal :
```bash
cd backend
python streaming/iot_producer.py --interval 2.0
```

*Options disponibles pour le producteur :*
- `--interval 1.5` : Fréquence d'envoi des messages en secondes (défaut: 2.0s).
- `--user-id 1` : ID de l'utilisateur à associer dans la base de données.
- `--topic irrigation_sensors` : Nom du topic Kafka.
- `--max-messages 50` : Nombre max de messages à envoyer (0 = infini).

---

## 📊 Résultat en direct

Dès que le producteur envoie des données, le terminal Spark affiche en direct les prédictions :

```text
🌾 [SENSOR-02] Crop=Wheat    | Temp=34.2°C | Rain= 1.0mm | Moisture=22.4% => 🔴 Stress:  78.4% (HIGH)   | 💧 Water: 25.6 L/m² every 1d
🌾 [SENSOR-05] Crop=Corn     | Temp=24.1°C | Rain=18.5mm | Moisture=65.2% => 🟢 Stress:  21.3% (LOW)    | 💧 Water: 11.3 L/m² every 4d
💾 Successfully saved 2 predictions to SQLite database (irrigation.db).
```

Toutes les prédictions sont automatiquement sauvegardées dans la table `predictions` de [irrigation.db](file:///d:/smart_irrigation-main/smart_irrigation-main/backend/irrigation.db) et immédiatement visibles dans l'historique et le Dashboard React !
