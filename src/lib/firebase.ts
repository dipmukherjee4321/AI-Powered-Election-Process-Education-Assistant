import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { getRemoteConfig } from "firebase/remote-config";

/**
 * Firebase Configuration
 * Client-side keys are loaded from environment variables for security hygiene.
 * These are baked into the Next.js bundle at build time.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Prevent multiple initialization and ensure all keys are present
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

const app = !getApps().length && isConfigValid 
  ? initializeApp(firebaseConfig) 
  : (getApps().length ? getApps()[0] : null);

export const auth = app ? getAuth(app) : null as any;
export const googleProvider = new GoogleAuthProvider();
export const db = app ? getFirestore(app) : null as any;

// Initialize Services conditionally (Client-side only)
export const analytics = typeof window !== "undefined" && app 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null) 
  : Promise.resolve(null);

export const performance = typeof window !== "undefined" && app ? getPerformance(app) : null;
export const remoteConfig = typeof window !== "undefined" && app ? getRemoteConfig(app) : null;

/**
 * Global Event Tracker
 */
export const trackEvent = async (name: string, params?: object) => {
  const instance = await analytics;
  if (instance) logEvent(instance, name, params);
};

export default app;
