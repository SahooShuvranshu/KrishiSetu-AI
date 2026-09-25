# SpecKit: KrishiSetu AI Specification

> **Last updated:** September 25, 2026
> **Status:** describes the app **as built**. Sections that were aspirational or
> described removed features are called out under [Removed](#6-removed-features).

## 1. Executive Summary

- **Project name**: KrishiSetu AI (`krishisetu-ai`)
- **Hackathon**: Google AI Hackathon 2026 — Code for Communities
- **Track / theme**: Problem Statement 4 — Cooperation / Digital Public Infrastructure
- **Focus region**: Odisha, India (paddy, maize, cotton, tomato, potato)
- **Team**: Crystal Studio Labs
- **App (live)**: https://krishi-setu-ai-seven.vercel.app/
- **Landing page**: https://sahooshuvranshu.is-a.dev/KrishiSetu-AI/
- **Shape**: an offline-first Progressive Web App with **no backend of its own**

## 2. Users & Context

Small and marginal farmers in low-connectivity Odisha, many of whom read neither
English nor a pesticide label. The design consequences that follow from that:

- must work with **no network** for the core job (diagnosis + remedy)
- must **speak** the advice, not only print it
- must **refuse to guess** rather than name a disease it is unsure of
- must run on the phone the farmer already owns

## 3. Core Functional Requirements

### 3.1 Crop diagnostic (the primary loop)

- **Input**: a photo from the camera or the gallery, plus a crop selected by the
  farmer (Paddy / Maize / Cotton / Tomato / Potato / General).
- **Path selection**: `navigator.onLine` decides. Online → Gemini. Offline → the
  on-device TensorFlow.js model. The farmer does not choose.
- **Offline preprocessing**: `224×224×3`, pixels divided by 255 to `[0, 1]`.
- **Output**: an object carrying `crop_name`, `disease_name`, `confidence`,
  `organic_remedy`, `chemical_remedy` and regenerative `advice`, in the selected
  language, with an optional spoken readout.
- **Refusal states**: a confident diagnosis, a **"Not Sure"** card when the
  quality gates fail, or **"No Leaf Detected"** when the frame is not a leaf.

### 3.2 Three-tier diagnostic engine

| Tier | Mechanism | Runs |
|---|---|---|
| 1 | Gemini API (`gemini-3.6-flash`, falling back to `gemini-1.5-flash`) via a user-supplied key | Online |
| 2 | MobileNetV2 classifier exported to TensorFlow.js Layers, stored in **OPFS** | Offline |
| 3 | Bundled symptom → remedy dictionary, `src/data/offline_diseases.json` | Always |

Tier 2 and Tier 3 are what make the product work with no connection. Tier 1 is
the open-ended quality tier and is optional.

### 3.3 Language and voice

- UI and advice in **English, Odia, Hindi**, from a bundled dictionary
  (`src/translations.js`). There is **no translation API** — see §6.
- Remedies are spoken with the **Web Speech API** (`src/services/tts.js`), which
  needs no key and works offline.

### 3.4 District risk map

- Google Maps view of district-level pest/disease risk for Odisha, at the top of
  the Farm Advice tab.
- The records ship **with the app**, so the list renders offline; only the map
  tiles need a connection.
- The records are **sample data**, not live field reports. The data contract is
  described in `dpi-spec.json`.

### 3.5 Environmental and market context

- **Weather**: zone-level forecast from Open-Meteo (free, no key).
- **Crop calendar**: season-aware (Kharif / Rabi / Zaid) guidance for Odisha.
- **Market prices**: a **bundled** commodity table that works offline. A
  serverless proxy for the government mandi feed (`api/mandi.js`) exists but is
  **not yet called by the client** — prices shown today are indicative, not live.
- **Soil zones**: five Odisha agro-climatic zones with crop-rotation advice.

## 4. Quality Gates (safety requirements)

A wrong pesticide dose is worse than no answer, so these are requirements, not
tuning knobs. Values live in `src/config/constants.js`.

| Gate | Value | Behaviour |
|---|---|---|
| Crop mask | farmer's crop | Score only that crop's diseases; renormalise, so `P(disease \| crop)` is comparable across crops |
| `MIN_CONFIDENCE` | 0.5 | Below → "Not Sure" |
| `MIN_MARGIN` | 0.12 | 51% vs 49% → "Not Sure" |
| `OTHER_MIN_CONFIDENCE` | 0.6 | `Other_NotALeaf` claim → "No Leaf Detected". Checked on **raw** probabilities, before the crop mask |
| `LEAF_MIN_DETAIL` | 10 | Luminance stddev; a blank wall or sky fails |
| `LEAF_MIN_FRACTION` | 0.12 | Plant-coloured share for a confident "leaf" |
| `LEAF_HARD_FRACTION` | 0.06 | Below this, do not run the model at all |

> The `MIN_*` and `LEAF_*` values are reasoned starting points, never tuned
> against labelled field photos. The leaf guard is a heuristic, not a classifier.

## 5. Architecture, Storage & Security

- **Frontend**: React 18 + Vite 5, TailwindCSS (custom "Agri-Brutalism" theme),
  `react-router-dom` v7 with **HashRouter** (offline-safe, no server rewrites).
- **Tabs**: three lazy-loaded routes — `#/` Home, `#/scan` Crop Doctor,
  `#/advisable` Farm Advice. Shared state via `AppContext` (`useApp()`).
- **Routing/storage**:

| Data | Where | Why |
|---|---|---|
| Model files | **OPFS** (`navigator.storage.getDirectory()`) | Real files, survive a cache clear, not evicted while persistent storage is granted |
| Scan images | IndexedDB | No 5 MB localStorage limit |
| Preferences | localStorage | Language, theme, auto-detect |
| API keys | localStorage, **device only** | Never bundled, never sent to a server |

- **Security stance**: the app reads **no key from the build environment**. A
  `VITE_*` value is inlined into `dist/` and therefore public — this was a real
  incident, so keys are entered in-app (Settings → API KEYS) instead.
- **Offline shell**: `vite-plugin-pwa` + Workbox precaches HTML/CSS/JS and static
  assets. Manifest theme colour `#f4f4f5`, installable, portrait, standalone.
- **No accounts, no auth, no server-side user data.**

## 6. Removed Features

These appeared in earlier editions of this spec. They were never built, or were
built and have since been deleted. They are **not** requirements.

| Removed | Note |
|---|---|
| **Cross-State Cooperation Grid** | District detection logs broadcast to adjacent states, JSON-LD outbreak vectors, a Live OpenStreetMap dashboard. All removed. |
| **Firebase** | Alert sync, the broadcast button and the Alerts tab were deleted; `services/firebase.js` no longer exists. Nothing syncs across devices. |
| **Vertex AI** | Never used. The notebook trains on Colab and exports straight to TF.js. |
| **Google Translation API** | Never had a backend. The dead `/api/translate` call was removed; the bundled dictionary is what runs. |
| **Google Cloud TTS** | Never had a backend. The dead `/api/tts` call was removed; the Web Speech API is what speaks. |
| **Six-plus languages** | Marathi, Tamil, Telugu, Punjabi were listed; only English, Odia and Hindi ship. |
| **`indexeddb://krishisetu-model`** | The model tier moved from IndexedDB to **OPFS** (`krishisetu-model` directory). |
| **Server-side audio/text endpoints** | No `/api/translate` or `/api/tts` handler has ever been deployed. |

## 7. Non-Goals

- A local LLM on the device (0.3–2 GB, worse than a 2 MB CNN at lesion texture).
- Multi-label detection, growth-stage classification, or new disease classes.
- Cross-state data sharing — the app has no backend to share through.
- A native Android/iOS build.

## 8. Known Gaps

See `todo.md` for the live list. The headline items:

1. No trained model is committed (model files are git-ignored) and **no field
   photos** have been collected — the largest risk to demo accuracy.
2. Market prices are not wired to `api/mandi.js`; the mandi feed is unused.
3. The district risk records are sample data and are not labelled as such in the UI.
4. `Other_NotALeaf` exists in the app but its training negatives are synthetic.
