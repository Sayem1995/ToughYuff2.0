import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


// Use a safe initialization pattern to prevent "White Screen of Death" on missing env vars
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

if (!isConfigured) {
    console.error("FIREBASE CONFIGURATION ERROR: Missing Environment Variables. Check your .env file or Vercel Settings.");
}

// Initialize Firebase only if configured, otherwise we let the app run but services will fail gracefully
const app = isConfigured ? initializeApp(firebaseConfig) : undefined;

// Export services (cast as any if app is undefined to avoid TS errors in strict mode, 
// though in reality we should handle this better. For now, this prevents import crash.)
export const db = isConfigured ? getFirestore(app) : {} as any;
export const storage = isConfigured ? getStorage(app) : {} as any;
export const auth = isConfigured ? getAuth(app) : {} as any;

export const isFirebaseInitialized = isConfigured;
