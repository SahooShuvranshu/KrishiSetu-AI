import { GoogleGenAI } from '@google/genai';
import { getTranslation } from '../translations';
import { readApiKey } from './apiKeys';
import {
  CLOUD_ERROR_CODES,
  cloudError,
  classify,
  extractJsonObject,
  splitDataUrl
} from './geminiParsing';

// Re-exported so the scan screen keeps importing its error codes from one place.
export { CLOUD_ERROR_CODES, extractJsonObject };

// The app passes a short code ('en' / 'or' / 'hi'). Handing that straight to the
// prompt asked Gemini to answer "in hi", so it often replied in English or in
// mixed script. Map the code to a real language name for the instruction.
const LANG_NAMES = {
  en: 'English',
  or: 'Odia (ଓଡ଼ିଆ)',
  hi: 'Hindi (हिन्दी)'
};

// Two newline characters, for the blank line between treatment sections.
const GAP = String.fromCharCode(10, 10);

// Stable Flash models, newest first, from the Gemini API model list
// (ai.google.dev/gemini-api/docs/models). Verified against that list on
// 2026-09-26. The retired name that used to live here
// (gemini-1.5-flash, shut down 2025) made EVERY cloud request 404, which the
// scan screen then reported as "using the offline model" - so the key looked
// broken when the model name was. Refresh this list when Google retires a
// model, and keep explicit version names (not the "latest" alias, which
// hot-swaps under a production app).
const MODEL_CHAIN = ['gemini-3.8-flash', 'gemini-3.6-flash'];

export async function diagnoseCropLeaf(base64Image, language = 'en') {
  const languageName = LANG_NAMES[language] || 'English';
  // The user's own key, from this device. Deliberately no import.meta.env
  // fallback: a key in the bundle is a key published in dist/.
  const API_KEY = readApiKey('gemini');

  if (!API_KEY) {
    throw cloudError(
      CLOUD_ERROR_CODES.keyMissing,
      'No Gemini API key on this device. Add yours in Settings or switch to the offline model.'
    );
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `You are a world-class agricultural pathologist in India.
Diagnose this crop leaf image accurately for Indian farming conditions.
Return strictly a valid JSON object (no markdown formatting, no code blocks) with exact structure:
{
  "crop_name": "Name of crop (e.g. Rice, Wheat, Cotton, Tomato, Groundnut)",
  "disease_name": "Name of disease or 'Healthy'",
  "confidence": 88,
  "severity": "Low" | "Moderate" | "High" | "Outbreak",
  "symptoms": "Detailed symptoms in ${languageName}",
  "organic_remedy": "Organic / biological treatment in ${languageName}",
  "chemical_remedy": "Chemical treatment dosage in ${languageName}",
  "regenerative_advice": "Soil & crop rotation advice for sustainable recovery in ${languageName}"
}`;

  const { mimeType, data } = splitDataUrl(base64Image);

  const contents = [
    {
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data } }
      ]
    }
  ];

  // Try each model in the chain. An unavailable model (retired name, regional
  // gap) should not end the cloud path while a newer one still works; anything
  // else - a rejected key above all - must surface immediately rather than
  // burn through the chain.
  let lastError = null;
  let responseText = null;
  for (const model of MODEL_CHAIN) {
    try {
      const response = await ai.models.generateContent({ model, contents });
      const text = response.text;
      if (text && text.trim()) {
        responseText = text;
        break;
      }
      lastError = cloudError(CLOUD_ERROR_CODES.failed, 'Gemini returned an empty response');
    } catch (err) {
      const classified = classify(err);
      console.warn(`Gemini model ${model} failed`, err);
      if (classified.code === CLOUD_ERROR_CODES.keyRejected || classified.code === CLOUD_ERROR_CODES.quota) {
        throw classified;
      }
      lastError = classified;
    }
  }

  if (!responseText) {
    throw lastError || cloudError(CLOUD_ERROR_CODES.failed, 'No Gemini model responded');
  }

  const jsonText = extractJsonObject(responseText);
  if (!jsonText) {
    throw cloudError(CLOUD_ERROR_CODES.failed, 'Gemini did not return the expected JSON');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw cloudError(CLOUD_ERROR_CODES.failed, 'Gemini returned malformed JSON');
  }

  // Without a disease name there is nothing worth showing. Treat it as a cloud
  // failure so the caller falls back to the on-device model, which always has
  // a name to give.
  if (!parsed || (!parsed.disease_name && !parsed.crop_name)) {
    throw cloudError(CLOUD_ERROR_CODES.failed, 'Gemini returned no diagnosis');
  }

  // Section labels are translated, and a section the model left out is dropped
  // rather than printed as "undefined".
  const label = (key, fallback) => {
    const value = getTranslation(language, key);
    return value && value !== key ? value : fallback;
  };

  const sections = [
    parsed.symptoms ? `${label('symptomsLabel', 'Symptoms')}: ${parsed.symptoms}` : null,
    `${label('organicLabel', 'Organic')}: ${parsed.organic_remedy || ''}`.trim(),
    `${label('chemicalLabel', 'Chemical')}: ${parsed.chemical_remedy || ''}`.trim(),
    parsed.regenerative_advice ? `${label('advice', 'Advice')}: ${parsed.regenerative_advice}` : null
  ].filter(Boolean);

  const confidence = Number(parsed.confidence);

  return {
    status: 'ok',
    disease: `${parsed.crop_name || 'Crop'}: ${parsed.disease_name || 'Unknown'}`,
    treatment: sections.join(GAP),
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(100, confidence)) / 100 : null
  };
}

/**
 * Send one tiny text-only request so Settings can answer the only question a
 * farmer cares about: "is this key actually working?". Without it, a broken key
 * and a working key look identical - both quietly produce an offline result.
 *
 * Resolves to the model that answered, or throws a coded cloudError.
 */
export async function verifyGeminiKey(apiKey) {
  const key = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!key) {
    throw cloudError(CLOUD_ERROR_CODES.keyMissing, 'No Gemini API key to test');
  }

  const ai = new GoogleGenAI({ apiKey: key });
  let lastError = null;
  for (const model of MODEL_CHAIN) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Reply with the single word OK.'
      });
      const text = response.text;
      if (text && text.trim()) return { ok: true, model };
      lastError = cloudError(CLOUD_ERROR_CODES.failed, 'Gemini returned an empty response');
    } catch (err) {
      const classified = classify(err);
      if (classified.code === CLOUD_ERROR_CODES.keyRejected || classified.code === CLOUD_ERROR_CODES.quota) {
        throw classified;
      }
      lastError = classified;
    }
  }
  throw lastError || cloudError(CLOUD_ERROR_CODES.failed, 'No Gemini model responded');
}
