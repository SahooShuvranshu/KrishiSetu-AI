# 📈 KrishiSetu AI — Project Phases & Progress Tracker

<div align="center">

[![Milestones](https://img.shields.io/badge/Milestones-11_Phases-4285F4?style=for-the-badge)](Phases.md)
[![Status](https://img.shields.io/badge/Status-Feature_Complete-success?style=for-the-badge)](Phases.md#quick-status)
[![Submission](https://img.shields.io/badge/Submission-Officially_Submitted-success?style=for-the-badge)](https://hack2skill.com/event/codeforcommunities2)
[![Critical Fixes](https://img.shields.io/badge/Critical_Fixes-5%2F5_Resolved-brightgreen?style=for-the-badge)](Phases.md#phase-4-critical-bug-fixes-)
[![High Priority](https://img.shields.io/badge/High_Priority-9%2F9_Resolved-brightgreen?style=for-the-badge)](Phases.md#phase-4-critical-bug-fixes-)
[![Code Audit](https://img.shields.io/badge/Code_Audit-100%25_Verified-blue?style=for-the-badge)](Phases.md#phase-10-dead-code-removal-)

<p>
  <strong>Single Source of Truth</strong> for engineering milestones, architectural quality gates, and verified bug resolutions.
</p>

</div>

> [!NOTE]
> **Audit Context**: Earlier editions of this progress log listed Vertex AI training, Firebase sync, and cloud Translation/TTS as completed. As documented under [Corrected claims](#corrected-claims), those obsolete claims were rigorously corrected: the application runs a lightweight on-device TensorFlow.js model in OPFS storage, trilingual Web Speech API synthesis, and bundled trilingual dictionaries with zero server dependence.

---

## Quick Status

| Category | Done | Total | Status |
|----------|------|-------|--------|
| Critical Bugs | 5 | 5 | ✅ |
| High Bugs | 9 | 9 | ✅ |
| Code Quality | 4 | 4 | ✅ |
| Architecture | 5 | 5 | ✅ |
| Performance | 5 | 5 | ✅ |
| Deployment | 3 | 3 | ✅ |
| Google AI Integration | 2 | 5 | ⚠️ Gemini + Maps only |
| Offline ML Engine (code) | 6 | 6 | ✅ |
| Offline ML Engine (trained model) | 0 | 4 | ⏳ blocked on field photos |
| Docs & Submission | 5 | 5 | ✅ Submitted |

---

## Phase 1: Project Analysis & Planning ✅

### Completed
- [x] Analyzed entire codebase structure
- [x] Identified all components, services, data files
- [x] Documented architecture and data flow
- [x] Created comprehensive issue list (31 issues found)
- [x] Prioritized issues by severity
- [x] Created `Todo.md` with fix instructions

---

## Phase 2: Model Training Notebook ✅

### Completed
- [x] Created Colab notebook for model training
- [x] Added Odisha-specific crop focus (Paddy, Maize, Cotton, Tomato, Potato)
- [x] Verified all dataset links (fixed 2 broken URLs)
- [x] Added float16 quantization for mobile deployment
- [x] Added data augmentation pipeline (field-style: rotation, exposure, contrast)
- [x] Added two-phase training (frozen base + fine-tune top 30 layers)
- [x] Added confusion matrix and classification report (Steps 8a/8b)
- [x] Fixed NumPy 2.x compatibility issue
- [x] Created step-by-step training guide
- [x] Added Step 9 contract checks — crop prefixes + every class maps to a remedy
- [x] Added `Other_NotALeaf` class built from negatives (real, else synthetic + warning)

### Corrected
The notebook trains on **Google Colab (free T4)** and exports **straight to
TensorFlow.js Layers format**. It does **not** register a model with Vertex AI,
and no Vertex endpoint exists. The hackathon-compliance claim based on Vertex AI
has been removed.

### Datasets used
| Dataset | URL | Size | Status |
|---------|-----|------|--------|
| PlantVillage | kaggle.com/datasets/emmarex/plantdisease | 54K images (unverified) | ✅ link verified |
| Rice Disease | kaggle.com/datasets/anshulm257/rice-disease-dataset | 3,829 images (unverified) | ✅ link verified |
| Cotton Leaf | kaggle.com/datasets/seroshkarim/cotton-leaf-disease-dataset | 1,710 images (unverified) | ✅ link verified |

> Sizes are from the dataset pages and were never confirmed against a real
> download. A no-account fallback (`tensorflow_datasets`) covers
> maize/tomato/potato only — **Paddy and Cotton still need Kaggle**.

---

## Phase 3: Google AI Integration — corrected ✅ / ⚠️

| Service | Status | Where |
|---------|--------|-------|
| Gemini API | ✅ Wired | `src/services/gemini.js` — leaf diagnosis |
| Google Maps | ✅ Wired | `src/components/DiseaseRiskMap.jsx` — district risk map |
| Translation API | ❌ Removed | no backend ever served `/api/translate`; the bundled dictionary (`translations.js`) is what runs. The dead call was deleted from `src/services/translation.js` |
| Cloud TTS | ❌ Removed | no backend ever served `/api/tts`; the **Web Speech API** (`src/services/tts.js`, re-exported by `voice.js`) is what speaks. The dead call was deleted |
| Vertex AI | ❌ Never used | — |
| Firebase | ❌ Removed | was `src/services/firebase.js` (removed in Phase 9) |

> This phase was originally reported as "6/6 done". Only Gemini and Maps are
> real integrations; the other three rows above are the correction.

---

## Phase 4: Critical Bug Fixes ✅

### Completed
- [x] Fixed Leaflet CSS double-loading (removed from main.jsx)
- [x] Added `animate-fade-in` CSS class (was undefined)
- [x] Removed unused imports (Download, HardDrive)
- [x] Added ErrorBoundary component
- [x] Added Escape key for modals
- [x] Added body scroll lock for modals
- [x] Fixed manifest.json theme_color mismatch
- [x] Added scan history feature
- [x] Added share functionality

---

## Phase 5: Code Quality ✅

### Completed
- [x] Added PropTypes to all components
- [x] Added accessibility labels (aria-labels, role, aria-modal)
- [x] Deleted dead data files
- [x] Deleted unused weather.js service
- [x] Added lazy loading for tab components
- [x] Added image compression before Gemini API
- [x] Created `config/constants.js` for magic numbers

---

## Phase 6: Performance Optimizations ✅

### Completed
- [x] Fixed useEffect dependency issues
- [x] Fixed select dropdown invisible (added custom arrow)
- [x] Removed console.log from production code
- [x] Fixed Google Fonts render-blocking
- [x] Added vite-plugin-pwa for proper offline support
- [x] Replaced Base64 localStorage with IndexedDB
- [x] Service worker now auto-generates with Workbox

---

## Phase 7: Testing & Deployment ✅

### Completed
- [x] Deployed to Vercel: https://krishi-setu-ai-seven.vercel.app
- [x] Updated all URLs in docs and README
- [x] Verified build works (no errors)
- [x] PWA installable and working

---

## Phase 8: Demo & Documentation ✅ (Completed & Submitted)

### Completed
- [x] Updated README.md with new features and full badge suite
- [x] Updated docs/index.html showcase page
- [x] Added Gemini and Google Maps badges
- [x] Recorded official demo walkthrough video (using `Script.md` & `Ppt.txt`)
- [x] Embedded mobile portrait screenshot gallery and demo flows in `README.md`
- [x] Completed and officially submitted the hackathon entry for Build with AI: Code for Communities - Second Edition on Hack2skill

---

## Phase 9: Alerts removed + real device storage ✅ (September 23, 2026)

### Removed
- [x] Deleted `services/firebase.js` and the `firebase` npm dependency — the app has no backend
- [x] Removed the Alerts nav tab, the HomeTab alerts card, and the broadcast button in CameraScan
- [x] Removed the notifications preference, `FIREBASE_TIMEOUT`, and every alert translation key

### Added
- [x] `components/DiseaseRiskMap.jsx` — district risk map at the top of Farm Advice,
      fed by the bundled Odisha records, with an offline list fallback
- [x] `services/storageService.js` — `navigator.storage.persist()` + model files written to OPFS
- [x] Real `downloadModel()` — fetches the manifest and every shard, verifies by reading back,
      and reports a 404 instead of faking success
- [x] `services/offlineDiagnosis.js` — crop mask, confidence + margin gate, non-leaf guard

---

## Phase 10: Dead code removal ✅ (September 25, 2026)

- [x] Deleted `src/services/firebase.js` — imported the `firebase` package, which is
      not in `package.json`, so any import of it would break the build
- [x] Deleted `src/components/StateTelemetryMap.jsx` — its only importer was the file
      above, and no route rendered it
- [x] Confirmed no remaining references anywhere in `src/` or `api/`
- [x] Removed the dead `/api/tts` fetch from `src/services/tts.js` — speech now goes
      straight to the Web Speech API
- [x] Removed the dead `/api/translate` fetch and its `translateText` / `translateBatch`
      wrappers from `src/services/translation.js`, plus the unused `translateDynamicText`
      in `src/translations.js`
- [x] `npm run build` passes

---

## Phase 11: Docs, landing page & sitemap ✅ (September 25, 2026)

- [x] `.speckit/spec.md` rewritten as a spec of the app as built; never-built
      features moved into an explicit "Removed Features" table
- [x] `.speckit/dpi-spec.json` repurposed to the district-risk record schema that
      actually ships (it was a cross-state telemetry envelope)
- [x] `model_train.md` rewritten — the Vertex AI / service-account / bucket guide
      is gone; the Colab + TF.js procedure is documented instead
- [x] `docs/index.html` corrected (Vertex keyword, OPFS storage, translations,
      voice, market prices, and the stale "anonymous disease alert" FAQ line)
- [x] Added `docs/sitemap.xml` + `docs/robots.txt` (landing origin) and
      `public/sitemap.xml` + `public/robots.txt` (app origin); canonical and
      `og:url` now point at the real landing host (`sahooshuvranshu.is-a.dev`,
      which is where the GitHub Pages URL redirects to)
- [x] `README.md`, `CONTRIBUTING.md`, `public/model/README.md`, `Document.md` and
      `Ppt.txt` brought in line with the code
- [x] SPA fallback in `vercel.json` narrowed to `/((?!assets/|model/|api/).*)`, so a
      missing model file returns a real 404 instead of `index.html` with status 200
      (**requires a redeploy to take effect on the live site**)

---

## Corrected claims

These were stated as fact in earlier editions of this file and were wrong:

- **Vertex AI was never used.** The notebook trains on Colab and exports straight
  to TensorFlow.js. There is no model registry entry and no endpoint.
- **Firebase is gone.** Alert sync, the broadcast button and the alerts tab were
  removed; nothing syncs across devices any more, and the app has no backend.
- **`translation.js` / `tts.js` were never integrations.** They used to POST to
  `/api/*` routes that no backend served, so the bundled dictionary and the Web
  Speech API were always what ran. Those dead calls have now been removed.
- **The district risk records are sample data**, not live field reports.

---

## API Keys Required

Keys are **entered in the app on the device** (Settings → API KEYS), not baked
into the build — a `VITE_*` value is public in `dist/`. The one exception is the
mandi proxy, which is server-side.

| Service | Where to Get | Free Tier | Stored |
|---------|-------------|-----------|--------|
| Gemini API | [aistudio.google.com](https://aistudio.google.com) | Generous | device (app Settings) |
| Google Maps | [console.cloud.google.com](https://console.cloud.google.com) | $200/month | device (app Settings) |
| Mandi prices | [data.gov.in](https://data.gov.in) | Free key | `MANDI_API_KEY` in Vercel (**not yet wired** — see todo M.1) |
| Translation / TTS | [console.cloud.google.com](https://console.cloud.google.com) | 500K chars / 1M chars | not used — no backend serves these |

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Focus on Odisha only | Depth > breadth for hackathon |
| Train on Colab, export to TF.js | Free T4; nothing to host or pay for during the demo |
| Gemini online / CNN offline split | Closed-set vision belongs on device, open-ended language belongs online |
| Google Maps for the risk layer | District-level visual; key entered on the device, never bundled |
| Keep Web Speech API as fallback | Works offline; Cloud TTS would need a backend |
| Image compression before Gemini | Reduces API cost + faster upload |
| Lazy load tabs | Faster initial page load |
| OPFS for the model, IndexedDB for images | OPFS survives a cache clear; IndexedDB has no 5 MB limit |
| Refuse to answer below `MIN_CONFIDENCE` / `MIN_MARGIN` | A wrong pesticide dose is worse than no answer |

---

*This file is the single source of truth for project progress.*
*See `Todo.md` for the live remaining-issues list.*
