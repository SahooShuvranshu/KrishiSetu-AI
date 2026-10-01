// Pure helpers for the cloud diagnosis path: no SDK, no DOM, no i18n. Kept in
// their own module so they can be unit-tested in plain Node (the browser file
// pulls in the vendor SDK, which Node cannot resolve the same way).

// Error codes the scan screen maps to translated messages. A code rather than
// a string so the UI never has to pattern-match English.
export const CLOUD_ERROR_CODES = {
  keyMissing: 'CLOUD_KEY_MISSING',
  keyRejected: 'CLOUD_KEY_REJECTED',
  quota: 'CLOUD_QUOTA',
  modelUnavailable: 'CLOUD_MODEL_UNAVAILABLE',
  failed: 'CLOUD_FAILED'
};

export const cloudError = (code, message) => {
  const err = new Error(message || code);
  err.code = code;
  return err;
};

// Classify a raw SDK error so the user gets "your key was rejected" instead of
// a generic failure. Google signals auth problems as 400/401/403 together with
// "API key not valid" in the body; quota as 429.
export const classify = (err) => {
  const status = err && (err.status || err.code || (err.response && err.response.status));
  const text = String((err && err.message) || err || '').toLowerCase();
  if (status === 429 || text.includes('quota') || text.includes('rate limit') || text.includes('resource_exhausted')) {
    return cloudError(CLOUD_ERROR_CODES.quota, 'Gemini quota or rate limit reached');
  }
  if (
    status === 401 || status === 403 ||
    text.includes('api key not valid') || text.includes('api_key_invalid') ||
    text.includes('permission') || text.includes('unauthenticated')
  ) {
    return cloudError(CLOUD_ERROR_CODES.keyRejected, 'Gemini rejected the API key');
  }
  if (status === 404 || text.includes('not found') || text.includes('not supported')) {
    return cloudError(CLOUD_ERROR_CODES.modelUnavailable, 'The requested Gemini model is unavailable');
  }
  return cloudError(CLOUD_ERROR_CODES.failed, String((err && err.message) || err || 'Cloud diagnosis failed'));
};

/**
 * Pull one JSON object out of the model's reply.
 *
 * The prompt asks for bare JSON, but models still wrap it in ```json fences or
 * add a sentence around it. The old code only stripped fences and then called
 * JSON.parse on the whole string, so any extra prose threw and the scan quietly
 * fell back to the offline model. Scan for the first balanced { ... } instead,
 * ignoring braces inside strings.
 */
export function extractJsonObject(raw) {
  if (typeof raw !== 'string') return null;
  const text = raw.replace(/```(?:json)?/gi, '');
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// Split "data:image/jpeg;base64,XXXX" into its two useful halves.
export const splitDataUrl = (base64Image) => {
  if (typeof base64Image !== 'string' || !base64Image) {
    const err = new Error('IMAGE_LOAD_FAILED');
    err.code = 'IMAGE_LOAD_FAILED';
    throw err;
  }
  const comma = base64Image.indexOf(',');
  const header = comma === -1 ? '' : base64Image.slice(0, comma);
  const data = comma === -1 ? base64Image : base64Image.slice(comma + 1);
  const mimeMatch = /data:([^;]+)/.exec(header);
  return { mimeType: (mimeMatch && mimeMatch[1]) || 'image/jpeg', data };
};
