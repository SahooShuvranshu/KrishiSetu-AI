// KrishiSetu AI - Constants
// Centralized configuration values

// ============================================================
// Geolocation
// ============================================================
export const ODISHA_CENTER = {
  lat: 20.2961,
  lng: 85.8245
};

export const GPS_TIMEOUT = 5000; // 5 seconds

// Soil zone coordinates (from multilingual_data.js)
export const SOIL_ZONES = {
  SUNDARGARH: { lat: 22.1, lng: 84.0 },
  PURI: { lat: 19.8, lng: 85.8 },
  RAYAGADA: { lat: 19.5, lng: 83.9 },
  KALAHANDI: { lat: 20.0, lng: 83.1 },
  ANGUL: { lat: 20.8, lng: 85.1 }
};

// ============================================================
// ML Model
// ============================================================
export const MODEL_INPUT_SIZE = 224; // MobileNetV2 input size
export const MODEL_NORMALIZATION = 255.0; // Pixel normalization

// ============================================================
// App Settings
// ============================================================
export const SPLASH_DURATION = 2500; // 2.5 seconds
export const MAX_SCAN_HISTORY = 20; // Keep last 20 scans
export const WEATHER_CACHE_TTL = 300000; // 5 minutes in ms

// ============================================================
// API Timeouts
// ============================================================
export const GEMINI_TIMEOUT = 60000; // 60 seconds for image analysis
export const FIREBASE_TIMEOUT = 10000; // 10 seconds for Firebase

// ============================================================
// UI
// ============================================================
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024
};

export default {
  ODISHA_CENTER,
  GPS_TIMEOUT,
  SOIL_ZONES,
  MODEL_INPUT_SIZE,
  MODEL_NORMALIZATION,
  SPLASH_DURATION,
  MAX_SCAN_HISTORY,
  WEATHER_CACHE_TTL,
  GEMINI_TIMEOUT,
  FIREBASE_TIMEOUT,
  BREAKPOINTS
};
