// Language metadata for KrishiSetu AI.
//
// This module used to translate text through Google's Translation API by
// POSTing to /api/translate. No backend ever served that route, so the request
// always failed and the original text came back unchanged. Every string the app
// displays comes from the bundled EN/OR/HI dictionary in src/translations.js,
// so the network path was removed rather than left in place pretending to work.
// Nothing here needs the network.

// Language codes the app knows about.
export const LANGUAGE_CODES = {
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

const LANGUAGE_NAMES = {
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

/**
 * Get language name in its native script
 * @param {string} langCode - Language code
 * @returns {string} - Language name
 */
export function getLanguageName(langCode) {
  return LANGUAGE_NAMES[langCode] || langCode;
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
  getLanguageName,
  isLanguageSupported,
  LANGUAGE_CODES
};
