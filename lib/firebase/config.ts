import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { validateFirebaseEnv } from '@/lib/security/env-validation';

// Validate environment variables on server-side
if (typeof window === 'undefined') {
  try {
    validateFirebaseEnv();
  } catch (error) {
    // In development, log the error; in production, fail silently to prevent build errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Firebase configuration error:', error);
    }
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase only if we have a valid project ID
import type { Firestore } from 'firebase/firestore';

let app;
let db: Firestore | null = null;

try {
  if (firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  }
} catch (error) {
  // In development, log the error
  if (process.env.NODE_ENV === 'development') {
    console.error('Firebase initialization error:', error);
  }
  db = null;
}

export { db };

