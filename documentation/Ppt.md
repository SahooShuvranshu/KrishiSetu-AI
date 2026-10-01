# 🌾 KrishiSetu AI — Pitch Deck (Simple & Clean Presentation)

<div align="center">

[![Slide Count](https://img.shields.io/badge/Slides-10_Slides-4285F4?style=for-the-badge)](Ppt.md)
[![Aspect Ratio](https://img.shields.io/badge/Aspect_Ratio-16%3A9_Widescreen-34A853?style=for-the-badge)](Ppt.md)
[![Design Style](https://img.shields.io/badge/Style-Agri--Brutalism_Minimal-EA4335?style=for-the-badge)](Ppt.md)
[![Submission Status](https://img.shields.io/badge/Status-Officially_Submitted-success?style=for-the-badge)](https://hack2skill.com/event/codeforcommunities2)
[![Compatibility](https://img.shields.io/badge/Export-Gamma_•_Slides_•_Canva-FF6F00?style=for-the-badge)](Ppt.md)
[![Assets](https://img.shields.io/badge/Assets-10_Mobile_Captures-purple?style=for-the-badge)](screenshots/)

<p>
  <strong>Presentation Specification:</strong> High-contrast, clean 16:9 presentation deck optimized for live pitch sessions, Gamma AI, and Google Slides.
</p>

</div>

> [!TIP]
> **Pitching Context**: This deck tells the story of rural Odisha smallholder farmers facing severe cellular dead zones and extension officer deficits. Each slide incorporates visual screenshot slot directives and word-for-word speaker notes calibrated for a 3-minute hackathon evaluation.

---

## Slide 1: Title Slide — The Vision

### **KRISHISETU AI**
#### *100% Offline AI Crop Doctor & Smart Agricultural Advisory Grid*
Instant plant pathology & spoken voice remedies in Odia, Hindi, and English — with zero internet connection.

- **Team**: Crystal Studio Labs (Odisha, India)
- **Event**: Build with AI: Code for Communities - Second Edition
- **Track**: Track 4: AgriN & Regenerative Agriculture Intelligence
- **Theme**: Cooperation (Problem Statement 4)
- **Core Pillars**: `[100% Client-Side TF.js]` `[Trilingual Voice]` `[OPFS Storage]` `[Zero-Backend PWA]`

> **Visual**: Show [`screenshots/01_splash_tractor_logo.png`](screenshots/01_splash_tractor_logo.png)  
> **Speaker Notes**: *"Good morning judges. We are Crystal Studio Labs, presenting KrishiSetu AI for Track 4: AgriN & Regenerative Agriculture Intelligence — Theme: Cooperation (Problem Statement 4). In one sentence: a smallholder farmer snaps a photo of a sick leaf in the middle of a remote field and hears the verified cure spoken aloud in Odia — completely in airplane mode with zero internet."*

---

## Slide 2: Track 4: AgriN & Regenerative Agriculture Intelligence — The Guidance & Infrastructure Gap

### Small and marginal farmers lack data-driven guidance, while the lack of shared infrastructure blocks inter-state climate cooperation.

- **The Problem**: Small and marginal farmers across India lack access to data-driven agricultural guidance. Relying on traditional methods instead of satellite data, soil health analytics, and climate forecasting leads to crop failure and threatens food security. The absence of shared digital infrastructure also blocks cross-state collaboration on climate-resilient farming.
- **The Challenge**: Build an interoperable digital agriculture network that delivers real-time, localised agro-advisories using AI. It should offer regenerative crop recommendations based on satellite data, soil health, and weather forecasting, plus a diagnostic tool for crop diseases, and be designed as a scalable digital public good enabling Indian states to share agricultural data models and strengthen cooperation on sustainable food production.
- **Ground Reality in Odisha**: 85%+ cellular dead zones, 1 officer per 1,500+ farmers, 40% yield loss to preventable pathogens.

> **Visual**: Show [`screenshots/02_home_dashboard_top.png`](screenshots/02_home_dashboard_top.png)  
> **Speaker Notes**: *"Under Track 4: AgriN & Regenerative Agriculture Intelligence — Theme: Cooperation, the core challenge is building an interoperable digital public good delivering real-time, localized agro-advisories. Traditional tools demand high-speed cloud connections, excluding the 85% of rural Indian fields that are dead zones. KrishiSetu decentralizes agricultural intelligence directly onto the farmer's smartphone, making cooperation truly inclusive."*

---

## Slide 3: The Solution — The On-Device Agronomy Engine

### Complete crop pathology and smart farming advisory running directly inside the phone's browser.

1. **100% Offline AI Scanner**: Lightweight MobileNetV2 TensorFlow.js neural network running on-device in under 150ms.
2. **Trilingual Voice Synthesis**: Instant speech synthesis in **Odia (`ଓଡ଼ିଆ`)**, **Hindi (`हिन्दी`)**, and **English** using the Web Speech API.
3. **Balanced Dual Prescriptions**: Every diagnosis delivers an eco-friendly organic cure alongside precise chemical treatments with safety dosages.
4. **Holistic Farming Hub**: Bundled Odisha district disease risk map, localized weather advisories, and real-time Mandi market commodity prices.

> **Visual**: Show [`screenshots/03_home_dashboard_offline_readiness.png`](screenshots/03_home_dashboard_offline_readiness.png)  
> **Speaker Notes**: *"KrishiSetu acts like a master agronomist living inside the farmer's pocket. It diagnoses diseases on the spot and speaks the remedies in the farmer's native dialect. And because it runs entirely on-device, it never fails in the middle of a remote field."*

---

## Slide 4: The 60-Second Live Demo Protocol

### Proving True On-Device Inference in Airplane Mode

| Step | Action | On-Screen Result |
| :--- | :--- | :--- |
| **1. Airplane Mode** | Toggle airplane mode on phone | System confirms offline readiness indicator |
| **2. Crop Selection**| Select crop category (e.g. Paddy) | Activates specialized crop disease neural mask |
| **3. Capture Leaf**  | Snap or upload leaf photo | Instant on-device pre-processing & pixel check |
| **4. Diagnosis**     | 120ms TensorFlow.js inference | Displays disease name, confidence %, and remedies |
| **5. Native Audio**  | Tap "Play Audio" | Remedy is read aloud in fluent Odia |

> **Visual**: Show [`screenshots/04_camera_scan_view.png`](screenshots/04_camera_scan_view.png)  
> **Speaker Notes**: *"The demo is our entire pitch. Turn on airplane mode, pick Paddy, snap a photo, and in 120ms the cure appears and speaks in Odia. If you photograph a non-leaf or a muddy hand, our pixel guard immediately says 'No Leaf Detected' — refusing to hallucinate wrong dosages."*

---

## Slide 5: Machine Learning & Edge Architecture

### Bringing State-of-the-Art Computer Vision to Low-End Android Hardware

- **Neural Architecture**: MobileNetV2 fine-tuned with transfer learning for agricultural disease classes across Paddy, Cotton, Tomato, Potato, and Maize.
- **Quantization & Size**: Model quantized to lightweight TF.js shards (~4.6 MB total) that fit easily on budget smartphones.
- **Private Device Storage**: Model files live in the browser's **Origin Private File System (OPFS)** — immune to cache purges and surviving device reboots.
- **Dual Engine Pipeline**: Client-side TF.js for guaranteed offline execution; optional Google Gemini Flash for cloud multimodal reasoning when online.

> **Visual**: Show [`screenshots/10_settings_storage_and_system.png`](screenshots/10_settings_storage_and_system.png)  
> **Speaker Notes**: *"Instead of running a heavy cloud model that requires connectivity, we quantized MobileNetV2 into TF.js layers. It downloads once into the device's Origin Private File System and loads into WebGL hardware acceleration in milliseconds."*

---

## Slide 6: Breaking the Literacy Barrier with Trilingual Audio

### Agronomy Delivered in the Farmer's Mother Tongue

- **Native Dialect Support**: Built-in, zero-latency switching between **Odia (`ଓଡ଼ିଆ`)**, **Hindi (`हिन्दी`)**, and **English**.
- **Offline Text-to-Speech**: Leverages browser-native Web Speech API speech synthesis — requires zero API tokens and zero internet bandwidth.
- **Universal Literacy Access**: Allows illiterate and elderly farmers to listen to critical chemical dosage calculations without needing to read fine print.

> **Visual**: Show [`screenshots/05_odia_native_language.png`](screenshots/05_odia_native_language.png)  
> **Speaker Notes**: *"A text diagnosis is useless to a farmer who cannot read. By combining localized Odia translations with offline Web Speech synthesis, KrishiSetu democratizes agricultural expertise for everyone."*

---

## Slide 7: Safety-First Engineering — Knowing When NOT to Answer

### In Agriculture, a Confident Wrong Answer Destroys a Family's Harvest

- **Crop Masking**: Renormalizes predictions strictly within the selected crop. A paddy leaf cannot misclassify as tomato blight.
- **Confidence & Margin Gates**: Requires ≥50% confidence AND a ≥12% margin over the second candidate; otherwise surfaces *"Uncertain — Verify with Officer"*.
- **Non-Leaf Pixel Guard**: Analyzes green spectrum and luminance variance before running inference, rejecting hands, walls, and soil.
- **Trained Negative Class**: Includes explicit `Other_NotALeaf` training samples to eliminate false positives.

> **Visual**: Show [`screenshots/04_camera_scan_view.png`](screenshots/04_camera_scan_view.png)  
> **Speaker Notes**: *"Most AI apps guess wildly when shown a wrong picture. KrishiSetu is engineered with strict confidence thresholds, green-spectrum pixel guards, and crop masks to ensure farmers never spray expensive chemicals based on an AI hallucination."*

---

## Slide 8: The Agricultural Grid — Advisory & Mandi Prices

### Holistic Digital Infrastructure for Climate-Resilient Farming

- **District Risk Layer**: Interactive disease risk map visualizing pest prevalence across all 30 districts of Odisha.
- **Weather & Humidity Alerts**: Real-time atmospheric monitoring predicting fungal and bacterial spore outbreaks.
- **Mandi Market Rates**: Live commodity pricing for Paddy, Cotton, Potato, and Vegetables across major Odisha mandis (Bhubaneswar, Cuttack, Sambalpur, Berhampur).
- **Seasonal Crop Calendar**: Complete Kharif, Rabi, and Zaid planting and harvest timelines.

> **Visual**: Show [`screenshots/06_farm_advice_district_risk_map.png`](screenshots/06_farm_advice_district_risk_map.png)  
> **Speaker Notes**: *"KrishiSetu is more than a scanner — it is an agricultural grid. Farmers can plan planting using the seasonal crop calendar, track humidity-driven disease risks, and check fair mandi commodity prices before selling to middlemen."*

---

## Slide 9: Measurable Farmer Impact

### Evaluating Success in the Units a Farmer Actually Cares About

| Dimension | Traditional Method | With KrishiSetu AI |
| :--- | :--- | :--- |
| **Diagnostic Cost** | ₹200–₹500 per visit / travel | **₹0 (100% Free Public Good)** |
| **Turnaround Time** | 24 to 72 hours | **<150 milliseconds** |
| **Connectivity** | Requires 4G/5G or town trip | **Works 100% in Airplane Mode** |
| **Data Privacy** | Photos uploaded to third parties | **Photos never leave the device** |
| **Language** | English / Hindi leaflets | **Spoken Odia audio remedies** |

> **Visual**: Show [`screenshots/07_mandi_market_prices.png`](screenshots/07_mandi_market_prices.png)  
> **Speaker Notes**: *"We measure impact in farmer terms: zero cost per diagnosis, zero cellular data consumed, complete personal data privacy, and guidance in their own spoken mother tongue."*

---

## Slide 10: Team, Tech Stack & Project Links

### Built with Pride for Build with AI: Code for Communities - Second Edition

- **Team**: **Crystal Studio Labs**
  - Shuvransu Sekhar Sahoo
  - Snehal Kumar Moharana
  - Subhankar Mohapatra
  - Pruthiraj Lenka
- **Technology Stack**:
  - React 18, Vite PWA, Tailwind CSS
  - TensorFlow.js (MobileNetV2 on OPFS)
  - Google Gemini Flash API & Google Maps Platform
  - Web Speech API Speech Synthesis
- **Repository Links**:
  - Live PWA: [krishi-setu-ai-seven.vercel.app](https://krishi-setu-ai-seven.vercel.app/)
  - Showcase Site: [sahooshuvranshu.is-a.dev/KrishiSetu-AI/](https://sahooshuvranshu.is-a.dev/KrishiSetu-AI/)
  - Main App Repo: [github.com/SahooShuvranshu/KrishiSetu-AI](https://github.com/SahooShuvranshu/KrishiSetu-AI)
  - ML Model Repo: [github.com/Crystal-Studio-Labs/KrishiSetu-ML-Model](https://github.com/Crystal-Studio-Labs/KrishiSetu-ML-Model)

> **Visual**: Show [`screenshots/08_weather_dashboard.png`](screenshots/08_weather_dashboard.png)  
> **Speaker Notes**: *"Thank you judges. KrishiSetu AI is live, open-source, and ready to empower India's rural farming communities. We invite you to test it in airplane mode right now."*
