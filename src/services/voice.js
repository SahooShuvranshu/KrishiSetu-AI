export function speakText(text, lang = 'en') {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported.');
    return;
  }

  // Stop any currently playing audio
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Map our app languages to Google's Android native voice codes
  // This drastically improves audio quality on mobile phones
  let voiceLangCode = 'en-IN'; // Default Indian English
  if (lang === 'hi') voiceLangCode = 'hi-IN'; // Hindi
  if (lang === 'or') voiceLangCode = 'or-IN'; // Odia

  utterance.lang = voiceLangCode;
  utterance.rate = 0.9; // Slightly slower for better understanding
  utterance.pitch = 1.0;

  // Try to force a Google voice if available (they sound much better than default robot)
  const voices = window.speechSynthesis.getVoices();
  const premiumVoice = voices.find(v => v.lang === voiceLangCode && v.name.includes('Google'));
  if (premiumVoice) {
    utterance.voice = premiumVoice;
  }

  window.speechSynthesis.speak(utterance);
}
