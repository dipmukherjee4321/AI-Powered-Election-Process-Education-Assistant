import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

/**
 * PRODUCTION-SECURE FIREBASE CONFIGURATION
 * All values are sourced from environment variables to prevent secret leakage.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (Singleton pattern with validation)
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

const app =
  !getApps().length && isConfigValid
    ? initializeApp(firebaseConfig)
    : getApps().length
      ? getApps()[0]
      : null;

export const auth = app ? getAuth(app) : (null as unknown as ReturnType<typeof getAuth>);
export const googleProvider = new GoogleAuthProvider();
export const db = app ? getFirestore(app) : (null as unknown as ReturnType<typeof getFirestore>);

// Analytics (Client-side only)
export const analytics =
  typeof window !== "undefined" && app
    ? isSupported().then((yes) => (yes ? getAnalytics(app) : null))
    : Promise.resolve(null);

export default app;
