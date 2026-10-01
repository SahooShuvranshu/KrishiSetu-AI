# 🛠️ Contributing to KrishiSetu AI

<div align="center">

[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md#pull-request-process)
[![Digital Public Good](https://img.shields.io/badge/Initiative-Digital_Public_Good-008080?style=for-the-badge)](README.md)
[![Frontend Core](https://img.shields.io/badge/Frontend-React_18_+_Vite_5-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](src/)
[![Offline ML](https://img.shields.io/badge/Edge_AI-TensorFlow.js_Layers-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](documentation/Document.md#11-the-offline-ml-engine)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Code of Conduct](https://img.shields.io/badge/Conduct-Enforced-blue?style=for-the-badge)](CODE_OF_CONDUCT.md)
[![Contact](https://img.shields.io/badge/Support-contact@sahooshuvranshu.is--a.dev-4285F4?style=for-the-badge)](mailto:contact@sahooshuvranshu.is-a.dev)

<br/>

**Thank you for your interest in contributing to KrishiSetu AI!**  
*Together, we are engineering offline-first, multilingual edge AI tools to protect smallholder farmers from crop disease.*

</div>

---

## 📑 Table of Contents
1. [🌟 Our Vision & Invariants](#1-our-vision--invariants)
2. [🧭 Ways to Contribute](#2-ways-to-contribute)
3. [💻 Local Development Setup](#3-local-development-setup)
4. [🧱 Architectural Invariants & Guardrails](#4-architectural-invariants--guardrails)
5. [🌿 Git & Pull Request Workflow](#5-git--pull-request-workflow)
6. [🧪 Testing & Verification Protocol](#6-testing--verification-protocol)
7. [🌐 Localization & Dialect Contributions](#7-localization--dialect-contributions)
8. [📧 Contact & Maintainer Support](#8-contact--maintainer-support)

---

## 🌟 1. Our Vision & Invariants

**KrishiSetu AI** ("The Agriculture Bridge") is an open-source Digital Public Good created for [**Build with AI: Code for Communities - Second Edition**](https://hack2skill.com/event/codeforcommunities2) (Track 4: AgriN & Regenerative Agriculture Intelligence — Theme: Cooperation • Problem Statement 4). 

Our core user is a smallholder farmer in rural Odisha standing in the middle of a remote paddy or cotton field with **zero cellular signal**. Every line of code, design choice, and model optimization must preserve these core promises:
- **100% Offline Diagnostic Capability**: The core pathology scanner must run entirely on-device via TensorFlow.js without requiring internet connectivity.
- **Universal Accessibility**: Remedies must be spoken aloud in the farmer's native dialect (Odia `ଓଡ଼ିଆ`, Hindi `हिन्दी`, English) using browser-native Web Speech API.
- **Sunlight Readability (Agri-Brutalism)**: High-contrast buttons, thick borders, and heavy typography ensure usability under direct, blinding sunlight with muddy hands.
- **Safety Over Speculation**: The app must refuse to answer when uncertain rather than hallucinating wrong pesticide dosages.

---

## 🧭 2. Ways to Contribute

We welcome contributions across diverse skill sets, from front-end engineering to agronomy data curation:

| Area | Description | Getting Started |
| :--- | :--- | :--- |
| 🐛 **Bug Reporting** | Identify UI flaws, memory leaks, PWA caching issues, or device-specific edge cases. | [Open a GitHub Issue](https://github.com/SahooShuvranshu/KrishiSetu-AI/issues) |
| 🌾 **Agronomy & Remedies** | Verify chemical dosages, recommend organic biopesticides, and curate Odisha crop schedules. | Edit [`src/data/offline_diseases.json`](src/data/offline_diseases.json) |
| 🧠 **ML & Model Training** | Train and fine-tune MobileNetV2 models using Google Colab T4 GPU acceleration. | Visit [`KrishiSetu-ML-Model`](https://github.com/Crystal-Studio-Labs/KrishiSetu-ML-Model) & read [`ModelTraining.md`](documentation/ModelTraining.md) |
| 🌐 **Localization** | Expand Odia dialects, refine Hindi phrasing, or add regional agricultural terms. | Edit [`src/i18n/translations.js`](src/i18n/translations.js) |
| 🎨 **UI / UX Design** | Improve outdoor accessibility, tactile feedback, focus traps, and responsive mobile layouts. | Inspect [`src/index.css`](src/index.css) & components |
| 📖 **Documentation** | Refine setup guides, create video tutorials, and improve architectural clarity. | Edit [`documentation/`](documentation/) |

---

## 💻 3. Local Development Setup

Follow these steps to set up KrishiSetu AI on your development machine:

### Prerequisites
- **Node.js**: v18.0.0 or higher (Node v20+ recommended)
- **npm**: v9.0.0 or higher
- **Modern Browser**: Chrome or Chromium-based browser (Edge, Brave) with Origin Private File System (OPFS) and WebGL support.

### Step-by-Step Installation

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/KrishiSetu-AI.git
cd KrishiSetu-AI

# 2. Install all project dependencies
npm install

# 3. Launch the Vite local development server
npm run dev
```

The application will be accessible at: **`http://localhost:5173`** (or `http://localhost:5174` if port 5173 is occupied).

### Available NPM Scripts
- `npm run dev`: Starts the local development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles production assets and generates Workbox PWA service workers in `dist/`.
- `npm run preview`: Locally serves the production `dist/` bundle for offline and PWA verification.
- `npm run lint`: Runs ESLint to check for syntax and style issues.

---

## 🧱 4. Architectural Invariants & Guardrails

When writing code for KrishiSetu AI, you must strictly uphold these architectural guardrails:

### 1. Zero API Keys in Client Bundles
> [!CAUTION]
> **NEVER** expose API keys in environment variables prefixed with `VITE_` intended for the client bundle. Any `VITE_*` variable is inlined into the public JavaScript bundle. KrishiSetu stores optional user-provided keys exclusively in `localStorage` on that specific device via `src/services/apiKeys.js`.

### 2. Persistent OPFS Model Storage
The trained TensorFlow.js model weights (`model.json`, `.bin` shards, `classes.json`) must live in the browser's **Origin Private File System (OPFS)**. Do not store multi-megabyte binary weights in `localStorage` or `sessionStorage`.

### 3. Binary Images in IndexedDB
Camera captures and uploaded leaves are saved directly to **IndexedDB** (`src/services/imageStorage.js`). Never store base64 image strings in `localStorage` (which enforces a 5MB domain quota and blocks the main thread).

### 4. Safety Gates & Heuristic Guards
The diagnosis pipeline in `src/services/offlineDiagnosis.js` relies on two essential safety barriers:
- **Non-Leaf Pixel Guard**: Rejects images lacking sufficient green/vegetative color distribution and texture variance.
- **Confidence & Margin Thresholds**: Requires `confidence >= 0.50` and a `margin >= 0.12` over the runner-up. **Never remove these gates** to prevent false certainty and hazardous chemical misuse.

---

## 🌿 5. Git & Pull Request Workflow

We follow a structured Git branching and PR workflow to ensure code stability:

### 1. Branch Naming Conventions
Use descriptive, hyphenated branch names prefixed by category:
- `feat/add-marathi-localization`
- `fix/camera-flip-aspect-ratio`
- `perf/opfs-shard-caching`
- `docs/update-colab-instructions`
- `refactor/soil-advisory-map`

### 2. Conventional Commit Standards
Write clear, imperative commit messages:
- `feat(scanner): add crop mask support for sugarcane`
- `fix(tts): handle browser speech cancellation on unmount`
- `docs(readme): add responsive mobile gallery`
- `perf(image): optimize canvas compression before inference`

### 3. Submitting a Pull Request
1. Ensure your local branch is rebased on `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout feat/your-feature
   git rebase main
   ```
2. Run the production build to ensure zero compilation or packaging errors:
   ```bash
   npm run build
   ```
3. Push to your fork and submit a PR against `SahooShuvranshu/KrishiSetu-AI:main`.
4. Provide a clear summary in the PR description detailing what changed, screenshots of UI changes, and instructions for how maintainers can test the change.

---

## 🧪 6. Testing & Verification Protocol

Before submitting code, verify the following scenarios locally:

### Offline Verification (Airplane Mode)
1. Run `npm run build && npm run preview`.
2. Open Chrome DevTools (`F12`) -> **Network** tab -> select **Offline**.
3. Navigate across tabs (`Home`, `Crop Doctor`, `Farm Advice`, `Settings`).
4. Perform an offline crop disease scan and verify that:
   - Inference completes in under 200ms.
   - Organic and chemical remedies render correctly.
   - Tapping **Play Audio** speaks the remedy in the selected language.

### Accessibility & Layout Verification
- Verify that all buttons and interactive elements maintain adequate touch targets (minimum 44x44px).
- Verify high contrast under simulated bright daylight.
- Ensure all modal dialogs support keyboard dismissal (`Escape` key) and focus trapping.

---

## 🌐 7. Localization & Dialect Contributions

KrishiSetu AI prioritizes trilingual support for rural India. If you speak **Odia (`ଓଡ଼ିଆ`)**, **Hindi (`हिन्दी`)**, or other regional Indian languages:

1. Open [`src/i18n/translations.js`](src/i18n/translations.js).
2. Add or refine missing translation keys ensuring phrasing reflects **colloquial agricultural terms** familiar to rural farmers rather than overly formal academic vocabulary.
3. If introducing a new language:
   - Add language metadata to `SUPPORTED_LANGUAGES`.
   - Provide a native fallback speech voice code for the Web Speech API in `src/services/tts.js`.

---

## 📧 8. Contact & Maintainer Support

If you need architectural guidance, have questions about model quantization, or wish to collaborate on broader field testing:

<div align="center">

| Role | Name | Email |
| :--- | :--- | :--- |
| **Project Lead** | Shuvransu Sekhar Sahoo | [**contact@sahooshuvranshu.is-a.dev**](mailto:contact@sahooshuvranshu.is-a.dev) |
| **Organization** | Crystal Studio Labs | Bhubaneswar, Odisha, India |

</div>

<br/>

*Thank you for contributing to an open, equitable, and sustainable agricultural future!* 🌾
