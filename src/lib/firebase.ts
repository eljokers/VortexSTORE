import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB2UeeQIFg-OUIreXMVig2v9mQxI8PRqBo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vortexmc-store.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vortexmc-store",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vortexmc-store.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "307169849424",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:307169849424:web:516c3d9877bd8f76e5e155"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);