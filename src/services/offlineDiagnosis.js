// KrishiSetu AI - on-device diagnosis reasoning.
//
// Pure functions only: no DOM, no TensorFlow, no network, no i18n. Keeping the
// reasoning here (instead of inside the browser code) means it is unit-testable
// in Node, and the online path can reuse the same crop masking later.
import offlineDiseases from '../data/offline_diseases.json';
import {
  MIN_CONFIDENCE,
  MIN_MARGIN,
  OTHER_MIN_CONFIDENCE,
  LEAF_MIN_DETAIL,
  LEAF_MIN_FRACTION,
  LEAF_HARD_FRACTION
} from '../config/constants';

// Crop-picker id -> class-name prefix. Must match the `Crop_Disease` naming the
// training notebook writes in Step 3, e.g. Paddy_Blast.
export const CROP_PREFIXES = {
  paddy: 'Paddy',
  cotton: 'Cotton',
  tomato: 'Tomato',
  potato: 'Potato',
  maize: 'Maize'
};

export const cropPrefixFor = (cropId) =>
  CROP_PREFIXES[String(cropId || '').toLowerCase()] || null;

// Classes that are not a crop disease. `Other_*` is the notebook's negative
// class (soil, sky, a hand, a different plant, a blurry frame). It is checked
// before the crop mask on purpose: masking renormalises inside the crop, which
// would squeeze the one class that says "this is not your crop" down to nothing.
export const GLOBAL_PREFIXES = ['Other'];

export const isGlobalClass = (name) =>
  typeof name === 'string' && GLOBAL_PREFIXES.some((p) => name.indexOf(p + '_') === 0);

// Normalize "Paddy_Bacterial_Blight" -> " paddy bacterial blight "
export const normalize = (s) =>
  ` ${String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()} `;

// Best-matching remedy record for a predicted class name. Scores by crop match
// plus disease-keyword overlap so "Paddy_Blast" finds the Blast record rather
// than the first Paddy record.
// A record's display fields can be localised in place: the parallel `i18n`
// block carries Odia/Hindi text for the user-facing fields, while the English
// `disease_name` stays canonical so class matching never changes with language.
export const localizeProtocol = (record, lang) => {
  if (!record || !lang || lang === 'en') return record;
  const extra = record.i18n && record.i18n[lang];
  return extra ? { ...record, ...extra } : record;
};

export const lookupProtocol = (predictedClass, lang = 'en') => {
  const pred = normalize(predictedClass);
  const predWords = pred.split(' ').filter(Boolean);
  const cropWord = predWords[0] || '';

  let best = null;
  let bestScore = 0;

  for (const d of offlineDiseases) {
    const crop = normalize(d.crop_name).split(' ').filter(Boolean)[0] || '';
    if (crop && crop !== cropWord) continue;

    const hay = normalize(d.disease_name);
    const hayWords = hay.split(' ').filter(Boolean);
    let score = 0;
    for (let i = 0; i < hayWords.length; i++) {
      if (hayWords[i].length > 2 && predWords.includes(hayWords[i])) score += 1;
      const bigram = `${hayWords[i]} ${hayWords[i + 1] || ''}`.trim();
      if (bigram.includes(' ') && pred.includes(` ${bigram} `)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }

  return localizeProtocol(best, lang);
};

// Rank the model's output, restricted to the crop the farmer selected.
//
// Renormalising inside the crop is the point: with the crop known,
// P(disease | crop) is the honest number, and it keeps confidence comparable
// between a 5-class crop and the full class list. A crop never enters the
// running, and a tomato leaf can never be reported as paddy.
export function rankCandidates(predictions, classNames, cropId) {
  const all = [];
  for (let i = 0; i < predictions.length; i++) {
    all.push({
      index: i,
      name: classNames[i],
      p: Number(predictions[i]) || 0
    });
  }

  // Best non-crop class, on the raw (unmasked) probabilities. Null when the
  // trained model has no Other class, which is the case until the notebook is
  // re-run with TRAIN_OTHER_CLASS on.
  let global = null;
  for (const c of all) {
    if (isGlobalClass(c.name) && (!global || c.p > global.p)) global = c;
  }

  const prefix = cropPrefixFor(cropId);
  let pool = all;
  let masked = false;

  if (prefix) {
    const subset = all.filter(
      (c) => typeof c.name === 'string' && c.name.indexOf(prefix + '_') === 0
    );
    if (subset.length) {
      const total = subset.reduce((sum, c) => sum + c.p, 0);
      pool = total > 0 ? subset.map((c) => ({ ...c, p: c.p / total })) : subset;
      masked = true;
    }
  }

  pool.sort((a, b) => b.p - a.p);
  return { candidates: pool, masked, global };
}

// Decide whether the result is good enough to name a disease.
// Confidence alone is not enough: 51% vs 49% is a coin toss, so the margin
// between the top two candidates is checked as well.
export function gate(candidates, opts = {}) {
  const minConfidence = opts.minConfidence === undefined ? MIN_CONFIDENCE : opts.minConfidence;
  const minMargin = opts.minMargin === undefined ? MIN_MARGIN : opts.minMargin;
  const otherMin = opts.otherMinConfidence === undefined ? OTHER_MIN_CONFIDENCE : opts.otherMinConfidence;

  // A decisive Other answer wins over the crop: naming a paddy disease for a
  // photo of a hand is the failure this class exists to prevent.
  const global = opts.global;
  if (global && global.p >= otherMin) {
    return { status: 'not_a_leaf', confidence: global.p, margin: 0, top: null, other: global };
  }

  const top = candidates[0] || null;
  if (!top) {
    return { status: 'uncertain', confidence: 0, margin: 0, top: null };
  }

  const second = candidates[1] ? candidates[1].p : 0;
  const confidence = top.p;
  const margin = top.p - second;
  const status = confidence >= minConfidence && margin >= minMargin ? 'ok' : 'uncertain';

  return { status, confidence, margin, top };
}

// Cheap "is this even a usable photo?" test over raw RGBA pixels.
//
// Deliberately permissive. A diseased leaf is brown and yellow, so a strict
// green test would reject exactly the photos this app exists to diagnose. This
// only refuses the obviously unusable frame (a wall, sky, lens cap, black
// room); everything else is left to the confidence gate.
export function assessLeafPixels(pixels, width, height) {
  if (!pixels || !width || !height) {
    return { verdict: 'unclear', leafFraction: 0, detail: 0 };
  }

  let considered = 0;
  let plantish = 0;
  let seen = 0;
  let sum = 0;
  let sumSq = 0;

  for (let i = 0; i + 2 < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a !== undefined && a < 32) continue; // transparent

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    seen += 1;
    sum += lum;
    sumSq += lum * lum;

    if (lum < 12 || lum > 244) continue; // blown highlights / deep shadow
    considered += 1;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const greenish = g >= r && g >= b * 0.9;
    const tissue = sat > 0.12 && (greenish || (r > g && g > b)); // green or yellow/brown leaf tissue

    if (tissue) plantish += 1;
  }

  const leafFraction = considered ? plantish / considered : 0;
  const mean = seen ? sum / seen : 0;
  const detail = seen ? Math.sqrt(Math.max(0, sumSq / seen - mean * mean)) : 0;

  // Reject only when there is no sign of a leaf at all: either essentially no
  // plant colour anywhere, or no plant colour AND no texture. A blurred but
  // plant-coloured photo must NOT be rejected - a soft, out-of-focus shot of a
  // real leaf is a normal scan, and refusing it would be the worst failure this
  // guard could have.
  const featureless = detail < LEAF_MIN_DETAIL;
  let verdict = 'leaf';
  if (leafFraction < LEAF_HARD_FRACTION || (featureless && leafFraction < LEAF_MIN_FRACTION)) {
    verdict = 'no_leaf';
  } else if (leafFraction < LEAF_MIN_FRACTION) {
    verdict = 'unclear';
  }

  return { verdict, leafFraction, detail };
}

// Turn the numbers into the shape CameraScan already expects, plus the extra
// fields the result card now shows.
//
// An uncertain result still carries its best guess and remedy - withholding
// them would leave the farmer with nothing. The UI adds the warning instead.
// English fallbacks, so the pure decision layer stays usable (and testable)
// without a translation function. The browser wrapper passes localised ones.
export const OFFLINE_LABELS = {
  organic: 'Organic',
  chemical: 'Chemical',
  advice: 'Advice',
  fallbackOrganic: 'Maintain soil health.',
  fallbackChemical: 'Consult your local agriculture officer.'
};

export function composeOfflineResult({ candidates, gateResult, leaf, masked, cropId, lang = 'en', labels }) {
  const L = { ...OFFLINE_LABELS, ...(labels || {}) };
  const top = gateResult.top;
  const predicted = top ? top.name : '';
  const percent = (gateResult.confidence * 100).toFixed(1);

  const record = predicted ? lookupProtocol(predicted, lang) : null;
  const protocol = record || {
    organic_remedy: L.fallbackOrganic,
    chemical_remedy: L.fallbackChemical,
    regenerative_advice: ''
  };

  const label = record && record.disease_name
    ? `${record.crop_name || 'Crop'}: ${record.disease_name}`
    : predicted;

  // Same three sections as the Gemini path, so the offline farmer is not shown
  // a thinner answer than the online one just because the dictionary has more
  // fields than the old card rendered.
  let treatment = `${L.organic}: ${protocol.organic_remedy}\n\n${L.chemical}: ${protocol.chemical_remedy}`;
  if (protocol.regenerative_advice) {
    treatment += `\n\n${L.advice}: ${protocol.regenerative_advice}`;
  }

  return {
    status: gateResult.status,
    disease: `${label} (${percent}%)`,
    treatment,
    confidence: gateResult.confidence,
    margin: gateResult.margin,
    masked: !!masked,
    cropId: cropId || 'general',
    leaf: leaf || null,
    candidates: candidates.slice(0, 3).map((c) => ({
      name: c.name,
      p: Math.round(c.p * 1000) / 1000
    }))
  };
}
