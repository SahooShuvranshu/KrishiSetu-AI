// Google Translation API Service for KrishiSetu AI
// Provides dynamic translation for multilingual support

// Language codes mapping
const LANGUAGE_CODES = {
  'en': 'en',      // English
  'or': 'or',      // Odia
  'hi': 'hi',      // Hindi
  'bn': 'bn',      // Bengali
  'te': 'te',      // Telugu
  'ta': 'ta',      // Tamil
  'mr': 'mr',      // Marathi
  'gu': 'gu',      // Gujarati
  'kn': 'kn',      // Kannada
  'ml': 'ml',      // Malayalam
  'pa': 'pa',      // Punjabi
  'ur': 'ur',      // Urdu
};

// Cache for translations to reduce API calls
const translationCache = new Map();

/**
 * Translate text using Google Translation API
 * Falls back to manual translations if API is unavailable
 * 
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (en, or, hi, etc.)
 * @param {string} sourceLang - Source language code (default: en)
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, targetLang, sourceLang = 'en') {
  // If same language, return original
  if (sourceLang === targetLang) {
    return text;
  }

  // Check cache first
  const cacheKey = `${sourceLang}:${targetLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // Try Google Translation API (requires backend proxy)
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        source: sourceLang,
        target: targetLang
      })
    });

    if (response.ok) {
      const data = await response.json();
      const translated = data.translatedText || text;
      translationCache.set(cacheKey, translated);
      return translated;
    }
  } catch (error) {
    console.warn('Translation API unavailable, using fallback');
  }

  // Fallback: return original text
  return text;
}

/**
 * Batch translate multiple texts
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language
 * @returns {Promise<string[]>} - Array of translated texts
 */
export async function translateBatch(texts, targetLang, sourceLang = 'en') {
  const translations = await Promise.all(
    texts.map(text => translateText(text, targetLang, sourceLang))
  );
  return translations;
}

/**
 * Get language name in its native script
 * @param {string} langCode - Language code
 * @returns {string} - Language name
 */
export function getLanguageName(langCode) {
  const names = {
    'en': 'English',
    'or': 'ଓଡ଼ିଆ',
    'hi': 'हिन्दी',
    'bn': 'বাংলা',
    'te': 'తెలుగు',
    'ta': 'தமிழ்',
    'mr': 'मराठी',
    'gu': 'ગુજરાતી',
    'kn': 'ಕನ್ನಡ',
    'ml': 'മലയാളം',
    'pa': 'ਪੰਜਾਬੀ',
    'ur': 'اردو'
  };
  return names[langCode] || langCode;
}

/**
 * Check if a language is supported
 * @param {string} langCode - Language code to check
 * @returns {boolean} - True if supported
 */
export function isLanguageSupported(langCode) {
  return langCode in LANGUAGE_CODES;
}

export default {
  translateText,
  translateBatch,
  getLanguageName,
  isLanguageSupported,
  LANGUAGE_CODES
};
