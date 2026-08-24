import { speakText as cloudSpeakText } from './tts';

/**
 * Speak text using Google Cloud TTS (with Web Speech API fallback)
 * This function is the main entry point for text-to-speech in KrishiSetu
 * 
 * @param {string} text - Text to speak
 * @param {string} lang - Language code (en, or, hi, etc.)
 */
export async function speakText(text, lang = 'en') {
  // Use Google Cloud TTS (falls back to Web Speech API automatically)
  await cloudSpeakText(text, lang);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
