# TechCycle — E-Waste Management & Recycling Intelligence Platform

[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TensorFlow / Keras](https://img.shields.io/badge/ML-MobileNetV2_%7C_Keras_3-FF6F00?logo=tensorflow&logoColor=white)](https://keras.io/)
[![Firebase](https://img.shields.io/badge/Auth_%26_DB-Firebase_v11-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

**TechCycle** is a full-stack sustainability platform engineered to address the global electronic waste crisis. Combining transfer learning computer vision, interactive recycling facility maps, an e-waste marketplace, and an AI advisory chatbot, TechCycle empowers consumers, businesses, and certified recyclers to divert hazardous components from landfills and recover valuable secondary raw materials.

---

## Overview & Problem Statement

Over 57 million metric tons of electronic waste are discarded annually, yet less than 20% is documented as formally collected and recycled. Discarded electronics contain hazardous heavy metals (lead, mercury, cadmium) that contaminate groundwater, alongside high-value precious metals (gold, copper, palladium) that can be reclaimed at fractions of the carbon cost of virgin mining.

**TechCycle bridges this gap by providing:**
1. **Instant Component Recognition:** An AI-powered vision scanner that classifies 36 distinct discrete electronics and PCB components from user-uploaded images and prescribes certified environmental handling directives.
2. **Circular Economy Marketplace:** A peer-to-peer exchange where working components, test gear, and repairable electronics can be listed, bought, or salvaged instead of dumped.
3. **Geo-Enabled Collection Hubs:** Interactive mapping to locate certified municipal drop-offs and verified e-waste recyclers.
4. **Intelligent Sustainability Assistant:** An integrated Google Gemini conversational agent trained on e-waste lifecycle guidance and disposal regulations.

---

## Key Features

### 🔍 AI Component Scanner (`/profile/awareness`)
- **Neural Image Classification:** Upload or drag-and-drop photos of circuit boards, semiconductors, passives, or power electronics.
- **36 Verified E-Waste Classes:** Distinguishes capacitors, microprocessors, relays, heatsinks, transformers, and ICs.
- **Safety Directives:** Generates contextual handling protocols (e.g., electrolyte hazards, battery extraction, precious metal refining).
- **Confidence Calibration:** Real-time visual confidence metrics with automatic low-confidence warnings below 40%.

### 🛒 Circular Marketplace (`/profile/info`)
- Browse, search, filter, and sort refurbished electronics by category, price, and condition.
- List devices for sale or salvage with image upload support.
- User wishlists, direct messaging to sellers, and real-time listing management.

### 🗺️ Geo-Location Recycling Locator (`/profile/map`)
- Integrated interactive maps displaying verified collection centers, hours, and accepted electronic waste streams.

### 🤖 Gemini-Powered E-Waste Assistant
- Built-in conversational AI answering queries regarding safe hazardous material handling, battery disposal, and e-waste policies.

### 🔐 Secure Identity & Cloud Database
- Multi-provider authentication (Email/Password and Google OAuth) powered by Firebase Auth.
- Idempotent user profile synchronization with Cloud Firestore (`users/{uid}`).
- Granular Firestore & Firebase Storage security rules enforcing document ownership.

---

## System Architecture

```mermaid
flowchart TD
    User([User / Browser])

    subgraph Frontend ["React 19 Client (Port 3000)"]
        UI[Navbar, Dashboard, Profile]
        Scanner["AI Scanner Component"]
        AuthContext["AuthProvider (Firebase SDK)"]
    end

    subgraph Cloud ["Google Cloud / Firebase"]
        FirebaseAuth["Firebase Auth (Email/Pass & Google)"]
        Firestore["Cloud Firestore (users, marketplace, wishlist, messages)"]
        Storage["Firebase Storage (devices/ images)"]
        GeminiAPI["Google Gemini API (Chatbot)"]
    end

    subgraph Backend ["FastAPI Inference Server (Port 8000)"]
        API["FastAPI App (app.py)"]
        Predict["predict_component.py"]
        Model["MobileNetV2 (.keras / Keras 3.x)"]
        Labels["class_labels.json (36 classes)"]
    end

    User -->|Interacts| UI
    UI --> Scanner
    UI --> AuthContext
    AuthContext <-->|OAuth / Sessions| FirebaseAuth
    UI <-->|CRUD Operations| Firestore
    UI <-->|Image Uploads| Storage
    UI <-->|Prompts| GeminiAPI

    Scanner -->|POST /identify-ewaste (multipart/form-data)| API
    API --> Predict
    Predict --> Labels
    Predict --> Model
    Model -->|Probability Tensor| Predict
    Predict -->|{prediction, confidence, recycling_guide}| API
    API -->|JSON Response| Scanner
```

---

## Deep Learning Pipeline

- **Architecture:** Pretrained ImageNet MobileNetV2 backbone with a custom classification head (`GlobalAveragePooling2D` $\rightarrow$ `BatchNormalization` $\rightarrow$ `Dense(256, ReLU, L2)` $\rightarrow$ `Dropout(0.4)` $\rightarrow$ `Dense(36, Softmax)`).
- **Input Resolution:** $224 \times 224 \times 3$ RGB.
- **Normalization:** Standard MobileNetV2 feature scaling to range $[-1.0, 1.0]$:
  $$\text{pixel}_{\text{norm}} = \frac{\text{pixel}}{127.5} - 1.0$$
- **Training Strategy:** Two-phase transfer learning on Google Colab T4 GPU:
  1. *Phase 1 (Warmup):* Frozen backbone, Adam optimizer ($\eta = 10^{-3}$), 8 epochs.
  2. *Phase 2 (Fine-Tuning):* Top 30 convolutional layers unfrozen (`BatchNormalization` layers preserved frozen), Adam ($\eta = 10^{-5}$), 12 epochs.
- **Data Integrity:** Group-stratified 70/15/15 train/val/test split across 10,989 samples with SHA-256 deduplication to guarantee 0 data leakage.
- **Saved Model Format:** `backend/models/component_classifier.keras` (Keras 3 format, 25.8 MB).

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, React Router v7, Context API |
| **Styling & UI** | CSS Modules, Lucide React icons, FontAwesome |
| **Data Visualizations** | Recharts, Leaflet / React-Leaflet |
| **Client Auth & DB** | Firebase v11 (Authentication, Cloud Firestore, Cloud Storage) |
| **Inference Backend** | Python 3.11, FastAPI, Uvicorn, Pillow, NumPy |
| **Machine Learning** | TensorFlow 2.15, Keras 3.15, Scikit-Learn |
| **Generative AI** | Google Gemini API (`@google/generative-ai`) |

---

## Project Directory Structure

```text
TechCycle/
├── .env.example                     # Environment template for frontend
├── .gitignore                       # Root ignore rules (keeps models & secrets safe)
├── package.json                     # Frontend npm dependencies and scripts
├── firestore.rules                  # Security rules for Firestore collections
├── storage.rules                    # Security rules for Firebase Storage
├── ML_AUDIT.md                      # In-depth architectural ML audit
├── public/                          # Static assets and index.html
├── src/
│   ├── App.js                       # Top-level routing
│   ├── components/
│   │   ├── Awareness.js             # AI Scanner component
│   │   ├── Dashboard.js             # Sustainability analytics
│   │   ├── InnerDash.js             # User dashboard and news
│   │   ├── InnerDav.js              # Authenticated navigation bar
│   │   ├── Profile.js               # E-waste marketplace and listings
│   │   ├── RecyclingMap.js          # Interactive collection center map
│   │   ├── Chatbot.js               # Gemini e-waste assistant
│   │   └── auth/                    # Login and Registration components
│   ├── contexts/                    # AuthProvider context
│   ├── firebase/                    # Firebase initialization and auth helpers
│   ├── images/                      # Curated frontend imagery
│   └── styles/                      # Component stylesheets
└── backend/
    ├── app.py                       # FastAPI application (/health, /identify-ewaste)
    ├── predict_component.py         # MobileNetV2 inference and fallback engine
    ├── train_model.py               # Two-phase transfer learning training pipeline
    ├── dataset_utils.py             # Stratified hash-based dataset splitting
    ├── class_labels.json            # 36 electronic component classes and disposal guides
    ├── dataset_split.json           # Leak-free split manifest (10,989 items)
    ├── requirements.txt             # Lightweight API dependencies
    ├── requirements-ml.txt          # Complete ML requirements (TF, Keras 3, Pytest)
    ├── models/
    │   ├── component_classifier.keras # Active trained model weights
    │   ├── class_labels.json          # Mirrored class labels
    │   └── training_config.json       # Hyperparameters and evaluation metrics
    ├── reports/
    │   ├── dataset_audit.json         # SHA-256 duplicate and category breakdown
    │   └── test_evaluation_report.json# 36-class precision, recall, and F1 scores
    └── tests/
        └── test_ml_pipeline.py      # Automated pipeline validation test suite
```

---

## Prerequisites & Environment Setup

Ensure you have the following installed:
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher
- **Python:** 3.10 or 3.11 (Python 3.11 recommended for TensorFlow compatibility)
- **Git**

---

## Installation & Local Run Guide

### 1. Backend Setup (FastAPI & ML Inference)

Open a terminal window and navigate to the `backend/` directory:

```bash
cd backend

# Create a virtual environment using Python 3.11
python3.11 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements-ml.txt
pip install -r requirements.txt

# Run the automated tests to verify pipeline integrity
pytest tests/test_ml_pipeline.py -v

# Start the FastAPI server with auto-reload
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

The backend API will be available at:
- Service URL: `http://127.0.0.1:8000`
- Health Check: `http://127.0.0.1:8000/health`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup (React Application)

In a separate terminal window, return to the project root:

```bash
cd TechCycle

# Install NPM dependencies
npm install

Start the React development server:
```bash
npm start
```

The application will launch in your browser at `http://localhost:3000`.

---

## Testing & Quality Assurance

### ML Subsystem Test Suite
The backend contains comprehensive automated unit and integration tests under `backend/tests/test_ml_pipeline.py` verifying:
- Integrity of all 36 discrete component classes.
- Zero hash leakage across dataset splits.
- Strict input normalization within $[-1.0, 1.0]$.
- Resilient fallback handling when dependencies or weights are loading.

```bash
cd backend
source venv/bin/activate
pytest tests/test_ml_pipeline.py -v
```

### Production Build Validation
Verify that the React frontend builds without errors:
```bash
npm run build
```

---

## Security & Repository Safety

- **Model Weight Protection:** Large binary checkpoints (`*.keras`, `*.h5`, `*.weights.h5`) and training archives (`*.zip`) are ignored by `.gitignore` to keep git history lightweight and secure.
- **Environment Isolation:** Local configuration files (`.env`, `.env.local`, `.env.*.local`) are ignored by version control to avoid credential leaks.
- **Access Control:** Production-ready `firestore.rules` and `storage.rules` are checked into the repository, enforcing authenticated access and object-level ownership checks across user listings and wishlists.
