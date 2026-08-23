# SpecKit: KrishiSetu AI Specification

## 1. Executive Summary
- **Project Name**: KrishiSetu AI (`krishisetu-ai`)
- **Hackathon Track**: Track 4 – Agricultural Intelligence
- **Theme**: Cooperation & Digital Public Infrastructure (DPI)
- **Target Audience**: Small & marginal farmers across India, state agricultural extension boards.

## 2. Core Functional Requirements
### 2.1 Multilingual Crop Diagnostic Co-Pilot
- **Input**: Live camera feed / photo scan OR audio/text query in regional dialects (Odia, Hindi, Marathi, Tamil, Telugu, Punjabi).
- **Output**: JSON payload containing `crop_name`, `disease_name`, `confidence`, `severity`, `organic_remedy`, `chemical_remedy`, `regenerative_advice`.

### 2.2 3-Tier AI Diagnostic Engine
- **Tier 1 (Cloud Multimodal)**: Google AI Studio Gemini 2.5/3.0 Flash API for deep cloud diagnostics.
- **Tier 2 (In-Browser Persistent On-Device Model)**: Device storage persistence (`indexeddb://krishisetu-model`) allowing farmers to run camera vision 100% offline.
- **Tier 3 (Zero Download Lookup)**: Bundled local JSON symptom database (`src/data/offline_diseases.json`).

### 2.3 Cross-State Cooperation Grid (DPI Standard)
- **Input**: District-level disease detection logs.
- **Output**: Broadcast JSON-LD outbreak vector alerts to adjacent state nodes (Odisha 🤝 Andhra Pradesh 🤝 West Bengal 🤝 Punjab 🤝 Maharashtra 🤝 Tamil Nadu).
