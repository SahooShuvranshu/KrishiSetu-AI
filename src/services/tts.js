// Google Cloud Text-to-Speech Service for KrishiSetu AI
// Provides high-quality voice readout in local languages

// Voice configurations for Indian languages
const VOICE_CONFIG = {
  'en': {
    languageCode: 'en-IN',
    name: 'en-IN-Wavenet-A',
    ssmlGender: 'FEMALE'
  },
  'or': {
    languageCode: 'or-IN',
    name: 'or-IN-Wavenet-A',
    ssmlGender: 'FEMALE'
  },
  'hi': {
    languageCode: 'hi-IN',
    name: 'hi-IN-Wavenet-A',
    ssmlGender: 'FEMALE'
  },
  'bn': {
    languageCode: 'bn-IN',
    name: 'bn-IN-Wavenet-A',
    ssmlGender: 'FEMALE'
  },
  'te': {
    languageCode: 'te-IN',
    name: 'te-IN-Wavenet-A',
    ssmlGender: 'FEMALE'
  },
  'ta': {
    languageCode: 'ta-IN',
    name: 'ta-IN-Wavenet-A',
    ssmlGender: 'FEMALE'
  }
};

// Audio configuration
const AUDIO_CONFIG = {
  audioEncoding: 'MP3',
  speakingRate: 0.9,  // Slightly slower for clarity
  pitch: 0.0,
  volumeGainDb: 0.0
};

// Cache for audio blobs
const audioCache = new Map();

/**
 * Convert text to speech using Google Cloud TTS
 * Falls back to Web Speech API if Cloud TTS is unavailable
 * 
 * @param {string} text - Text to speak
 * @param {string} langCode - Language code (en, or, hi, etc.)
 * @returns {Promise<void>}
 */
export async function speakText(text, langCode = 'en') {
  // Check cache first
  const cacheKey = `${langCode}:${text.substring(0, 100)}`;
  if (audioCache.has(cacheKey)) {
    const cachedAudio = audioCache.get(cacheKey);
    await playAudioBlob(cachedAudio);
    return;
  }

  // Try Google Cloud TTS via backend proxy
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        languageCode: langCode,
        voice: VOICE_CONFIG[langCode] || VOICE_CONFIG['en']
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audioContent) {
        // Convert base64 to blob
        const audioBlob = base64ToBlob(data.audioContent, 'audio/mp3');
        audioCache.set(cacheKey, audioBlob);
        await playAudioBlob(audioBlob);
        return;
      }
    }
  } catch (error) {
    console.warn('Cloud TTS unavailable, using Web Speech API fallback');
  }

  // Fallback: Use Web Speech API
  speakWithWebAPI(text, langCode);
}

/**
 * Play an audio blob
 * @param {Blob} blob - Audio blob to play
 * @returns {Promise<void>}
 */
function playAudioBlob(blob) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(URL.createObjectURL(blob));
    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      resolve();
    };
    audio.onerror = reject;
    audio.play().catch(reject);
  });
}

/**
 * Convert base64 string to Blob
 * @param {string} base64 - Base64 encoded string
 * @param {string} mimeType - MIME type
 * @returns {Blob}
 */
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Fallback: Use Web Speech API
 * @param {string} text - Text to speak
 * @param {string} langCode - Language code
 */
function speakWithWebAPI(text, langCode) {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Map language codes
  const langMap = {
    'en': 'en-IN',
    'or': 'or-IN',
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'te': 'te-IN',
    'ta': 'ta-IN'
  };

  utterance.lang = langMap[langCode] || 'en-IN';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  // Try to use Google voice if available
  const voices = window.speechSynthesis.getVoices();
  const googleVoice = voices.find(v => 
    v.lang === (langMap[langCode] || 'en-IN') && 
    v.name.includes('Google')
  );
  
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
  isSpeechAvailable,
  VOICE_CONFIG
};
