import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { getRemoteConfig } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: "***REMOVED_FIREBASE_KEY***",
  authDomain: "election-process-al-assistant.firebaseapp.com",
  projectId: "election-process-al-assistant",
  storageBucket: "election-process-al-assistant.firebasestorage.app",
  messagingSenderId: "361439269178",
  appId: "1:361439269178:web:82b07545fd95323b9e8003",
  measurementId: "G-XXXXXXXXXX",
};

// Prevent multiple initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Initialize Services conditionally (Client-side only)
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : Promise.resolve(null);
export const performance = typeof window !== "undefined" ? getPerformance(app) : null;
export const remoteConfig = typeof window !== "undefined" ? getRemoteConfig(app) : null;

// Helper to log analytics events
export const trackEvent = async (name: string, params?: object) => {
  const instance = await analytics;
  if (instance) logEvent(instance, name, params);
};

export default app;
