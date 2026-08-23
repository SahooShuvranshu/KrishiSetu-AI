<div align="center">
  <img src="public/sprout.svg" alt="Krishi Setu Logo" width="120" />
  <h1>Krishi Setu AI</h1>
  <p><strong>100% Offline AI Crop Pathologist & Regenerative Agronomy Grid</strong></p>
  
  <p>
    <a href="https://krishisetu-ai.onrender.com/"><img src="https://img.shields.io/badge/Live_App-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Live App" /></a>
    <a href="https://sahooshuvranshu.github.io/KrishiSetu-AI/"><img src="https://img.shields.io/badge/Landing_Page-GitHub_Pages-181717?style=for-the-badge&logo=github&logoColor=white" alt="Landing Page" /></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow.js" />
    <img src="https://img.shields.io/badge/Gemini_3.6_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
    <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>

  <p>
    <a href="SECURITY.md"><img src="https://img.shields.io/badge/Security-Protected-success?style=flat-square" alt="Security" /></a>
    <a href="CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Code_of_Conduct-Enforced-blue?style=flat-square" alt="Code of Conduct" /></a>
    <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome" /></a>
    <img src="https://img.shields.io/github/license/SahooShuvranshu/KrishiSetu-AI?style=flat-square" alt="License" />
  </p>
</div>

<br/>

## 🌾 The Crisis: Problem Statement 4 (Theme: Cooperation)

Small and marginal farmers across India lack access to data-driven agricultural guidance. Relying on traditional methods instead of satellite data, soil health analytics, and climate forecasting leads to crop failure and threatens food security. The absence of shared digital infrastructure also blocks cross-state collaboration on climate-resilient farming.

### 🚜 The Challenge
Build an interoperable digital agriculture network that delivers real-time, localised agro-advisories using AI. It should offer regenerative crop recommendations based on satellite data, soil health, and weather forecasting, plus a diagnostic tool for crop diseases, and be designed as a scalable digital public good enabling Indian states to share agricultural data models and strengthen cooperation on sustainable food production.

---

## ⚡ The Solution: Krishi Setu

**Krishi Setu** (Agriculture Bridge) is a heavy-duty, offline-first digital public good built to bridge the connectivity gap for Indian farmers. Utilizing industrial-grade Progressive Web App (PWA) architecture and Edge AI, it delivers state-of-the-art agricultural guidance directly to the farmer's pocket—even in the deepest rural fields with **zero internet connection**.

### 🌟 Key Features

* **100% Offline AI Disease Scanning:** Uses highly quantized MobileNet/TensorFlow.js models permanently cached in IndexedDB to scan and diagnose leaf diseases directly on the device's CPU/GPU. No cloud needed. No latency.
* **Generative Agronomy Engine:** Integrates Google's Gemini Flash to translate complex chemical and organic treatments into easy-to-understand native dialects.
* **Native Tongue & TTS Support:** Built-in localization for **Hindi** and **Odia** with Web Speech API integration to read remedies out loud for farmers facing literacy barriers.
* **DPI Telemetry Grid:** Utilizes OpenStreetMap (Leaflet) to build an interoperable mesh. When devices regain connection, anonymous disease outbreaks are broadcasted to the grid to warn neighboring farmers of migrating blights.
* **Agri-Brutalism UX:** Designed strictly for outdoor usability. Massive high-contrast buttons, thick borders, and heavy typography ensure readability under blinding sunlight and usability with muddy hands.

---

## 🧠 Machine Learning Architecture

Krishi Setu brings state-of-the-art computer vision directly to the edge. Instead of relying on cloud APIs which inevitably fail in low-connectivity rural areas, the entire diagnostic pipeline runs locally on the farmer's smartphone.

### 1. The Model (MobileNetV2 & Transfer Learning)
We utilize a highly optimized **MobileNetV2** architecture fine-tuned via Transfer Learning. MobileNet was chosen specifically for its lightweight footprint and high accuracy on low-end mobile devices. The model is trained on a comprehensive agricultural dataset to classify multiple classes of crop diseases (e.g., Potato Early Blight, Tomato Late Blight, Healthy Leaves, etc.).

### 2. Edge Inference via TensorFlow.js
The trained Keras/TensorFlow model is quantized and converted into the TensorFlow.js format (`model.json` and `.bin` weight shards). 
- **Zero-Latency:** Inference executes in real-time utilizing the smartphone's CPU or WebGL hardware acceleration.
- **Privacy-Preserving:** Photos taken by the farmer never leave their device.
- **Offline Execution:** The ML model binaries are precached via Service Workers into the browser's IndexedDB upon the first app load, ensuring the AI functions even in airplane mode.

---

## 🛠️ System Architecture & Tech Stack

1. **Frontend Core:** React 18 + Vite
2. **Offline Caching:** Vite-PWA with Workbox (Service Workers) for absolute caching of HTML/CSS/JS and Model Binaries.
3. **Edge ML:** `@tensorflow/tfjs` static bundling to avoid dynamic import chunk failure offline.
4. **LLM Engine:** `@google/genai` (Gemini Flash fallback strategies).
5. **Geospatial:** React-Leaflet mapped over OSM tiles.
6. **Styling:** TailwindCSS using a custom "Agri-Brutalism" design system.

## 🚀 Quick Start (Local Development)

To run Krishi Setu locally on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/SahooShuvranshu/KrishiSetu-AI.git
cd KrishiSetu-AI

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
# Create a .env file and add your Gemini API Key
echo "VITE_GEMINI_API_KEY=your_key_here" > .env

# 4. Start the development server
npm run dev
```

## 📚 Machine Learning Integration Guide
To train your own quantized crop disease models for the offline engine, we have included a Jupyter Notebook in this repository.
1. Open `notebooks/KrishiSetu_Real_Model_Training.ipynb` in Google Colab.
2. Provide an agricultural dataset (minimum 500+ images per class recommended for high accuracy).
3. The notebook will automatically apply OpenCV preprocessing and data augmentation.
4. Export the resulting `model.json` and `.bin` files directly into the frontend's `/public/model` directory.

## 🤝 Contributing
Krishi Setu is an open-source initiative. Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting Pull Requests.

## 🔒 Security
If you find a security vulnerability, please refer to our [Security Policy](SECURITY.md) to report it responsibly.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

<div align="center">
  <p>Built with 💡 by <b>Crystal Studio Labs</b></p>
</div>
