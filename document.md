# KrishiSetu AI — Complete Project Documentation

> **Last updated:** September 23, 2026
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
3. See a district-level disease-risk map for Odisha, plus soil, weather, crop-calendar and
   mandi-price advice.
4. Do all of this with **zero internet** — the ML model runs on the phone's own CPU/GPU
   through TensorFlow.js.

The word "Setu" means **bridge**: the app bridges a farmer to agronomists and to the
district advisories that matter for their own field.

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
| 💰 **Market prices** | Commodity price cards. Currently a bundled table that works offline; not yet wired to the live mandi API. |
| 🗺️ **District Risk Map** | Google Maps view of district-level pest/disease risk for Odisha, at the top of the Farm Advice tab. |
| 🔊 **Text-to-Speech** | Remedies read aloud with the browser's Web Speech API — no key, works offline. |
| 🌐 **Multilingual** | Full UI + advice in English, Odia, Hindi. |
| 🔌 **100% offline** | Service worker precaches all assets; the TF.js model lives on the device; the risk list and every advisory work with no connection. |
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
- Vertex AI — *not used*; training is MobileNetV2 transfer learning on Colab (T4), exported straight to TensorFlow.js
- Google Maps — district risk map (`@react-google-maps/api`)
- Translation — the bundled EN/OR/HI dictionary (`src/translations.js`); no translation API is called
- Text-to-speech — the on-device Web Speech API (`src/services/tts.js`)

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
│   └── KrishiSetu_Model_Training.ipynb   ← THE training notebook
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
│   ├── multilingual_data.js     ← soil zones + district risk data
│   ├── context/
│   │   └── AppContext.jsx       ← shared state (language, theme, online, model, key)
│   ├── config/
│   │   └── constants.js         ← centralized magic numbers (center coords, timeouts…)
│   ├── components/
│   │   ├── Navbar.jsx           ← bottom nav (NavLink routes)
│   │   ├── HomeTab.jsx          ← dashboard home
│   │   ├── CameraScan.jsx       ← THE SCAN FLOW (camera, analysis, share)
│   │   ├── SoilAdvisory.jsx     ← zones + weather/calendar/prices tabs
│   │   ├── DiseaseRiskMap.jsx   ← Google Maps district risk layer (Farm Advice)
│   │   ├── FocusTrap.jsx        ← modal a11y (traps Tab, restores focus)
│   │   ├── ErrorBoundary.jsx    ← crash guard
│   │   ├── Toast.jsx            ← toast system (context)
│   │   ├── StatusBadge.jsx / ScanAnimation.jsx
│   │   └── WeatherDashboard / CropCalendar / MarketPrices
│   ├── services/
│   │   ├── gemini.js            ← cloud diagnosis (reads session key or env)
│   │   ├── modelStorageService.js ← loads TF.js model + runs local inference
│   │   ├── offlineDiagnosis.js  ← crop mask, confidence gate, leaf guard, remedy lookup
│   │   ├── storageService.js    ← persistent storage + model files in OPFS
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
  └─ <HashRouter>          → URL-based tabs (#/, #/scan, #/advisory)
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
     └─ OFFLINE → runInBrowserVisionInference(img, selectedCrop) [TF.js model]
        │
6. Result card: disease + source + confidence, or a "Not Sure" / "No Leaf Detected" card
        │
7. Actions:
     ├─ 🔊 Play audio        speakText()
     ├─ ✕ New photo          resetScan() → back to intake
     └─ ⤴ Share              navigator.share() / clipboard
```

**After a successful share the scan resets automatically**, saving the diagnosis to
history first, so the app is always ready for the next photo. There is also an
always-visible ✕ button on the preview — you are never stuck on a photo.

### 6.3 Offline behaviour

- All app shell assets are precached by the service worker → the app opens offline.
- `isOnline` (from `navigator.onLine`) switches diagnosis from Gemini to the local model.
- The local model + `classes.json` are downloaded from `/model/…` into **OPFS** (the
  origin-private filesystem) rather than the HTTP cache, so clearing browser cache no longer
  deletes the model. The app asks for **persistent storage** first so Android cannot evict it
  when space runs low. See §13 for making the model available.
- The district risk records are bundled with the app, so the list works offline; only the
  Google Map itself needs a connection.

---

## 7. Google AI / Hackathon Compliance

| Google product | Where it's used | Status |
|---|---|---|
| Gemini API | `src/services/gemini.js` — leaf diagnosis | ✅ wired |
| Google Maps | `DiseaseRiskMap.jsx` — district risk map | ✅ wired |
| Translation API | *not used* — never had a backend; the bundled dictionary is what actually runs. The dead `/api/translate` call was removed | ❌ removed |
| Cloud TTS | *not used* — never had a backend; the Web Speech API is what actually speaks. The dead `/api/tts` call was removed | ❌ removed |
| Vertex AI | *not used* — the notebook exports straight to TF.js | ❌ not used |
| Firebase | *removed* — the app has no backend | ❌ removed |

---

## 8. Local Development Setup

```bash
# 1. Clone + install
git clone https://github.com/SahooShuvranshu/KrishiSetu-AI.git
cd KrishiSetu-AI
npm install

# 2. Environment file (nothing to fill in)
# The app ships with no API keys. Add your own in the app instead:
#   Settings (gear icon) → API KEYS (THIS DEVICE)

# 3. Run dev server
npm run dev        # http://localhost:5173

# Other scripts
npm run build      # production build → dist/
npm run preview    # serve the built app locally
npm run deploy     # build + vercel --prod
```

---

## 9. API Keys (entered in the app, not in the environment)

**There are no build-time variables for keys, on purpose.** Anything in a Vite
bundle is public: `VITE_*` values are inlined into `dist/`, and the Gemini key
used to be verifiably readable there. The app now reads no key from the
environment at all (`src/services/apiKeys.js` never touches `import.meta.env`).

| Key | Required for | Where the user gets it |
|---|---|---|
| Gemini API key | Cloud diagnosis | https://aistudio.google.com/apikey |
| Google Maps JS key | District risk map | https://console.cloud.google.com (enable Maps JavaScript API) |
| Translation / TTS | optional fallback; no backend serves these | Google Cloud console |

Both are entered in **Settings → API KEYS (THIS DEVICE)**, stored in that
browser's `localStorage` on that device, and never sent anywhere. If you ever set
`VITE_GEMINI_API_KEY` / `VITE_GOOGLE_MAPS_KEY` earlier (here or in your hosting
provider), delete them and rotate both keys — they were public.

> **Do not** put a key back into the build just to make a demo easier. That is
> exactly how the previous key ended up public inside `dist/`.

> **History:** user-entered keys used to live in `sessionStorage` only and were
> cleared when the tab closed, and the "recommended production path" was to bake the
> key in at build time. That advice was wrong and has been removed.

---

## 10. Routing & Shared State

### Routes (HashRouter — works offline, no server rewrites needed)

| URL | Tab | Component |
|---|---|---|
| `#/` | Home | `HomeTab` |
| `#/scan` | Crop Doctor | `CameraScan` |
| `#/advisory` | Farm Advice (risk map + zones) | `SoilAdvisory` |

### AppContext (`useApp()`)

Components never receive settings via prop-drilling. They call:

```js
const { t, isOnline, appLanguage, isDark, ... } = useApp();
```

The context owns: translation function `t`, language, theme, online/offline, auto-detect
preference, Gemini key (session-scoped), the model-installed flag (derived from the files
actually present on the device, not a stored string), download progress, device storage
usage, and all mutators (`changeLanguage`, `toggleTheme`, `downloadModel`,
`installModelFiles`, `removeModel`, `clearAllData`, …).

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
4. `model.predict(tensor)` → the **full probability vector**, not argmax.
5. `offlineDiagnosis.js` then decides: filter to the crop the farmer picked and renormalise
   (so the number is `P(disease | crop)`), apply the confidence + margin gate, and match the
   class against `src/data/offline_diseases.json` for remedies.
6. Below `MIN_CONFIDENCE` (0.5) or inside `MIN_MARGIN` (0.12) the app **refuses to name a
   disease** and asks for a better photo. A non-leaf frame is rejected before inference runs
   by the pixel guard (`LEAF_*` in `src/config/constants.js`).

> A wrong treatment is more dangerous than no treatment, which is why the gate and the
> "Not Sure" card exist. Tune `MIN_CONFIDENCE` / `LEAF_*` once you have field photos.

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
`notebooks/KrishiSetu_Model_Training.ipynb`.

**Step 3 — Enable GPU.** Runtime → Change runtime type → **T4 GPU** → Save.

**Step 4 — Run every cell top-to-bottom** (Shift+Enter). The notebook is 12 steps:

| Step | What it does |
|---|---|
| 0 | Settings — Kaggle token, image size, epochs, `SMOKE_TEST`, `DROP_CLASSES_WITHOUT_REMEDY` |
| 1 | Install `tensorflowjs`; print the environment and GPU |
| 2 | Get the data — Kaggle CLI via `KAGGLE_API_TOKEN`, or archives/folders you uploaded, or a `tensorflow_datasets` fallback (Maize/Tomato/Potato, no account needed) |
| 3 | Build `/content/odisha_crops/<Crop_Disease>/`: map folder names onto the app's taxonomy, dedupe, drop classes the remedy dictionary cannot advise on |
| 4 | `tf.data` pipelines + augmentation |
| 5 | Build MobileNetV2 (frozen base + new head) |
| 6 | Phase 1 — train the classifier head |
| 7 | Phase 2 — fine-tune the top of MobileNetV2 |
| 8a/8b | Training curves, classification report, confusion matrix |
| 9 | Contract checks — crop/disease prefixes, and that every trained class maps to a remedy record |
| 10 | Export `model.json` + `.bin` shard(s) + `classes.json` |
| 11 | Zip and auto-download `tfjs_model.zip` |

> The Kaggle token goes in **Step 0** as `KAGGLE_API_TOKEN`. The notebook exports it as the
> CLI's own env var *and* retries the download over REST with a `Bearer` header, so it works
> whether or not the installed CLI honours the token. **Rotate the token on Kaggle and blank
> that line before making the notebook public** — it lives in a git-tracked file.

**Step 5 — Smoke-test it first** (optional but recommended). Set `SMOKE_TEST = True` in
Step 0: 2 + 1 epochs on 60 images per class, a couple of minutes, and it exercises every
cell including the export. Set it back to `False` for the real run.

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
4. In the app open **Settings (gear)** → **Download** in the Offline AI Model section. This
   really fetches `/model/model.json`, every weight shard it lists and `classes.json`, writes
   them to OPFS, reads them back to verify, and only then shows "MODEL INSTALLED". If the
   files are not deployed you get a red "Install failed — HTTP 404 …" message instead of a
   false success. Then **switch the device to airplane mode** (or DevTools → Network →
   Offline), pick the crop, and scan a leaf photo.

> **Important:** online mode prefers Gemini (needs an API key). To force-test the local
> model, go offline or temporarily empty the Gemini key.

### Option B — Just test cloud diagnosis (no model needed)
Add a Gemini key in **Settings → API KEYS (THIS DEVICE)** and take/upload any leaf photo
with a connection: you'll get a Gemini diagnosis immediately — no training required.

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

### 15.4 The map says "The map needs internet", or shows "Error loading Google Maps"
- Offline, that is expected — the map needs its tiles from Google.
- No key on this device: the card says so and points at Settings.
- Key present but rejected: the card says Google rejected it. Check that the key has the
  Maps JavaScript API enabled and that its referrer restrictions allow this domain.

### 15.5 GPS is slow in Farm Advice
- Geolocation is debounced to one request per 5 seconds by design. A second tap reuses
  the default Odisha centre rather than blocking.

### 15.6 Dark mode looks off on some screens
- The app remaps white/black/borders to grays in dark mode via `index.css` overrides;
  shadows have named utilities (`shadow-brutal-sm/md/xl/…`) with dark variants.

---

## 16. PWA / Offline Notes

- **Installable:** add to home screen (manifest + service worker via vite-plugin-pwa).
- **Precache:** HTML/CSS/JS and static assets are precached by Workbox (`dist/sw.js`).
- **Hash routing:** all routes are `#/…` so no server rewrite is ever needed and deep
  links work offline.
- **Model files:** the `.bin` weights are kept **out** of the service-worker precache. The
  Settings download fetches them once and stores them as real files in **OPFS**
  (`storageService.js`), which survives cache clearing and is not evicted while the origin
  holds the persistent-storage grant. TF.js reads them back through a custom IOHandler.
- **Platform limit:** a PWA cannot write outside the browser sandbox, so this is "persistent
  and origin-private", not a file in the phone's Downloads folder. On iOS Safari `persist()`
  is unsupported and WebKit clears unused site storage after ~7 days — **Android/Chrome is
  the target platform.**
- **Images:** stored in IndexedDB via `services/imageStorage.js` (no 5 MB limit).

---

## 17. Known Issues & Roadmap

See `todo.md` for the live list. Remaining items:
- The district risk records in `multilingual_data.js` are **sample data** (e.g. the Ganjam →
  Khurda brown-planthopper record). The map demonstrates the layout; it is not live field
  reporting.
- Market prices + a few advisory cards use static demo data — wire to a real API.
- The leaf guard is a heuristic (green dominance + texture), not a classifier: soil and
  skin-toned frames can still pass it. The real fix is a trained `Other` class.
- `MIN_CONFIDENCE` / `MIN_MARGIN` / `LEAF_*` are initial estimates, never tuned against
  field photos.
- Classes the remedy dictionary cannot advise on are dropped by the notebook by default
  (`DROP_CLASSES_WITHOUT_REMEDY`), which currently excludes `Paddy_Leaf_Scald`.
- Geolocation debounce exists; a graceful "retry in a moment" prompt could be nicer UX.

**Nice-to-haves:** real Kaggle dataset sizes, ensemble of 2 models, on-device quantization
reporting, a field-photo dataset shot on the target phones.

---

*Built with 💡 by Crystal Studio Labs — Shuvransu Sekhar Sahoo, Snehal Kumar Moharana,
Subhankar Mohapatra, Pruthiraj Lenka.*
