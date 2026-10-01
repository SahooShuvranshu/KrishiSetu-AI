# 📋 KrishiSetu AI — Task Checklist & Audit Log

<div align="center">

[![Audit Status](https://img.shields.io/badge/Audit_Status-100%25_Verified-brightgreen?style=for-the-badge)](Todo.md#verified-fixed-september-25-2026)
[![Critical Bugs](https://img.shields.io/badge/Critical_Bugs-0_Remaining-success?style=for-the-badge)](Todo.md#fixed-items-from-previous-sessions)
[![Hackathon Entry](https://img.shields.io/badge/Submission-Officially_Submitted-success?style=for-the-badge)](https://googleai.devpost.com/)
[![Scope](https://img.shields.io/badge/Scope-Odisha_Regional_Launch-FBBC05?style=for-the-badge)](Todo.md)
[![Build Health](https://img.shields.io/badge/Build_Health-0_Errors-4285F4?style=for-the-badge)](Todo.md)

<p>
  <strong>Audited Engineering Log:</strong> Verified bug resolutions, removed technical debt, and tracked remaining non-blocking polish items.
</p>

</div>

> [!NOTE]
> **Checklist Context**: Every completed item in this file was verified directly against the production codebase and runtime builds. All critical blockers (including model download handlers, OPFS state unloads, dead network fetches, and memory leaks) have been resolved.

---

## Fixed Items (From Previous Sessions)

- ✅ Leaflet CSS double-loading
- ✅ animate-fade-in CSS class
- ✅ Modals keyboard escape + scroll lock
- ✅ Select dropdown arrow
- ✅ console.log in production
- ✅ Dead data files deleted
- ✅ @supabase removed
- ✅ Error boundary added
- ✅ Google Fonts render-blocking
- ✅ Manifest theme_color
- ✅ PropTypes added
- ✅ Lazy loading
- ✅ Image compression
- ✅ IndexedDB for images
- ✅ vite-plugin-pwa
- ✅ Service worker precache
- ✅ Magic numbers centralized

## Fixed (September 6, 2026 Session)

### Architecture
- ✅ 2.1 Routing added (react-router-dom with HashRouter — works offline, deep-linkable)
- ✅ 2.2 Prop drilling removed (shared state moved to AppContext; `useApp()` hook in all tabs/Navbar)

### Code Quality
- ✅ 3.1 Shadow styling unified (all inline `shadow-[...]` replaced with named Tailwind utilities)
- ✅ 3.2 Gemini API key no longer in plaintext localStorage
- ✅ 3.3 Unused imports removed

### Low Priority
- ✅ 4.1 Geolocation debounced (`services/geolocation.js` — 5s cooldown, reused by CameraScan + SoilAdvisory)
- ✅ 4.2 Focus trap added to modals (`components/FocusTrap.jsx`)

---

## Verified Fixed (September 25, 2026)

The two items the previous edition of this file still listed as open:

- ✅ 1.1 **Fake model download** — `AppContext.downloadModel()` now fetches
  `/model/model.json`, parses the manifest, fetches every weight shard it names
  plus `classes.json`, writes them to OPFS, reads them back to verify, and only
  then reports installed. A missing deployment surfaces as a real
  `HTTP 404 …` error instead of a false "MODEL INSTALLED".
- ✅ 1.2 **`removeModel()` did not clear the in-memory model** — it now calls
  `unloadLocalModel()` (`services/modelStorageService.js`), so the next scan
  loses the stale `localModel` / `classNames` and reloads from device storage.

## Fixed (September 25, 2026 Session)

### Dead code removed
- ✅ Deleted `src/services/firebase.js` — it imported `firebase/app` and
  `firebase/firestore`, but `firebase` is **not** in `package.json`, so any
  import of it would break the build.
- ✅ Deleted `src/components/StateTelemetryMap.jsx` — the only file that
  imported the module above, and no route rendered it (`App.jsx` routes only
  Home / Scan / Advisory).
- ✅ `grep` confirms no remaining references in `src/` or `api/`;
  `npm run build` passes.

### Dead network paths removed
- ✅ `services/tts.js` no longer POSTs to `/api/tts`. No backend ever served it,
  so every call paid for a failed request before reaching the Web Speech API —
  which is what actually spoke. Speech now goes straight to the Web Speech API,
  and the `VOICE_CONFIG` / `AUDIO_CONFIG` / audio-blob helpers that existed only
  to build the request are gone.
- ✅ `services/translation.js` no longer POSTs to `/api/translate`. It keeps only
  the pure helpers (`LANGUAGE_CODES`, `getLanguageName`, `isLanguageSupported`);
  `translateText` / `translateBatch` went with the fetch.
- ✅ Removed `translateDynamicText` from `src/translations.js` — it was unused and
  existed solely to wrap the dead fetch.
- ✅ `services/voice.js` now re-exports the Web Speech implementation instead of
  fronting a Cloud TTS call.

### Docs, landing page and sitemap brought in line with the code
- ✅ Rewrote `.speckit/spec.md` as a spec of the app as built; the never-built
  features now sit in an explicit "Removed Features" table.
- ✅ Repurposed `.speckit/dpi-spec.json` — it described a cross-state telemetry
  envelope; it is now the district-risk record schema the app actually ships.
- ✅ Rewrote `model_train.md`. The 700-line Vertex AI / service-account / storage
  bucket guide is gone; it documents the Colab + TF.js procedure instead.
- ✅ `docs/index.html`: dropped the Vertex AI keyword, corrected the offline-model
  (OPFS, not IndexedDB), translation, voice and market-price claims in all three
  languages, and deleted the FAQ line that still promised an "anonymous disease
  alert".
- ✅ Added `docs/sitemap.xml` + `docs/robots.txt` for the landing origin, and
  `public/sitemap.xml` + `public/robots.txt` for the app origin; canonical /
  `og:url` now point at the real landing host.
- ✅ Fixed the SPA fallback in `vercel.json` to
  `/((?!assets/|model/|api/).*)`. A missing model file used to be rewritten to
  `index.html` and returned with status **200**, so the app's intended
  "HTTP 404 - the model files are not on the server yet" message could never
  appear - `JSON.parse()` got HTML and threw a `SyntaxError` instead.
- ✅ `README.md` landing badge, `CONTRIBUTING.md` code fences (they contained a
  literal backspace byte), `public/model/README.md` (named the wrong notebook),
  `Document.md` and `Ppt.txt` all corrected.

---

## Remaining Issues

### Code / wiring

- [ ] M.1 **`MarketPrices.jsx` is still fake.** The card ships a hardcoded
      `MARKET_DATA` object and "refreshes" it with a `setTimeout` plus random
      price drift — but `api/mandi.js` already exists and proxies data.gov.in
      server-side with edge caching. Call `/api/mandi` and keep the static table
      as the offline fallback. Requires `MANDI_API_KEY` (or `VITE_DATA_GOV_KEY`)
      set in the Vercel project.
- [ ] M.2 **District risk records are sample data.** `src/multilingual_data.js`
      ships hand-written records, not live field reports. Label them as demo
      data in the UI or replace them.
- [ ] M.3 **The leaf guard is a heuristic.** `assessLeafPixels` uses green share
      plus luminance variance (`LEAF_MIN_DETAIL` / `LEAF_MIN_FRACTION` /
      `LEAF_HARD_FRACTION` in `src/config/constants.js`), not a classifier —
      soil and skin-toned frames can still pass. The real fix is the trained
      `Other_NotALeaf` class fed with real negatives.
- [ ] M.4 **Thresholds are untuned.** `MIN_CONFIDENCE` (0.5), `MIN_MARGIN`
      (0.12), `OTHER_MIN_CONFIDENCE` (0.6) and the `LEAF_*` values are reasoned
      starting points, never measured against labelled field photos. Revisit
      once 2.1 has data.
- [ ] M.5 **Geolocation has no retry feedback.** The 5s debounce silently reuses
      the default Odisha centre on a second tap; a "retry in a moment" prompt
      would be clearer.

### Model (blocked on data, not code)

- [ ] 2.1 **Collect field photos** — 100–200 per class shot on the demo phone,
      plus real negatives (soil, sky, hand, blur). Worth more than any model or
      code change available in the remaining time.
- [ ] 2.2 **Symptom tags + 2-question fallback** — a `tags[]` of
      farmer-observable signs per dictionary record, and when the gate says
      "uncertain", ask the one question that best splits the surviving
      candidates. Offline, deterministic, two taps.
- [ ] 2.3 **Climate priors** — a bundled `zone → month → humidity` table so
      "blast is common in coastal Odisha in humid Kharif" becomes a re-ranking
      term. Rules, not a model.
- [ ] 2.4 **Retrain** with the field photos + `Other_NotALeaf` + the chosen
      `ALPHA`, then re-run the notebook's Step 9 contract checks.
- [ ] 2.5 **Verify dataset sizes** — the figures in `model_train.md` were never
      confirmed against Kaggle.

### Docs / submission ✅ (Completed & Submitted)

- [x] 3.1 **Record demo video** (scene-by-scene walkthrough script in `Script.md` / `Ppt.txt` with 10-shot mobile UI cues).
- [x] 3.2 **Add demo video & showcase gallery to `README.md`** (mobile portrait showcase gallery embedded with direct links).
- [x] 3.3 **Prepare and submit hackathon entry** (officially submitted to Google AI Hackathon 2026 — Code for Communities).

---

*Last updated: October 1, 2026 (Hackathon Entry Submitted)*
