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
export const MODEL_INFERENCE_TIMEOUT = 90000; // 90s - on-device model has to warm up

// ============================================================
// Offline diagnosis quality gates
// ============================================================
// Confidence is the probability of the winning class *within the crop the
// farmer selected* (masked and renormalised), so it is comparable across crops.
export const MIN_CONFIDENCE = 0.5;      // below this -> "not sure" instead of a name
export const MIN_MARGIN = 0.12;         // top1 - top2 closer than this -> too close to answer
// Raw (unmasked) probability the model's Other_/NotALeaf class needs before the
// app says "no leaf" instead of naming a disease. Higher than MIN_CONFIDENCE on
// purpose: this answer overrides the crop mask, so it should be decisive.
export const OTHER_MIN_CONFIDENCE = 0.6;
export const LEAF_MIN_DETAIL = 10;      // luminance stddev: a blank wall or sky has almost none
export const LEAF_MIN_FRACTION = 0.12;  // plant-coloured share for a confident "leaf"
export const LEAF_HARD_FRACTION = 0.06; // below this, do not run the model at all

// ============================================================
// Persistent storage
// ============================================================
export const OPFS_MODEL_DIR = 'krishisetu-model';
export const STORAGE_ESTIMATE_REFRESH_MS = 60000;

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
  MODEL_INFERENCE_TIMEOUT,
  MIN_CONFIDENCE,
  MIN_MARGIN,
  LEAF_MIN_DETAIL,
  LEAF_MIN_FRACTION,
  LEAF_HARD_FRACTION,
  OPFS_MODEL_DIR,
  STORAGE_ESTIMATE_REFRESH_MS,
  BREAKPOINTS
};
