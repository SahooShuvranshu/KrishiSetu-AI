// Text-to-speech for KrishiSetu AI.
//
// There is no TTS backend. This used to POST to /api/tts (Google Cloud TTS via
// a proxy) and fall back to the Web Speech API when that failed - but no
// backend ever served the route, so every call paid for a failed request before
// reaching the code that actually spoke. The Web Speech API is the only path,
// so it is now the only code.

// App language codes -> BCP-47 tags for the speech engine.
const SPEECH_LANG = {
  en: 'en-IN',
  or: 'or-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN'
};

/**
 * Speak text with the browser's built-in speech synthesis.
 * Kept async so existing callers can `await` it unchanged.
 *
 * @param {string} text - Text to speak
 * @param {string} langCode - Language code (en, or, hi, etc.)
 * @returns {Promise<void>}
 */
export async function speakText(text, langCode = 'en') {
  speakWithWebAPI(text, langCode);
}

/**
 * Web Speech API implementation.
 * @param {string} text - Text to speak
 * @param {string} langCode - Language code
 */
function speakWithWebAPI(text, langCode) {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported');
    return;
  }

  // Cancel any ongoing speech so a second tap replaces the first.
  window.speechSynthesis.cancel();

  const lang = SPEECH_LANG[langCode] || 'en-IN';
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = lang;
  utterance.rate = 0.9;  // Slightly slower for clarity in a field setting.
  utterance.pitch = 1.0;

  // Prefer a Google voice for this language when the device offers one.
  const googleVoice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang === lang && v.name.includes('Google'));
  if (googleVoice) {
    utterance.voice = googleVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if speech synthesis is available
 * @returns {boolean}
 */
export function isSpeechAvailable() {
  return 'speechSynthesis' in window;
}

export default {
  speakText,
  stopSpeaking,
  isSpeechAvailable
};
