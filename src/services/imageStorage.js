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
 * Save an image to IndexedDB
 * @param {string} id - Unique identifier (e.g., 'last_scan')
 * @param {string} imageData - Base64 image data
 * @returns {Promise<void>}
 */
export async function saveImage(id, imageData) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    store.put({ id, data: imageData, timestamp: Date.now() });
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (error) {
    // IndexedDB not available, fall back to localStorage
    try {
      localStorage.setItem(`krishisetu_${id}`, imageData);
    } catch (e) {
      // Storage full - ignore
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
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      
      request.onsuccess = () => {
        db.close();
        resolve(request.result?.data || null);
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    // IndexedDB not available, fall back to localStorage
    return localStorage.getItem(`krishisetu_${id}`) || null;
  }
}

/**
 * Delete an image from IndexedDB
 * @param {string} id - Unique identifier
 * @returns {Promise<void>}
 */
export async function deleteImage(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    store.delete(id);
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (error) {
    // IndexedDB not available, fall back to localStorage
    localStorage.removeItem(`krishisetu_${id}`);
  }
}

/**
 * Get all scan history from IndexedDB
 * @returns {Promise<Array>} - Array of scan entries
 */
export async function getScanHistory() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        db.close();
        const results = request.result || [];
        // Filter out the 'last_scan' entry and sort by timestamp
        const history = results
          .filter(item => item.id !== 'last_scan' && item.id !== 'scan_history')
          .sort((a, b) => b.timestamp - a.timestamp);
        resolve(history);
      };
      
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    // IndexedDB not available, fall back to localStorage
    const history = JSON.parse(localStorage.getItem('krishisetu_scan_history') || '[]');
    return history;
  }
}
