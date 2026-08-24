// Firebase Configuration for KrishiSetu AI
// Real-time alert sync across devices (DPI Grid)

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
  console.warn('Firebase initialization failed:', error);
}

/**
 * Broadcast an alert to all connected farmers
 * @param {Object} alert - The alert object to broadcast
 * @returns {Promise<string>} - The document ID
 */
export async function broadcastAlert(alert) {
  const alertData = {
    ...alert,
    timestamp: serverTimestamp(),
    status: 'active',
    source: 'local_scan'
  };

  // Try Firebase first, fallback to localStorage
  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'alerts'), alertData);
      return docRef.id;
    } catch (error) {
      // Firebase broadcast failed, using localStorage fallback
    }
  }

  // Fallback: localStorage
  const localAlerts = JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
  const newAlert = {
    ...alertData,
    id: `local_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  localAlerts.unshift(newAlert);
  localStorage.setItem('krishisetu_alerts', JSON.stringify(localAlerts));
  return newAlert.id;
}

/**
 * Listen for real-time alerts from Firebase
 * @param {Function} callback - Called with array of alerts
 * @returns {Function} - Unsubscribe function
 */
export function listenAlerts(callback) {
  if (!db) {
    // Fallback: return localStorage alerts
    const localAlerts = JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
    callback(localAlerts);
    return () => {}; // No-op unsubscribe
  }

  const alertsQuery = query(
    collection(db, 'alerts'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to ISO string
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp
    }));
    callback(alerts);
  }, (error) => {
    // Firebase listener error, using localStorage fallback
    const localAlerts = JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
    callback(localAlerts);
  });

  return unsubscribe;
}

/**
 * Get local alerts from localStorage (offline fallback)
 * @returns {Array} - Array of local alerts
 */
export function getLocalAlerts() {
  return JSON.parse(localStorage.getItem('krishisetu_alerts') || '[]');
}

/**
 * Save alert to localStorage (for offline support)
 * @param {Object} alert - The alert to save
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

export default app;
