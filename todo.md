# KrishiSetu AI — Issues & Improvement Tracker

> Generated: August 24, 2026
> Total Issues: 30 | Focus: Odisha Only | Deadline: September 30, 2026

---

## Table of Contents
- [Priority 1: Critical Bugs (Fix First)](#priority-1-critical-bugs-fix-first)
- [Priority 2: High Bugs](#priority-2-high-bugs)
- [Priority 3: Architecture Issues](#priority-3-architecture-issues)
- [Priority 4: Code Quality](#priority-4-code-quality)
- [Priority 5: Performance](#priority-5-performance)
- [Notebook Status](#notebook-status)

---

## Priority 1: Critical Bugs (Fix First)

### 1.1 Fake Model Download
- **File:** `src/App.jsx` (line ~83)
- **Problem:** `downloadModel()` just sets a localStorage flag after 2-second setTimeout. No actual model files are fetched. User thinks they have offline AI but don't.
- **Current Code:**
  ```jsx
  const downloadModel = () => {
    setDownloading(true);
    setTimeout(() => {
      localStorage.setItem('krishisetu_model_downloaded', 'true');
      setModelDownloaded(true);
      setDownloading(false);
    }, 2000);
  };
  ```
- **Fix Instructions:**
  1. Add a real `public/model/` directory with TFJS model files (from Colab notebook)
  2. Implement actual fetch of model files from server or IndexedDB
  3. Show real download progress (bytes downloaded / total)
  4. Handle network errors during download
  5. Cache model in IndexedDB for true offline use
- **Estimated Effort:** 2-3 hours

### 1.2 removeModel() Only Clears Flag
- **File:** `src/App.jsx` (line ~91)
- **Problem:** `removeModel()` only removes localStorage flag. The in-memory `localModel` variable in `modelStorageService.js` persists. Model is still loaded.
- **Current Code:**
  ```jsx
  const removeModel = () => {
    localStorage.removeItem('krishisetu_model_downloaded');
    setModelDownloaded(false);
    // Does NOT clear IndexedDB or in-memory model
  };
  ```
- **Fix Instructions:**
  1. Add `unloadModel()` function to `modelStorageService.js` that sets `localModel = null` and `classNames = null`
  2. Clear IndexedDB store where model weights are cached
  3. Call `unloadModel()` from `removeModel()` in App.jsx
- **Estimated Effort:** 30 minutes

### 1.3 Hardcoded GPS in broadcastAlert()
- **File:** `src/components/CameraScan.jsx` (line ~86)
- **Problem:** Broadcast always uses Bhubaneswar coordinates (20.29, 85.82) regardless of farmer's actual location.
- **Current Code:**
  ```jsx
  const newAlert = {
    lat: 20.29,  // Always Bhubaneswar
    lng: 85.82,
    ...
  };
  ```
- **Fix Instructions:**
  1. Add geolocation state to CameraScan component
  2. Use `navigator.geolocation.getCurrentPosition()` on component mount
  3. Fall back to zone coordinates from `multilingual_data.js` if GPS fails
  4. Store coordinates in state and use in broadcastAlert()
- **Estimated Effort:** 1 hour

### 1.4 Leaflet CSS Double-Loaded
- **Files:** `src/main.jsx`, `src/components/StateTelemetryMap.jsx`
- **Problem:** `main.jsx` imports `leaflet/dist/leaflet.css` from npm, but `StateTelemetryMap.jsx` also dynamically injects Leaflet CSS from unpkg CDN. Two different versions conflict.
- **Fix Instructions:**
  - **Option A (Recommended):** Remove the dynamic injection from `StateTelemetryMap.jsx` and keep the npm import in `main.jsx`
  - **Option B:** Remove the npm import from `main.jsx` and keep the dynamic injection
  - **Option C:** Use `react-leaflet` properly (already in package.json but unused)
- **Estimated Effort:** 30 minutes

### 1.5 animate-fade-in CSS Class Undefined
- **Files:** `CameraScan.jsx`, `SoilAdvisory.jsx`, `StateTelemetryMap.jsx`, `App.jsx`
- **Problem:** Every component uses `animate-fade-in` in className but this class doesn't exist in `index.css` or `tailwind.config.js`. The animation does nothing.
- **Fix Instructions:**
  1. Add to `tailwind.config.js`:
     ```js
     keyframes: {
       'fade-in': {
         '0%': { opacity: '0' },
         '100%': { opacity: '1' },
       }
     },
     animation: {
       'fade-in': 'fade-in 0.3s ease-in-out',
     }
     ```
  2. Or add to `index.css`:
     ```css
     @keyframes fade-in {
       from { opacity: 0; }
       to { opacity: 1; }
     }
     .animate-fade-in {
       animation: fade-in 0.3s ease-in-out;
     }
     ```
- **Estimated Effort:** 10 minutes

---

## Priority 2: High Bugs

### 2.1 useEffect Dependency Issues
- **Files:** `SoilAdvisory.jsx`, `StateTelemetryMap.jsx`
- **Problem:**
  - `SoilAdvisory.jsx`: Weather useEffect depends on `[selectedSoil, isOnline]` — language change triggers unnecessary weather re-fetch
  - `StateTelemetryMap.jsx`: Map useEffect depends on `[isOnline, alerts, appLanguage]` — language change reinitializes entire Leaflet map
- **Fix Instructions:**
  1. In `SoilAdvisory.jsx`: Remove `appLanguage` from weather fetch dependencies (weather data is language-independent)
  2. In `StateTelemetryMap.jsx`: Split the useEffect into two — one for map init (depends on `isOnline`), one for markers (depends on `alerts`). Remove `appLanguage` from map init.
- **Estimated Effort:** 1 hour

### 2.2 Modals Have No Keyboard Escape
- **File:** `src/App.jsx`
- **Problem:** Settings and Info modals have:
  - No `onKeyDown` handler for Escape key
  - No `aria-modal` attribute
  - No focus trap (Tab leaves the modal)
  - Background scrolling not prevented
- **Fix Instructions:**
  1. Add `useEffect` with `keydown` listener for Escape key
  2. Add `aria-modal="true"` and `role="dialog"` to modal containers
  3. Add `useEffect` to lock body scroll when modal is open: `document.body.style.overflow = 'hidden'`
  4. Restore scroll on modal close: `document.body.style.overflow = 'unset'`
- **Estimated Effort:** 1 hour

### 2.3 Select Dropdown Invisible
- **File:** `src/components/SoilAdvisory.jsx`
- **Problem:** `<select>` uses `appearance-none` but has no custom dropdown arrow — indicator disappears on some Android browsers.
- **Fix Instructions:**
  1. Add custom arrow via CSS background:
     ```css
     select {
       background-image: url("data:image/svg+xml,..."); /* dropdown arrow SVG */
       background-repeat: no-repeat;
       background-position: right 0.5rem center;
       background-size: 1.5em 1.5em;
       padding-right: 2.5rem;
     }
     ```
  2. Or use a Tailwind plugin like `@tailwindcss/forms`
- **Estimated Effort:** 20 minutes

### 2.4 Console.log in Production
- **File:** `src/services/modelStorageService.js` (line 16)
- **Problem:** `console.log("Local TFJS Model loaded successfully!")` visible in production
- **Fix Instructions:**
  1. Remove all `console.log` statements
  2. Keep `console.warn` and `console.error` for debugging
  3. Or add a debug flag: `if (import.meta.env.DEV) console.log(...)`
- **Estimated Effort:** 10 minutes

### 2.5 Unused Imports in App.jsx
- **File:** `src/App.jsx` (line 2)
- **Problem:** `Download` and `HardDrive` imported from lucide-react but never used in JSX
- **Current Code:**
  ```jsx
  import { Settings, Info, X, Download, HardDrive, Languages, Github } from 'lucide-react';
  ```
- **Fix Instructions:**
  1. Remove unused imports: `Download`, `HardDrive`
  2. Or use them — add download progress indicator and model status icon
- **Estimated Effort:** 5 minutes

### 2.6 Gemini API Key in Plaintext localStorage
- **File:** `src/App.jsx`, `src/services/gemini.js`
- **Problem:** API key stored in plaintext `localStorage`, visible in DevTools
- **Fix Instructions:**
  - **Short term:** Add warning in UI that key is stored locally
  - **Long term:** Create a serverless function (Cloudflare Worker / Vercel Edge) that proxies Gemini API calls. Key stays server-side.
- **Estimated Effort:** 2-4 hours (serverless proxy)

### 2.7 weather.js Service Never Imported
- **File:** `src/services/weather.js`
- **Problem:** Complete weather service exists but no component uses it. `SoilAdvisory.jsx` does its own fetch.
- **Fix Instructions:**
  1. Import `getLocalWeather` in `SoilAdvisory.jsx`
  2. Replace the manual fetch with the service call
  3. Or delete `weather.js` if not needed
- **Estimated Effort:** 20 minutes

### 2.8 Unused Dependencies
- **File:** `package.json`
- **Problem:** `@supabase/supabase-js` is in dependencies but never imported
- **Fix Instructions:**
  1. Remove from `package.json`: `npm uninstall @supabase/supabase-js`
  2. Or implement server-side alert sync with Supabase
- **Estimated Effort:** 5 minutes (remove) or 4+ hours (implement)

### 2.9 Dead Data Files
- **Files:** `src/data/mock_telemetry.json`, `src/data/soil_crop_matrix.json`
- **Problem:** Both exist but are never imported. All data is hardcoded in `multilingual_data.js`.
- **Fix Instructions:**
  1. Delete unused files, OR
  2. Move hardcoded data from `multilingual_data.js` into these JSON files and import them
- **Estimated Effort:** 30 minutes

---

## Priority 3: Architecture Issues

### 3.1 No Routing — Manual Tab Switching
- **File:** `src/App.jsx`
- **Problem:** Uses `display: none/block` to switch tabs. Back button doesn't work, URL doesn't reflect current tab, can't share direct links.
- **Fix Instructions:**
  1. Install react-router-dom: `npm install react-router-dom`
  2. Create routes: `/scan`, `/advisory`, `/network`
  3. Use `<HashRouter>` for PWA compatibility
  4. Update Navbar to use `<Link>` components
- **Estimated Effort:** 2-3 hours

### 3.2 No Error Boundary
- **File:** All components
- **Problem:** If Gemini API throws or TFJS crashes, entire app crashes with no recovery UI.
- **Fix Instructions:**
  1. Create `src/components/ErrorBoundary.jsx`:
     ```jsx
     class ErrorBoundary extends React.Component {
       state = { hasError: false };
       static getDerivedStateFromError(error) {
         return { hasError: true };
       }
       render() {
         if (this.state.hasError) {
           return <div>Something went wrong. <button onClick={() => window.location.reload()}>Reload</button></div>;
         }
         return this.props.children;
       }
     }
     ```
  2. Wrap `<App />` in `<ErrorBoundary>` in `main.jsx`
- **Estimated Effort:** 1 hour

### 3.3 All State in App.jsx — Prop Drilling
- **File:** `src/App.jsx`
- **Problem:** 10+ `useState` hooks managing app-wide state (language, online, settings, model). Passed as props to every child.
- **Fix Instructions:**
  1. Create `src/context/AppContext.jsx` with React Context
  2. Move shared state (language, online status, settings) into context
  3. Use `useContext()` in child components instead of props
- **Estimated Effort:** 2-3 hours

### 3.4 Service Worker Doesn't Precache JS/CSS
- **File:** `public/sw.js`
- **Problem:** Only caches `/`, `/index.html`, `/manifest.json`, `/sprout.svg`. Vite's hashed JS/CSS bundles are not in precache list. First offline visit fails.
- **Fix Instructions:**
  1. Use `vite-plugin-pwa` which auto-generates precache manifest
  2. Or manually add Vite output files to `ASSETS_TO_CACHE`
  3. Or use Workbox's `precacheAndRoute` with `injectManifest` strategy
- **Estimated Effort:** 2 hours

### 3.5 No vite-plugin-pwa
- **File:** `package.json`, `vite.config.js`
- **Problem:** README claims PWA but no `vite-plugin-pwa`. Service worker manually registered — no auto cache busting.
- **Fix Instructions:**
  1. `npm install vite-plugin-pwa -D`
  2. Update `vite.config.js`:
     ```js
     import { VitePWA } from 'vite-plugin-pwa';
     plugins: [react(), VitePWA({ registerType: 'autoUpdate' })]
     ```
  3. Remove manual SW registration from `index.html`
- **Estimated Effort:** 1 hour

### 3.6 Google Fonts Render-Blocking
- **File:** `src/index.css` (line 1)
- **Problem:** `@import url('https://fonts.googleapis.com/...')` blocks first paint.
- **Fix Instructions:**
  1. Add to `index.html` `<head>`:
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
     ```
  2. Remove `@import` from `index.css`
- **Estimated Effort:** 10 minutes

### 3.7 Manifest Theme Color Mismatch
- **Files:** `public/manifest.json`, `index.html`, `tailwind.config.js`
- **Problem:** Three different theme colors:
  - manifest.json: `#e8f4ec` (light green)
  - index.html: `#f4f4f5` (gray)
  - tailwind.config.js: `brutal-bg: '#f4f4f5'` (gray)
- **Fix Instructions:**
  1. Standardize to `#f4f4f5` (matches Tailwind brutal-bg)
  2. Update `manifest.json`: `"theme_color": "#f4f4f5"`, `"background_color": "#f4f4f5"`
- **Estimated Effort:** 5 minutes

### 3.8 External CDN Without Integrity Hashes
- **File:** `src/components/StateTelemetryMap.jsx`
- **Problem:** Injects Leaflet from unpkg.com without `crossorigin` or `integrity` attributes. Security risk.
- **Fix Instructions:**
  1. Use the npm-installed leaflet package instead of CDN
  2. Or add integrity hash: `<script integrity="sha256-..." crossorigin="anonymous" src="...">`
- **Estimated Effort:** 30 minutes

---

## Priority 4: Code Quality

### 4.1 No PropTypes or TypeScript
- **Files:** All components
- **Problem:** Zero type validation. Easy to introduce silent bugs.
- **Fix Instructions:**
  1. Add PropTypes to each component:
     ```jsx
     import PropTypes from 'prop-types';
     CameraScan.propTypes = {
       isOnline: PropTypes.bool.isRequired,
       appLanguage: PropTypes.string.isRequired,
       t: PropTypes.func.isRequired,
     };
     ```
  2. Or migrate to TypeScript (larger effort)
- **Estimated Effort:** 2-3 hours (PropTypes) or 1-2 days (TypeScript)

### 4.2 Magic Numbers Everywhere
- **Files:** Multiple
- **Problem:**
  - `lat: 20.2961, lng: 85.8245` (weather.js)
  - `timeout: 5000` (SoilAdvisory)
  - `224, 224` (modelStorageService)
  - `20.29, 85.82` (CameraScan)
- **Fix Instructions:**
  1. Create `src/config/constants.js`:
     ```js
     export const ODISHA_CENTER = { lat: 20.2961, lng: 85.8245 };
     export const MODEL_INPUT_SIZE = 224;
     export const GPS_TIMEOUT = 5000;
     ```
  2. Import and use throughout codebase
- **Estimated Effort:** 1 hour

### 4.3 Inconsistent Shadow Styling
- **Files:** Multiple components
- **Problem:** Some use `shadow-brutal-hover` (Tailwind), others use inline `shadow-[2px_2px_0_0_#000]`. Same effect, two approaches.
- **Fix Instructions:**
  1. Standardize on Tailwind classes: `shadow-brutal`, `shadow-brutal-hover`, `shadow-brutal-lg`
  2. Replace all inline `shadow-[...]` with the defined classes
- **Estimated Effort:** 30 minutes

### 4.4 No Debouncing on Geolocation
- **File:** `src/components/SoilAdvisory.jsx`
- **Problem:** `getCurrentPosition` fires immediately on button click — can be called multiple times rapidly.
- **Fix Instructions:**
  1. Add debounce or disable button during location fetch
  2. Already partially handled with `locating` state, but could be improved
- **Estimated Effort:** 15 minutes

---

## Priority 5: Performance

### 5.1 No Lazy Loading of Components
- **File:** `src/App.jsx`
- **Problem:** All 3 tab components eagerly imported. TFJS imported at module level (~3MB).
- **Fix Instructions:**
  1. Use `React.lazy()` and `Suspense`:
     ```jsx
     const CameraScan = React.lazy(() => import('./components/CameraScan'));
     const SoilAdvisory = React.lazy(() => import('./components/SoilAdvisory'));
     const StateTelemetryMap = React.lazy(() => import('./components/StateTelemetryMap'));
     ```
  2. Wrap in `<Suspense fallback={<div>Loading...</div>}>`
- **Estimated Effort:** 30 minutes

### 5.2 No Image Compression Before Gemini
- **File:** `src/components/CameraScan.jsx`, `src/services/gemini.js`
- **Problem:** Raw base64 images sent to Gemini. 12MP photo = ~8-15MB base64.
- **Fix Instructions:**
  1. Add image compression before sending:
     ```js
     const compressImage = (base64, maxWidth = 512) => {
       return new Promise((resolve) => {
         const img = new Image();
         img.onload = () => {
           const canvas = document.createElement('canvas');
           const ratio = maxWidth / img.width;
           canvas.width = maxWidth;
           canvas.height = img.height * ratio;
           const ctx = canvas.getContext('2d');
           ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
           resolve(canvas.toDataURL('image/jpeg', 0.8));
         };
         img.src = base64;
       });
     };
     ```
  2. Call before `diagnoseCropLeaf()`
- **Estimated Effort:** 1 hour

### 5.3 Leaflet Map Reinitialized on Every Render
- **File:** `src/components/StateTelemetryMap.jsx`
- **Problem:** Creates new `L.map()` on every re-render when alerts change.
- **Fix Instructions:**
  1. Check if map already exists before creating
  2. Only add/remove markers on alert changes
  3. Use `useRef` to track map instance (already done, but not used properly)
- **Estimated Effort:** 1 hour

### 5.4 Base64 in localStorage (5MB Limit)
- **File:** `src/components/CameraScan.jsx`
- **Problem:** `localStorage.setItem('krishisetu_last_scan', base64String)` — localStorage has 5MB limit. Large photos silently fail.
- **Fix Instructions:**
  1. Use IndexedDB for storing images (unlimited storage)
  2. Or compress image before storing
  3. Or remove last-scan persistence (not critical)
- **Estimated Effort:** 1 hour

### 5.5 No Scroll Lock on Modals
- **File:** `src/App.jsx`
- **Problem:** Background scrolls when modal is open on mobile.
- **Fix Instructions:**
  1. Add `document.body.style.overflow = 'hidden'` when modal opens
  2. Restore with `document.body.style.overflow = 'unset'` when modal closes
- **Estimated Effort:** 15 minutes

---

## Notebook Status

### Completed
- [x] Rewrote notebook with Odisha-specific crop focus
- [x] Added step-by-step training guide
- [x] Added dataset download instructions (PlantVillage, Rice Leaf, Cotton Disease)
- [x] Added data augmentation pipeline
- [x] Added two-phase training (frozen base + fine-tune)
- [x] Added INT8 quantization
- [x] Added classification report + confusion matrix
- [x] Added government data sources documentation (IMD, FAOSTAT, data.gov.in, ISRO/Bhuvan)
- [x] Added model export to TensorFlow.js

### Pending
- [ ] Train model in Colab and verify accuracy
- [ ] Download trained model and place in `public/model/`
- [ ] Test model inference in browser
- [ ] Update `offline_diseases.json` to match new model classes

---

## Quick Wins (Do These First)

| # | Task | Time | Impact |
|---|------|------|--------|
| 1 | Add `animate-fade-in` CSS class | 10 min | Animations work |
| 2 | Remove unused imports (Download, HardDrive) | 5 min | Clean code |
| 3 | Fix manifest theme_color to #f4f4f5 | 5 min | Consistent branding |
| 4 | Remove console.log from modelStorageService | 10 min | No production logs |
| 5 | Delete unused data files or use them | 30 min | No dead code |
| 6 | Remove @supabase/supabase-js | 5 min | Smaller bundle |
| 7 | Fix Google Fonts loading | 10 min | Faster first paint |
| 8 | Add error boundary | 1 hour | App doesn't crash |

---

## Progress Tracker

| Category | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical Bugs | 5 | 0 | 5 |
| High Bugs | 9 | 0 | 9 |
| Architecture | 8 | 0 | 8 |
| Code Quality | 4 | 0 | 4 |
| Performance | 5 | 0 | 5 |
| **TOTAL** | **31** | **0** | **31** |

---

*Last updated: August 24, 2026*
