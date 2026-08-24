// Firebase Configuration for KrishiSetu AI
// Real-time alert sync across devices (DPI Grid)
// Offline-first: queues alerts locally, syncs when online

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app = null;
let db = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (error) {
  // Firebase not configured - will use localStorage fallback
}

/**
 * Get pending alerts from queue
 */
function getPendingAlerts() {
  return JSON.parse(localStorage.getItem('krishisetu_pending_alerts') || '[]');
}

/**
 * Save alert to pending queue
 */
function saveToPendingQueue(alert) {
  const pending = getPendingAlerts();
  pending.push({
    ...alert,
    id: `pending_${Date.now()}`,
    queuedAt: new Date().toISOString()
  });
  localStorage.setItem('krishisetu_pending_alerts', JSON.stringify(pending));
}

/**
 * Remove alert from pending queue
 */
function removeFromPendingQueue(alertId) {
  const pending = getPendingAlerts();
  const filtered = pending.filter(a => a.id !== alertId);
  localStorage.setItem('krishisetu_pending_alerts', JSON.stringify(filtered));
}

/**
 * Sync pending alerts to Firebase when online
 */
export async function syncPendingAlerts() {
  if (!db || !navigator.onLine) return 0;
  
  const pending = getPendingAlerts();
  if (pending.length === 0) return 0;
  
  let synced = 0;
  for (const alert of pending) {
    try {
      const { id, queuedAt, ...alertData } = alert;
      await addDoc(collection(db, 'alerts'), {
        ...alertData,
        timestamp: serverTimestamp(),
        syncedFrom: 'offline_queue'
      });
      removeFromPendingQueue(id);
      synced++;
    } catch (error) {
      // Keep in queue for next sync attempt
    }
  }
  
  return synced;
}

/**
 * Broadcast an alert to all connected farmers
 * @param {Object} alert - The alert object to broadcast
 * @returns {Promise<{id: string, queued: boolean}>} - Result
 */
export async function broadcastAlert(alert) {
  const alertData = {
    ...alert,
    timestamp: serverTimestamp(),
    status: 'active',
    source: 'local_scan'
  };

  // If online and Firebase available, send directly
  if (navigator.onLine && db) {
    try {
      const docRef = await addDoc(collection(db, 'alerts'), alertData);
      return { id: docRef.id, queued: false };
    } catch (error) {
      // Firebase failed, queue locally
    }
  }

  // Offline or Firebase failed: save to local storage AND pending queue
  const localAlerts = JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
  const newAlert = {
    ...alertData,
    id: `local_${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'pending_sync'
  };
  localAlerts.unshift(newAlert);
  localStorage.setItem('krishisetu_alerts', JSON.stringify(localAlerts));
  
  // Also add to pending queue for later sync
  saveToPendingQueue(newAlert);
  
  return { id: newAlert.id, queued: true };
}

/**
 * Listen for real-time alerts from Firebase
 * @param {Function} callback - Called with array of alerts
 * @returns {Function} - Unsubscribe function
 */
export function listenAlerts(callback) {
  // Always include local alerts
  const getLocalAlerts = () => JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
  
  if (!db) {
    callback(getLocalAlerts());
    return () => {};
  }

  const alertsQuery = query(
    collection(db, 'alerts'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
    const firebaseAlerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
    }));
    
    // Merge with local alerts (avoid duplicates)
    const localAlerts = getLocalAlerts();
    const allAlerts = [...firebaseAlerts];
    
    localAlerts.forEach(local => {
      if (!allAlerts.some(a => a.id === local.id)) {
        allAlerts.push(local);
      }
    });
    
    callback(allAlerts);
  }, (error) => {
    callback(getLocalAlerts());
  });

  // Also try to sync pending alerts periodically
  const syncInterval = setInterval(() => {
    if (navigator.onLine) {
      syncPendingAlerts();
    }
  }, 30000); // Every 30 seconds

  return () => {
    unsubscribe();
    clearInterval(syncInterval);
  };
}

/**
 * Get pending alerts count
 */
export function getPendingAlertsCount() {
  return getPendingAlerts().length;
}

/**
 * Get local alerts
 */
export function getLocalAlerts() {
  return JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
}

/**
 * Save alert to localStorage
 */
export function saveLocalAlert(alert) {
  const localAlerts = JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
  localAlerts.unshift({
    ...alert,
    id: `local_${Date.now()}`,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('krishisetu_alerts', JSON.stringify(localAlerts));
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(syncPendingAlerts, 2000);
  });
}

export default app;
