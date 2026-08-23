# 🌾 KrishiSetu AI (krishisetu-ai)
> **Interoperable Digital Public Infrastructure (DPI) & Mobile PWA for Cooperative, Climate-Resilient Agriculture in India.**

---

## 🎯 The Problem
Small and marginal farmers across India lack access to data-driven agricultural guidance. Relying on traditional practices instead of satellite data, soil health analytics, and climate forecasting leads to crop failure and threatens food security. The absence of shared digital infrastructure also blocks cross-state collaboration on climate-resilient farming.

## 🚀 The Solution: KrishiSetu AI
**KrishiSetu AI** is a mobile-first Progressive Web App (PWA) and open Digital Public Good (DPG) engineered around two core pillars:

1. **Multilingual Farmer Co-Pilot (Mobile PWA)**: Real-time rear camera vision AI diagnostic tool powered by Google AI Studio (Gemini 2.5/3.0 Flash) and Speech/Translation APIs across Indian regional languages (Odia, Hindi, Marathi, Tamil, Telugu, Punjabi).
2. **Device-Persistent On-Device ML (IndexedDB)**: Features a 1-click **"Offline Model Manager"** that saves lightweight MobileNet vision models permanently into device storage (`indexeddb://krishisetu-model`) for **100% offline camera disease diagnostics** in zero-internet rural fields.
3. **Cross-State Interoperable Cooperation Grid (DPI Standard)**: Open JSON-LD telemetry protocol (`.speckit/dpi-spec.json`) connecting state agricultural boards (Odisha 🤝 Punjab 🤝 Maharashtra 🤝 Tamil Nadu 🤝 Andhra Pradesh 🤝 West Bengal) to exchange pest outbreak vectors and climate resilience models in real time.

---

## ✨ 3-Tier AI Diagnostic Engine Architecture
- **Tier 1 (Cloud)**: Google AI Studio Gemini Flash API for deep cloud diagnostics.
- **Tier 2 (On-Device Model)**: Persistent IndexedDB vision model cached on the phone for 100% offline mobile camera diagnostics.
- **Tier 3 (Zero Download)**: Bundled local JSON symptom lookup database (`src/data/offline_diseases.json`).

---

## 🛠️ Official Google AI Stack Integrations
- **Generative AI & Multimodal**: Google AI Studio Gemini API (`@google/genai`)
- **Speech & Translation**: Web Speech API / Google Cloud Speech-to-Text & Text-to-Speech
- **Geospatial & Climate**: Google Maps Platform + Open-Meteo / IMD & ISRO satellite indices
- **Datasets**: Data.gov.in, Agmarknet Mandi rates, ICAR knowledge base

---

## 🏃 Quick Start Instructions

```bash
# 1. Install dependencies
npm install

# 2. Add your Gemini API Key in .env (Copy from .env.example)
cp .env.example .env

# 3. Start local development server
npm run dev
```

Open `http://localhost:5173` on your computer or mobile browser!
