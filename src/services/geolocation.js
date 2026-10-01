import { ODISHA_CENTER, GPS_TIMEOUT } from '../config/constants';

let lastRequestTime = 0;
const DEBOUNCE_MS = 5000; // Ignore GPS requests within 5s of the previous one

/**
 * Debounced geolocation wrapper.
 * Prevents rapid repeated getCurrentPosition calls (e.g. button mashing).
 * Falls back to the Odisha center coordinate when GPS is unavailable/denied.
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('GEOLOCATION_UNSUPPORTED'));
      return;
    }

    const now = Date.now();
    if (now - lastRequestTime < DEBOUNCE_MS) {
      reject(new Error('GEOLOCATION_DEBOUNCED'));
      return;
    }
    lastRequestTime = now;

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: GPS_TIMEOUT,
      maximumAge: 30000
    });
  });
}

export { ODISHA_CENTER as DEFAULT_POSITION };