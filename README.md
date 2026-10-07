# 🌱 Smart Irrigation — Intelligent Irrigation & Streaming Analytics

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Apache%20Spark-3.5-E25A1C?style=for-the-badge&logo=apachespark&logoColor=white" alt="Apache Spark" />
  <img src="https://img.shields.io/badge/Apache%20Kafka-Latest-231F20?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Apache Kafka" />
  <img src="https://img.shields.io/badge/Scikit--Learn-1.4%2B-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

---

## 📖 Présentation

**Smart Irrigation** est une plateforme décisionnelle complète pour l'agriculture de précision. Elle combine l'**Intelligence Artificielle**, le traitement de flux massifs en temps réel (**Big Data & Streaming**) et une application web moderne pour surveiller le stress hydrique des cultures et optimiser les apports en eau.

Le système propose deux modes de fonctionnement complémentaires :
1. **Mode Interactif / Web :** Saisie manuelle via une interface React sécurisée pour obtenir des prédictions et recommandations immédiates.
2. **Mode Streaming Temps Réel IoT :** Ingestion continue de télémétries de capteurs agricoles via **Apache Kafka**, traitement et inférence en continu par **Apache Spark (Structured Streaming)**, et persistance automatique pour restitution dynamique sur le tableau de bord.

---

## 📋 Table des Matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture Globale](#️-architecture-globale)
- [🌊 Pipeline Spark Streaming & Kafka](#-pipeline-spark-streaming--kafka)
- [🧠 Modèle de Machine Learning](#-modèle-de-machine-learning)
- [⚙️ Stack Technologique](#️-stack-technologique)
- [📂 Structure du Projet](#-structure-du-projet)
- [🔌 API REST FastAPI](#-api-rest-fastapi)
- [🚀 Guide d'Installation et d'Exécution](#-guide-dinstallation-et-dexécution)
- [📈 Performances des Modèles](#-performances-des-modèles)
- [👨‍💻 Auteur](#-auteur)

---

## ✨ Fonctionnalités

- 🌾 **Estimation du Stress Hydrique :** Calcul précis de l'indice de stress hydrique (0 à 100%) basé sur la température, la pluviométrie, l'humidité du sol et le type de culture (Blé, Maïs, Riz, Soja, Tomate, Pomme de terre, etc.).
- 💧 **Recommandations d'Irrigation Intelligentes :** 
  - Volume d'eau requis ($L/m^2$)
  - Fréquence d'arrosage optimale (en jours)
  - Niveau d'alerte (Faible, Modéré, Élevé, Critique)
  - Conseils agronomiques personnalisés.
- 📡 **Générateur & Ingestion IoT :** Simulateur de capteurs agricoles multi-parcelles (`iot_producer.py`) envoyant des mesures aléatoires réalistes vers Kafka.
- ⚡ **Spark Structured Streaming :** Traitement de flux distribué en micro-lots, encodage et inférence ML en direct avec sauvegarde automatique en base de données.
- 📊 **Dashboard Temps Réel :** Visualisation interactive avec rafraîchissement automatique (Auto-refresh), métriques clés, graphiques d'évolution et historique des parcelles.
- 🔐 **Authentification & Gestion Utilisateurs :** Inscription, connexion, tokens de session sécurisés et historique des prédictions par utilisateur.

---

## 🏗️ Architecture Globale

```text
 ┌────────────────────────────────────────────────────────┐
 │                   CAPTEURS IOT (SIMULÉS)               │
 │               backend/streaming/iot_producer.py        │
 └───────────────────────────┬────────────────────────────┘
                             │ Flux JSON (T°, Pluie, Humidité, Culture)
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │                    APACHE KAFKA                        │
 │              Topic: "irrigation_sensors"               │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │            APACHE SPARK STRUCTURED STREAMING           │
 │             backend/streaming/spark_processor.py       │
 │  - Parse JSON & Schéma strict                          │
 │  - Inférence ML (Random Forest - model.pkl)            │
 │  - Calcul de la recommandation d'eau ($L/m^2$, jours)  │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼ Sauvegarde
 ┌────────────────────────────────────────────────────────┐
 │                BASE DE DONNÉES SQLITE                  │
 │                 backend/irrigation.db                  │
 └─────────────┬────────────────────────────┬─────────────┘
               │                            │
               ▼                            ▼
 ┌───────────────────────────┐  ┌─────────────────────────┐
 │       API FASTAPI         │  │     FRONTEND REACT      │
 │    backend/api/main.py    │◄─┼─  Tableau de Bord Live  │
 │  - Prédiction interactive │  │  - Historique & Alertes │
 │  - Auth & Historique      │  │  - Graphiques & KPIs    │
 └───────────────────────────┘  └─────────────────────────┘
```

---

## 🌊 Pipeline Spark Streaming & Kafka

Le module streaming est conçu pour être scalable et résilient :

1. **`iot_producer.py` :** Simule un réseau de stations météorologiques et sondes de sol agricoles, puis publie les payloads vers Kafka.
2. **`spark_processor.py` :** 
   - Souscrit au topic `irrigation_sensors`.
   - Traite les flux en micro-batches avec `readStream` / `writeStream`.
   - Applique le modèle Scikit-Learn `Random Forest` sur chaque enregistrement.
   - Persiste les résultats dans la table `predictions` de SQLite et journalise les alertes dans la console en direct.

---

## 🧠 Modèle de Machine Learning

Les modèles ont été entraînés et évalués sur un jeu de données agronomiques représentatif :

- **Features d'entrée :** `temperature`, `rainfall`, `soil_moisture`, `crop_type`
- **Cible :** `water_stress` (%)

### Comparaison des modèles

| Modèle | MAE (Mean Absolute Error) | $R^2$ Score | Statut |
| :--- | :---: | :---: | :---: |
| **Linear Regression** | 2.476 | 0.969 | Écarté |
| **Decision Tree Regressor** | 2.818 | 0.964 | Écarté |
| ⭐ **Random Forest Regressor** | **2.039** | **0.983** | **Retenu & Déployé** |

Le modèle Random Forest a été sérialisé avec `joblib` dans `backend/model.pkl` avec son encodeur de cultures (`crop_encoder`).

---

## ⚙️ Stack Technologique

| Domaine | Technologies |
| :--- | :--- |
| **Big Data & Streaming** | Apache Spark (PySpark), Apache Kafka, Docker Compose |
| **Machine Learning** | Scikit-Learn, NumPy, Pandas, Joblib |
| **Backend API** | FastAPI, Uvicorn, SQLite3, Pydantic |
| **Frontend Web** | React 18, Vite, Axios, Modern Vanilla CSS / Flexbox & Grid |

---

## 📂 Structure du Projet

```text
smart_irrigation/
│
├── docker-compose.yml              # Service Apache Kafka (KRaft mode)
├── README.md                       # Documentation générale
│
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   └── main.py                 # API FastAPI (Auth, Predict, History)
│   ├── dataset/                    # Jeux de données d'entraînement
│   ├── models/                     # Scripts de modélisation et d'évaluation
│   ├── streaming/                  # 🌊 Pipeline Big Data & Streaming
│   │   ├── README.md               # Guide dédié au streaming
│   │   ├── iot_producer.py         # Producteur Kafka simulant les capteurs
│   │   └── spark_processor.py      # Traitement Spark Streaming + Inférence ML
│   ├── model.pkl                   # Modèle Random Forest sérialisé
│   ├── irrigation.db               # Base SQLite (utilisateurs, sessions, prédictions)
│   └── requirements.txt            # Dépendances Python
│
└── Frentend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                 # Routage principal
        ├── pages/
        │   ├── Home.jsx            # Page d'accueil
        │   ├── Dashboard.jsx       # 📊 Tableau de bord live avec auto-refresh
        │   ├── Predict.jsx         # Formulaire de prédiction manuelle
        │   ├── Login.jsx           # Connexion
        │   ├── Signup.jsx          # Inscription
        │   └── Profile.jsx         # Profil utilisateur
        ├── components/             # Composants réutilisables (Navbar, Cards, etc.)
        └── services/               # Appels API et client Axios
```

---

## 🔌 API REST FastAPI

| Méthode | Endpoint | Description | Authentification |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/signup` | Inscription d'un nouvel utilisateur | Non |
| `POST` | `/auth/login` | Connexion et génération du token | Non |
| `GET` | `/auth/me` | Informations du profil connecté | Oui (Bearer) |
| `POST` | `/auth/logout` | Déconnexion et révocation de session | Oui (Bearer) |
| `POST` | `/predict` | Prédiction unitaire du stress hydrique | Oui (Bearer) |
| `GET` | `/predictions/history` | Historique des prédictions de l'utilisateur | Oui (Bearer) |

Documentation Swagger interactive : `http://localhost:8000/docs`

---

## 🚀 Guide d'Installation et d'Exécution

### 1. Prérequis
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Docker** (pour Kafka)
- **Java 8, 11 ou 17** (pour PySpark)

---

### 2. Démarrer Apache Kafka

À la racine du projet :
```bash
docker compose up -d
```
*Le broker Kafka démarre sur `localhost:9092`.*

---

### 3. Installer et Lancer le Backend FastAPI

```bash
cd backend
python -m venv venv

# Activation (Windows)
venv\Scripts\activate
# Activation (Linux / Mac)
# source venv/bin/activate

pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

---

### 4. Lancer le Pipeline Spark & Capteurs IoT

Ouvrez **deux terminaux supplémentaires** :

#### Terminal A — Processeur Spark Streaming :
```bash
cd backend
python streaming/spark_processor.py
```

#### Terminal B — Producteur IoT (Capteurs) :
```bash
cd backend
python streaming/iot_producer.py --interval 2.0
```

> **Options du producteur IoT :**
> - `--interval 1.5` : Intervalle d'envoi (secondes).
> - `--user-id 1` : ID utilisateur pour l'attribution dans le Dashboard.
> - `--max-messages 100` : Limite de messages (défaut : 0 = infini).

---

### 5. Lancer l'Application Frontend (React)

Dans un nouveau terminal :
```bash
cd Frentend
npm install
npm run dev
```

Ouvrez votre navigateur sur : `http://localhost:5173`

---

## 📈 Performances des Modèles

```text
    ┌──────────────────────────┬──────────┬──────────┐
    │ Modèle                   │   MAE    │ R² Score │
    ├──────────────────────────┼──────────┼──────────┤
    │ Linear Regression        │  2.476   │  0.969   │
    │ Decision Tree            │  2.818   │  0.964   │
    │ ⭐ Random Forest         │  2.039   │  0.983   │
    └──────────────────────────┴──────────┴──────────┘
```

---

## 👨‍💻 Auteur

**Mohamed Mimoune**  
*Étudiant Ingénieur en Informatique — Spécialisation Data Science, Big Data & IA*

- **GitHub :** [@moun-13](https://github.com/moun-13)
- **LinkedIn :** [Profil LinkedIn](https://bit.ly/44mMHAu)

---

⭐ *Si ce projet vous est utile, n'hésitez pas à lui attribuer une étoile sur GitHub !*
