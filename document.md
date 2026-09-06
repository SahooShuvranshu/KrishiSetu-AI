# KrishiSetu AI — Complete Project Documentation

> **Last updated:** September 7, 2026
> **Hackathon:** Google AI Hackathon 2026 — Code for Communities (Problem Statement 4: Cooperation)
> **Team:** Crystal Studio Labs
> **Focus region:** Odisha, India
> **Live app:** https://krishi-setu-ai-seven.vercel.app
> **Landing page:** https://sahooshuvranshu.is-a.dev/KrishiSetu-AI/

---

## Table of Contents

1. [What is KrishiSetu AI?](#1-what-is-krishisetu-ai)
2. [Problem Statement](#2-problem-statement)
3. [Key Features](#3-key-features)
4. [Tech Stack](#4-tech-stack)
5. [Repository Structure](#5-repository-structure)
6. [How the App Works (Architecture & Data Flow)](#6-how-the-app-works-architecture--data-flow)
7. [Google AI / Hackathon Compliance](#7-google-ai--hackathon-compliance)
8. [Local Development Setup](#8-local-development-setup)
9. [Environment Variables](#9-environment-variables)
10. [Routing & Shared State](#10-routing--shared-state)
11. [The Offline ML Engine](#11-the-offline-ml-engine)
12. [Training Your Own Model (Step-by-Step)](#12-training-your-own-model-step-by-step)
13. [Installing the Trained Model & Testing](#13-installing-the-trained-model--testing)
14. [The Offline Remedy Dictionary](#14-the-offline-remedy-dictionary)
15. [Troubleshooting](#15-troubleshooting)
16. [PWA / Offline Notes](#16-pwa--offline-notes)
17. [Known Issues & Roadmap](#17-known-issues--roadmap)

---

## 1. What is KrishiSetu AI?

KrishiSetu ("Agriculture Bridge") is an **offline-first, multilingual AI crop doctor**
packaged as a Progressive Web App (PWA). A farmer in a remote Odisha village can:

1. Take a photo of a sick crop leaf.
2. Get an instant diagnosis + organic and chemical remedies **in their own language**
   (English / ଓଡ଼ିଆ / हिन्दी), spoken aloud if needed.
3. Broadcast an anonymous disease alert to the surrounding farming network (DPI telemetry grid).
4. Do all of this with **zero internet** — the ML model runs on the phone's own CPU/GPU
   through TensorFlow.js.

The word "Setu" means **bridge**: the app bridges farmers to agronomists, to neighbouring
villages, and to government advisories through shared, interoperable data.

---

## 2. Problem Statement

Small and marginal farmers across India lack access to data-driven agricultural guidance.
Reliance on traditional methods (instead of satellite data, soil health analytics and
climate forecasting) leads to crop failure and threatens food security. The absence of
shared digital infrastructure also blocks cross-state cooperation on climate-resilient
farming.

**The challenge:** build an interoperable digital agriculture network delivering real-time,
localised agro-advisories using AI — with a crop-disease diagnostic, regenerative crop
recommendations from soil + weather + satellite data, and shared public-good infrastructure
so states can exchange agricultural data and models.

---

## 3. Key Features

| Feature | Description |
|---|---|
| 📸 **AI Crop Doctor** | Photograph a leaf → cloud AI (Gemini) diagnosis when online, or on-device TensorFlow.js model when offline. |
| 🌾 **Odisha crop focus** | Crop selector for Paddy, Maize, Cotton, Tomato, Potato + General. |
| 🌱 **Regenerative agronomy** | Soil-zone advisories with crop rotation recommendations (5 Odisha agro-climatic zones). |
| 🌦️ **Live weather** | Zone-level temperature via Open-Meteo (free, no key). |
| 📅 **Crop calendar** | Season-aware (Kharif/Rabi/Zaid) guidance. |
| 💰 **Market prices** | Commodity price cards (static fallback, demo data). |
| 🗺️ **DPI Telemetry Grid** | Google Maps showing disease alert markers broadcast across devices. |
| 📢 **Alert broadcasting** | Anonymous outbreak alerts → Firebase real-time sync with offline queueing. |
| 🔊 **Text-to-Speech** | Remedies read aloud (Web Speech API; Cloud TTS when configured). |
| 🌐 **Multilingual** | Full UI + advice in English, Odia, Hindi. |
| 🔌 **100% offline** | Service worker precaches all assets; TF.js model runs locally; alerts queue & sync later. |
| 🎨 **Agri-Brutalism UI** | Huge high-contrast buttons, thick black borders — usable in blinding sunlight with muddy hands. |

---

## 4. Tech Stack

**Frontend**
- React 18 + Vite 5
- Tailwind CSS 3 (custom "Agri-Brutalism" theme)
- lucide-react icons
- react-router-dom v7 (hash routing — offline-safe)

**AI / ML**
- TensorFlow.js (`@tensorflow/tfjs`) — on-device inference
- MobileNetV2 transfer learning (training notebook in `notebooks/`)
- `@google/generative-ai` — cloud diagnosis (Gemini)

**Google Platform (hackathon compliance)**
- Gemini API — leaf diagnosis
- Vertex AI — model training/registry (notebook optional section)
- Google Maps — telemetry grid (`@react-google-maps/api`)
- Firebase / Firestore — real-time alert sync
- Google Translation API — service-based translation (fallback: bundled dictionary)
- Google Cloud TTS — spoken remedies (fallback: Web Speech API)

**Infra**
- vite-plugin-pwa (Workbox) — offline caching, installable PWA
- IndexedDB — image storage (no 5 MB localStorage limit)
- Vercel — hosting

---

## 5. Repository Structure

```text
KrishiSetu-AI/
├── document.md                  ← this file
├── README.md                    ← quick overview (public-facing)
├── todo.md / phases.md          ← internal progress trackers (git-ignored)
├── model_train.md               ← legacy Google Cloud setup guide (git-ignored)
├── notebooks/
│   └── KrishiSetu_Real_Model_Training.ipynb   ← THE training notebook
├── public/
│   ├── model/                   ← PUT TRAINED MODEL FILES HERE (see §13)
│   │   ├── model.json
│   │   ├── group1-shard1of1.bin
│   │   └── classes.json
│   └── sprout.svg
├── src/
│   ├── main.jsx                 ← entry: HashRouter + AppProvider + ToastProvider
│   ├── App.jsx                  ← shell: header, modals, <Routes>
│   ├── index.css                ← Tailwind + dark-mode + background patterns
│   ├── translations.js          ← EN/OR/HI dictionary
│   ├── multilingual_data.js     ← soil zones, telemetry demo data
│   ├── context/
│   │   └── AppContext.jsx       ← shared state (language, theme, online, model, key)
│   ├── config/
│   │   └── constants.js         ← centralized magic numbers (center coords, timeouts…)
│   ├── components/
│   │   ├── Navbar.jsx           ← bottom nav (NavLink routes)
│   │   ├── HomeTab.jsx          ← dashboard home
│   │   ├── CameraScan.jsx       ← THE SCAN FLOW (camera, analysis, share, broadcast)
│   │   ├── SoilAdvisory.jsx     ← zones + weather/calendar/prices tabs
│   │   ├── StateTelemetryMap.jsx← Google Maps alert grid
│   │   ├── FocusTrap.jsx        ← modal a11y (traps Tab, restores focus)
│   │   ├── ErrorBoundary.jsx    ← crash guard
│   │   ├── Toast.jsx            ← toast system (context)
│   │   ├── StatusBadge.jsx / ScanAnimation.jsx
│   │   └── WeatherDashboard / CropCalendar / MarketPrices
│   ├── services/
│   │   ├── gemini.js            ← cloud diagnosis (reads session key or env)
│   │   ├── modelStorageService.js ← loads TF.js model + runs local inference
│   │   ├── firebase.js          ← alerts sync w/ offline queue
│   │   ├── geolocation.js       ← debounced GPS wrapper
│   │   ├── imageStorage.js      ← IndexedDB helper
│   │   ├── translation.js / tts.js / voice.js
│   └── data/
│       └── offline_diseases.json ← remedy dictionary for offline results
├── .env.example                 ← required API keys template
├── index.html
├── tailwind.config.js
├── vite.config.js               ← PWA plugin
└── vercel.json                  ← SPA rewrites + cache headers
```

---

## 6. How the App Works (Architecture & Data Flow)

### 6.1 Startup

```
main.jsx
  └─ <HashRouter>          → URL-based tabs (#/, #/scan, #/advisory, #/network)
       └─ <AppProvider>    → global state (language, theme, online, model, gemini key…)
            └─ <ToastProvider>
                 └─ <App>  → splash (2.5s), header, modals, <Routes>, <Navbar>
```

Each tab is **lazy-loaded** (`React.lazy`) so the first paint stays fast, and the whole
tab area is wrapped in an error boundary so a crash can't blank the app.

### 6.2 Scan flow (CameraScan)

```
1. Farmer taps "Open Camera" / "Upload Photo"
        │
2. <input type="file"> → FileReader → base64
        │
3. compressImage()  (resize ≤512px, JPEG q0.8 — cuts API cost & upload time)
        │
4. saveImage('last_scan') → IndexedDB   (survives reloads)
        │
5. analyzeImage():
     ├─ ONLINE  → diagnoseCropLeaf(base64, lang)  [Gemini, 60s timeout]
     └─ OFFLINE → runInBrowserVisionInference(img) [TF.js model, 0–1 pixels]
        │
6. Result card: disease + % + source + Organic/Chemical advice
        │
7. Actions:
     ├─ 🔊 Play audio        speakText()
     ├─ ✕ New photo          resetScan() → back to intake
     ├─ 📢 Broadcast alert   GPS (debounced) + broadcastAlert() → Firebase/local
     └─ ⤴ Share              navigator.share() / clipboard
```

**After a successful broadcast or share the scan resets automatically**, saving the
diagnosis to history first, so the app is always ready for the next photo. There is also
an always-visible ✕ button on the preview — you are never stuck on a photo.

### 6.3 Offline behaviour

- All app shell assets are precached by the service worker → the app opens offline.
- `isOnline` (from `navigator.onLine`) switches diagnosis from Gemini to the local model.
- The local model + `classes.json` are fetched from `/model/…` and cached in the
  browser HTTP cache after first download (see §13 for making the model available).
- Broadcasts made offline are saved to localStorage, then pushed to Firebase
  automatically when the device regains connectivity (`syncPendingAlerts`).

---

## 7. Google AI / Hackathon Compliance

| Google product | Where it's used | Status |
|---|---|---|
| Gemini API | `src/services/gemini.js` — leaf diagnosis | ✅ wired |
| Vertex AI | notebook §10 — optional Model Registry upload | ✅ in notebook |
| Google Maps | `StateTelemetryMap.jsx` | ✅ wired |
| Firebase | `firebase.js` — real-time alerts | ✅ wired |
| Translation API | `src/services/translation.js` (with bundled fallback) | ✅ wired |
| Cloud TTS | `src/services/tts.js` (with Web Speech fallback) | ✅ wired |

---

## 8. Local Development Setup

```bash
# 1. Clone + install
git clone https://github.com/SahooShuvranshu/KrishiSetu-AI.git
cd KrishiSetu-AI
npm install

# 2. Environment file
cp .env.example .env
# → fill at least VITE_GEMINI_API_KEY to test cloud diagnosis

# 3. Run dev server
npm run dev        # http://localhost:5173

# Other scripts
npm run build      # production build → dist/
npm run preview    # serve the built app locally
npm run deploy     # build + vercel --prod
```

---

## 9. Environment Variables

See `.env.example`. Summary:

| Variable | Required for | Where to get it |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Cloud diagnosis | https://aistudio.google.com |
| `VITE_GOOGLE_MAPS_KEY` | Telemetry map | https://console.cloud.google.com (Maps JS API) |
| `VITE_FIREBASE_*` (6 vars) | Alert broadcast sync | https://console.firebase.google.com |
| *(optional)* Translation / TTS | Cloud translation + speech | Google Cloud console |

> **Security note:** user-entered Gemini keys are kept in `sessionStorage` only and are
> cleared when the tab closes. The recommended production path is `VITE_GEMINI_API_KEY`
> baked in at build time. Never commit a real `.env`.

---

## 10. Routing & Shared State

### Routes (HashRouter — works offline, no server rewrites needed)

| URL | Tab | Component |
|---|---|---|
| `#/` | Home | `HomeTab` |
| `#/scan` | Crop Doctor | `CameraScan` |
| `#/advisory` | Farm Advice | `SoilAdvisory` |
| `#/network` | Alerts Network | `StateTelemetryMap` |

### AppContext (`useApp()`)

Components never receive settings via prop-drilling. They call:

```js
const { t, isOnline, appLanguage, isDark, ... } = useApp();
```

The context owns: translation function `t`, language, theme, online/offline, notifications
preference, auto-detect preference, Gemini key (session-scoped), model-downloaded flag,
model downloading flag, and all mutators (`changeLanguage`, `toggleTheme`, `downloadModel`,
`removeModel`, `clearAllData`, …).

---

## 11. The Offline ML Engine

### How inference works (`services/modelStorageService.js`)

1. `tf.loadLayersModel('/model/model.json')` — loads the TF.js **Layers** model.
2. `fetch('/model/classes.json')` — plain **array** of class names; index N = output N.
3. For a new photo:
   ```js
   tf.browser.fromPixels(img)        // RGB, 0–255
     .resizeNearestNeighbor([224,224])
     .toFloat()
     .div(255.0)                     // ← pixels become [0, 1]
   ```
4. `model.predict(tensor)` → argmax → `classNames[maxIndex]` → e.g. `Paddy_Blast`.
5. The class name is matched against `src/data/offline_diseases.json` for remedies.

### Preprocessing contract (CRITICAL)

The app **divides by 255** so the model receives `[0, 1]` floats. The training notebook
must therefore:
- load images with `rescale=1./255` (→ `[0,1]`), and
- bake a `Rescaling(scale=2.0, offset=-1.0)` layer (→ `[-1,1]`) as the first model layer,
  matching what MobileNetV2 imagenet weights expect.

The current notebook does exactly this — **do not remove the rescaling**, or offline
accuracy collapses.

---

## 12. Training Your Own Model (Step-by-Step)

### What you need
- Google account (free) — for Colab.
- Kaggle account (free) — for datasets.
- ~1–2 hours on a free T4 GPU.

### The files you will end up with
After the notebook finishes you download `tfjs_model.zip` containing:

```
model.json              ← TF.js architecture + weight manifest (required)
group1-shard1of1.bin    ← quantized weights (required)
classes.json            ← class array in output order (required)
metadata.json           ← optional info
```

### Step-by-step

**Step 1 — Get datasets (upload into Colab).**
In the Colab **Files** panel upload to `/content/`:

| Dataset | Zip name contains | Notes |
|---|---|---|
| PlantVillage (54K imgs, 38 classes) | `plant` or `disease` | emmarex/plantdisease on Kaggle |
| Rice disease dataset | `rice` | anshulm257/rice-disease-dataset |
| Cotton leaf dataset | `cotton` | seroshkarim/cotton-leaf-disease-dataset |

> Only upload rice + cotton if you want a smaller/faster run — you'll just get fewer classes.

**Step 2 — Open the notebook in Colab.**
`colab.research.google.com` → File → Upload notebook → pick
`notebooks/KrishiSetu_Real_Model_Training.ipynb`.

**Step 3 — Enable GPU.** Runtime → Change runtime type → **T4 GPU** → Save.

**Step 4 — Run every cell top-to-bottom** (Shift+Enter). Key sections:
1. Install packages
2. *(auto)* extract your zips & discover image folders
3. Build the Odisha dataset (`/content/odisha_crops/<Crop>_<Disease>/`)
4. Load + augment (normalised to [0,1])
5. Build MobileNetV2
6. Phase 1 training (frozen base, ~10 epochs)
7. Phase 2 fine-tuning (~5 epochs)
8. Evaluate (report + confusion matrix)
9. *(optional)* Vertex AI upload — needs service-account.json; skip if not configured
10. **Export to TF.js** → writes `model.json`, `.bin`, `classes.json`
11. **Download** `tfjs_model.zip`

**Step 5 — Stop early for a smoke test** (optional). In the training cell, set
`EPOCHS_P1 = 2`, `EPOCHS_P2 = 1` to prove the whole pipeline works end-to-end fast.

### Colab-specific tips
- If Colab says "NumPy 2.x" — the notebook pins `numpy<2.0` and asks you to restart the
  runtime after install; just Runtime → Restart session, then rerun from the top.
- Free T4 GPU ~12h/day is plenty for this model size.

---

## 13. Installing the Trained Model & Testing

### Option A — Local model for offline testing

1. Unzip `tfjs_model.zip`.
2. Copy the files into the app:
   ```bash
   # from the repo root
   mkdir -p public/model
   cp /path/to/model.json  public/model/
   cp /path/to/group1-shard1of1.bin  public/model/
   cp /path/to/classes.json  public/model/
   ```
   > `.gitignore` already ignores `public/model/*.json|*.bin`, so model files stay local/CI.
3. Run the app:
   ```bash
   npm run dev
   ```
4. In the app open **Settings (gear)** → the model section shows "Download Offline Model"
   (this writes the `model_downloaded` flag). Then **switch your device to offline /
   airplane mode** (or test with DevTools → Network → Offline) so CameraScan uses the
   local model, and scan a leaf photo.

> **Important:** online mode prefers Gemini (needs an API key). To force-test the local
> model, go offline or temporarily empty the Gemini key.

### Option B — Just test cloud diagnosis (no model needed)
With `VITE_GEMINI_API_KEY` set and an internet connection, take/upload any leaf photo and
you'll get a Gemini diagnosis immediately — no training required.

### Option C — Simulate offline scan without a real model
If you want to exercise the offline code path but haven't trained yet, the service worker
won't find `/model/model.json` and the scan reports "Model Not Installed" with a pointer
to Settings — that is the expected fallback until you copy the model files in.

---

## 14. The Offline Remedy Dictionary

`src/data/offline_diseases.json` holds treatment records keyed by **crop** + **disease
keywords**. When the local model predicts `Paddy_Blast`, the service matches the best
record by:
1. crop prefix equality (`Paddy` == `Paddy`), then
2. keyword/bigram overlap with the disease name.

The file ships with records for every class the notebook can emit:
- **Paddy:** Bacterial Leaf Blight, Leaf Blight, Brown Spot, Blast, Leaf Smut, Tungro,
  Hispa, Sheath Blight, Healthy
- **Maize:** Rust, Leaf Blight, Gray Leaf Spot, Healthy
- **Tomato:** Bacterial Spot, Early/Late Blight, Leaf Mold, Septoria, Spider Mite,
  Target Spot, Yellow Leaf Curl, Mosaic, Healthy
- **Potato:** Early/Late Blight, Healthy
- **Cotton:** Leaf Curl, Bacterial Blight, Fusarium Wilt, Healthy

Add your own entries any time; the matcher is fuzzy, so a new record only needs the right
`crop_name` and descriptive words in `disease_name`.

---

## 15. Troubleshooting

### 15.1 "Screen stuck showing only the photo; can't take a new photo"  ← FIXED
Root causes addressed:
- Photos are only auto-restored from IndexedDB when a matching result also exists —
  an orphaned image is deleted instead of trapping the user.
- An **✕ button always floats on the preview**, even mid-scan, calling `resetScan()`.
- Cloud analysis has a **60-second timeout** so the scan animation can't hang forever.
- Broadcast and Share now **reset to intake automatically** after they succeed, and save
  the diagnosis to history first.

### 15.2 "Model Not Installed" when offline
You haven't copied a model into `public/model/` (see §13). In online mode you don't need
it — the app uses Gemini.

### 15.3 Diagnosis accuracy is bad offline
- Retrain with more images per class (500+ recommended) and more epochs.
- Make sure you did **not** remove the `Rescaling` layer / `rescale=1./255` (see §11).
- Check `classes.json` order matches training (the notebook writes it automatically).

### 15.4 Firebase alerts don't show
- `VITE_FIREBASE_*` env vars missing → app falls back to local-only alerts. Fill `.env`.
- Offline alerts queue in localStorage and sync when back online (up to 30s delay).

### 15.5 Google Maps shows "Error loading Google Maps"
- `VITE_GOOGLE_MAPS_KEY` missing/expired, or the Maps JavaScript API isn't enabled.
- Without a key the network tab still works via local alert cards.

### 15.6 Broadcast "stuck"/GPS slow
- Geolocation is debounced to one request per 5 seconds by design. A second tap reuses
  the default Odisha centre rather than blocking.

### 15.7 Dark mode looks off on some screens
- The app remaps white/black/borders to grays in dark mode via `index.css` overrides;
  shadows have named utilities (`shadow-brutal-sm/md/xl/…`) with dark variants.

---

## 16. PWA / Offline Notes

- **Installable:** add to home screen (manifest + service worker via vite-plugin-pwa).
- **Precache:** HTML/CSS/JS and static assets are precached by Workbox (`dist/sw.js`).
- **Hash routing:** all routes are `#/…` so no server rewrite is ever needed and deep
  links work offline.
- **Model files:** big `.bin` weights are not precached (kept out of the service worker);
  they're fetched on demand and then live in the browser HTTP cache. For a fully offline
  model on first install, a future improvement is to add them to the precache manifest.
- **Images:** stored in IndexedDB via `services/imageStorage.js` (no 5 MB limit).

---

## 17. Known Issues & Roadmap

See `todo.md` for the live list. Remaining items:
- Model download in Settings is still a **placeholder** (2-second fake). Real behaviour:
  fetch `/model/model.json` + shards and cache them explicitly.
- `removeModel()` clears the flag but not the in-memory TF.js model (needs
  `tf.dispose()` + reload of `modelStorageService`).
- Market prices + a few advisory cards use static demo data — wire to a real API.
- Geolocation debounce exists; a graceful "retry in a moment" prompt could be nicer UX.

**Nice-to-haves:** real Kaggle dataset sizes, ensemble of 2 models, on-device
quantization reporting, alert trust/verification layer.

---

*Built with 💡 by Crystal Studio Labs — Shuvransu Sekhar Sahoo, Snehal Kumar Moharana,
Subhankar Mohapatra, Pruthiraj Lenka.*
