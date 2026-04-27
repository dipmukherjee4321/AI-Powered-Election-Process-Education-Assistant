import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Guard for build-time execution
const isConfigValid = !!firebaseConfig.apiKey;

const app = isConfigValid 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApps()[0])
  : (null as any);

export const auth = isConfigValid ? getAuth(app) : ({} as any);
export const db = isConfigValid ? getFirestore(app) : ({} as any);
export const googleProvider = new GoogleAuthProvider();

// Analytics is only available on the client
export const analytics = typeof window !== "undefined" && isConfigValid 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : Promise.resolve(null);

export default app;
