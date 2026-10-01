// IndexedDB utility for storing scan images
// Replaces localStorage Base64 which has 5MB limit

const DB_NAME = 'KrishiSetuDB';
const DB_VERSION = 1;
const STORE_NAME = 'scanImages';

/**
 * Open IndexedDB connection
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Run one request inside its own transaction and only settle when the
 * transaction is done.
 *
 * Every caller below must await this. Returning the promise without awaiting it
 * meant a request-level failure (quota, disabled storage) never reached the
 * caller's catch block, so the localStorage fallback was unreachable and a
 * failed image write silently cancelled the whole scan.
 *
 * @param {string} mode - 'readonly' | 'readwrite'
 * @param {Function} run - receives the object store, should return a request
 * @returns {Promise<any>} - the request result
 */
function withStore(mode, run) {
  return openDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    let request;

    const finish = (callback, payload) => {
      db.close();
      callback(payload);
    };

    tx.oncomplete = () => finish(resolve, request ? request.result : undefined);
    tx.onerror = () => finish(reject, tx.error);
    tx.onabort = () => finish(reject, tx.error);

    try {
      request = run(tx.objectStore(STORE_NAME));
    } catch (error) {
      tx.abort();
      finish(reject, error);
    }
  }));
}

/**
 * Save an image to IndexedDB
 * @param {string} id - Unique identifier (e.g., 'last_scan')
 * @param {string} imageData - Base64 image data
 * @returns {Promise<void>}
 */
export async function saveImage(id, imageData) {
  try {
    await withStore('readwrite', (store) =>
      store.put({ id, data: imageData, timestamp: Date.now() }));
  } catch (error) {
    // IndexedDB unavailable or full - keep the image in localStorage instead
    try {
      localStorage.setItem(`krishisetu_${id}`, imageData);
    } catch (e) {
      // Storage exhausted as well - the scan continues without a saved image
    }
  }
}

/**
 * Get an image from IndexedDB
 * @param {string} id - Unique identifier
 * @returns {Promise<string|null>} - Base64 image data or null
 */
export async function getImage(id) {
  try {
    const stored = await withStore('readonly', (store) => store.get(id));
    if (stored && stored.data) {
      return stored.data;
    }
  } catch (error) {
    // Fall through to the localStorage copy
  }
  return localStorage.getItem(`krishisetu_${id}`) || null;
}

/**
 * Delete an image from IndexedDB
 * @param {string} id - Unique identifier
 * @returns {Promise<void>}
 */
export async function deleteImage(id) {
  try {
    await withStore('readwrite', (store) => store.delete(id));
  } catch (error) {
    // Ignore - the localStorage copy is removed below either way
  }
  // Always clear both stores, otherwise a stale localStorage copy could be
  // served again by getImage() after the IndexedDB entry is gone.
  localStorage.removeItem(`krishisetu_${id}`);
}

/**
 * Get all scan history from IndexedDB
 * @returns {Promise<Array>} - Array of scan entries
 */
export async function getScanHistory() {
  try {
    const results = await withStore('readonly', (store) => store.getAll());
    return (results || [])
      .filter(item => item.id !== 'last_scan' && item.id !== 'scan_history')
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    // IndexedDB not available, fall back to localStorage
    return JSON.parse(localStorage.getItem('krishisetu_scan_history') || '[]');
  }
}
