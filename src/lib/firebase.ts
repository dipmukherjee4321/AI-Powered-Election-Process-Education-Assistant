import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { getRemoteConfig } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Added for Analytics
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
