<p align="center">

# 🌱 Smart Irrigation — Intelligent Irrigation Prediction System

### AI-Powered Full-Stack Web Application for Smart Irrigation Management

<p align="center">

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Latest-orange?style=for-the-badge&logo=scikitlearn)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)
![SQLite](https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite)

</p>

<p align="center">
Machine Learning • FastAPI • React • Random Forest • Data Science • Precision Agriculture

## 📖 Présentation

<p align="center">

Dans ce projet nous avons conçu un pipeline full-stack pour estimer le stress hydrique des cultures à partir de paramètres environnementaux.

Nous avons entraîné et comparé plusieurs modèles de Machine Learning (**Linear Regression**, **Decision Tree Regressor** et **Random Forest Regressor**) en utilisant la **Mean Absolute Error (MAE)** et le **coefficient de détermination (R²)** comme métriques d'évaluation.

Le **Random Forest Regressor** a obtenu les meilleures performances (**MAE ≈ 2.039** et **R² ≈ 0.983**), démontrant une meilleure précision et une excellente capacité de généralisation. Il a donc été retenu comme modèle final.

Le modèle est déployé au travers d'une **API FastAPI** et consommé par une interface **React**. Les utilisateurs authentifiés peuvent saisir les paramètres environnementaux, obtenir une prédiction du niveau de stress hydrique, recevoir des recommandations d'irrigation personnalisées et consulter l'historique de leurs prédictions.

</p>
---

## 📖 Table of Contents

- 🎯 About the Project
- 🚀 Features
- 🏗️ Project Architecture
- 🧠 Machine Learning Pipeline
- ⚙️ Technology Stack
- 📂 Project Structure
- 🔌 REST API
- 🚀 Getting Started
- 📈 Model Performance
- 👨‍💻 Author

---

# 🎯 About the Project

**Smart Irrigation** is an AI-powered decision support system designed to estimate the **water stress level of crops** and recommend optimal irrigation strategies.

The project combines:

- 🌾 Precision Agriculture
- 🤖 Machine Learning
- 📊 Data Analysis
- 🌐 Full-Stack Web Development

The prediction engine is based on a **Random Forest Regressor**, selected after comparing multiple machine learning algorithms.

---

# 🚀 Features

### 🌱 Crop Water Stress Prediction

Predicts the irrigation stress index using environmental parameters.

---

### 💧 Intelligent Irrigation Recommendation

Provides:

- Water quantity (L/m²)
- Irrigation frequency
- Stress level
- Recommendation

---

### 👤 User Authentication

- Register
- Login
- JWT Authentication
- User History

---

### 📈 Dashboard

Interactive dashboard displaying:

- Prediction history
- Water stress distribution
- Environmental statistics
- Performance indicators

---

### 🤖 Machine Learning

Comparison between:

- Linear Regression
- Decision Tree
- Random Forest

Random Forest was selected because it achieved the highest prediction accuracy.

---

# 🏗️ Project Architecture

```text
                React + Vite
                     │
                     │ REST API
                     ▼
             FastAPI Backend
                     │
         ┌───────────┴───────────┐
         │                       │
   Random Forest Model      SQLite Database
         │
         ▼
   Irrigation Prediction
```

---

# 🧠 Machine Learning Pipeline

Dataset

↓

Data Cleaning

↓

Feature Engineering

↓

Train/Test Split

↓

Model Training

↓

Model Evaluation

↓

Random Forest Selection

↓

Deployment with FastAPI

---

# ⚙️ Technology Stack

## Backend

- FastAPI
- Python
- Scikit-Learn
- Joblib
- SQLite

## Frontend

- React
- Vite
- Axios

## Machine Learning

- Random Forest
- Decision Tree
- Linear Regression

---

# 📂 Project Structure

```text
Smart-Irrigation/
│
├── backend/
│   ├── api/
│   ├── models/
│   ├── dataset/
│   ├── database/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── package.json
│
└── README.md
```

---

# 🔌 REST API

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /auth/signup | Register |
| POST | /auth/login | Login |
| GET | /auth/me | Current user |
| POST | /predict | Irrigation prediction |
| GET | /history | Prediction history |

Interactive documentation:

```
http://localhost:8000/docs
```

---

# 🚀 Installation

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn api.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📈 Model Performance

| Model | MAE | R² Score |
|-------|------|----------|
| Linear Regression | 2.476 | 0.969 |
| Decision Tree | 2.818 | 0.964 |
| ⭐ Random Forest | **2.039** | **0.983** |

Random Forest achieved the best predictive performance and was deployed in production.

---

# 👨‍💻 Author

**Mohamed Mimoune**

Engineering Student in Computer Science

- Artificial Intelligence
- Data Science
- Big Data
- Machine Learning

LinkedIn: https://bit.ly/44mMHAu

GitHub: https://github.com/moun-13

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and feel free to contribute!
