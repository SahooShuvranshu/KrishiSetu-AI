/**
 * Device-only API key store.
 *
 * Keys entered in Settings live in this browser's localStorage on the user's own
 * device. They are never bundled, never sent to a server, and never committed -
 * which is why NOTHING here reads `import.meta.env`. A key baked into the bundle
 * is a key published on the internet (it was, and it was verifiably in dist/).
 *
 * Storage name and shape are stable strings so the pure helpers below can be
 * unit-tested in Node without a browser.
 */

export const GEMINI_KEY_STORAGE = 'krishisetu_gemini_key';
export const MAPS_KEY_STORAGE = 'krishisetu_maps_key';

export const API_KEY_SLOTS = [
  {
    id: 'gemini',
    storageKey: GEMINI_KEY_STORAGE,
    labelKey: 'geminiKeyLabel',
    hintKey: 'geminiKeyHint',
    placeholder: 'AIza...'
  },
  {
    id: 'maps',
    storageKey: MAPS_KEY_STORAGE,
    labelKey: 'mapsKeyLabel',
    hintKey: 'mapsKeyHint',
    placeholder: 'AIza...'
  }
];

const slot = (id) => API_KEY_SLOTS.find((s) => s.id === id) || null;

/**
 * Normalise whatever the user pasted.
 *
 * People copy keys with a trailing newline, wrapped in quotes, or with the
 * "key=" label from a console page. Trimming those off is friendlier than
 * rejecting a key that is actually valid.
 */
export function normaliseKey(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^[A-Za-z_]+\s*[=:]\s*/, '')
    .trim();
}

/**
 * Google API keys (Gemini and Maps alike) start with "AIza" and are 39 chars.
 * This is a shape check to catch obvious paste mistakes, not authentication -
 * only Google can say whether a key is real, and a wrong-but-well-formed key
 * fails at request time with a clear error.
 */
export function looksLikeGoogleKey(value) {
  const key = normaliseKey(value);
  return key.startsWith('AIza') && key.length >= 30;
}

export function describeKey(value) {
  const key = normaliseKey(value);
  if (!key) return 'empty';
  return looksLikeGoogleKey(key) ? 'valid' : 'malformed';
}

/** "AIza...9f2c" - enough to recognise which key is installed, not enough to use. */
export function maskKey(value) {
  const key = normaliseKey(value);
  if (!key) return '';
  if (key.length <= 12) return key;
  return key.slice(0, 8) + '...' + key.slice(-4);
}

export function readApiKey(id, storage) {
  const target = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  const s = slot(id);
  if (!target || !s) return '';
  try {
    return normaliseKey(target.getItem(s.storageKey));
  } catch {
    // Private-mode browsers can throw on storage access.
    return '';
  }
}

/** Writes the key, or removes it when the value is blank. Returns the stored key. */
export function writeApiKey(id, value, storage) {
  const target = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  const s = slot(id);
  const key = normaliseKey(value);
  if (!target || !s) return '';
  try {
    if (key) target.setItem(s.storageKey, key);
    else target.removeItem(s.storageKey);
  } catch {
    // Storage full or blocked - the caller surfaces the failure to the user.
    return '';
  }
  return key;
}

export function clearApiKey(id, storage) {
  return writeApiKey(id, '', storage);
}

/** Which of the user's own keys are present, for the Settings status line. */
export function getKeyStatus(storage) {
  return API_KEY_SLOTS.reduce((acc, s) => {
    const value = readApiKey(s.id, storage);
    acc[s.id] = { present: !!value, shape: describeKey(value), masked: maskKey(value) };
    return acc;
  }, {});
}
