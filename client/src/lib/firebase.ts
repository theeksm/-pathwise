import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";

// Get environment variables for Firebase config
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const firebaseAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = import.meta.env.VITE_FIREBASE_APP_ID;
const firebaseMeasurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

// Log configuration for debugging (without exposing sensitive values)
console.log("Firebase config initialized with:", { 
  apiKey: !!firebaseApiKey ? `${firebaseApiKey.substring(0, 3)}...${firebaseApiKey.substring(firebaseApiKey.length - 3)}` : "missing",
  authDomain: firebaseAuthDomain || "using fallback domain",
  projectId: firebaseProjectId || "using fallback project",
  storageBucket: !!firebaseStorageBucket ? "present" : "using fallback bucket",
  messagingSenderId: !!firebaseMessagingSenderId ? "present" : "using fallback sender ID",
  appId: !!firebaseAppId ? `${firebaseAppId.substring(0, 3)}...${firebaseAppId.substring(firebaseAppId.length - 3)}` : "missing",
  measurementId: !!firebaseMeasurementId ? firebaseMeasurementId : "using fallback measurement ID"
});

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (avoid duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics if in browser environment

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set up providers
export const googleProvider = new GoogleAuthProvider();
export const phoneProvider = new PhoneAuthProvider(auth);

export default app;