// Speech entry point used by the scan result card.
//
// The work happens in services/tts.js, which speaks through the browser's Web
// Speech API. A Google Cloud TTS path used to POST to /api/tts here; no backend
// served that route, so it was removed.
import { speakText, stopSpeaking } from './tts';

export { speakText, stopSpeaking };
