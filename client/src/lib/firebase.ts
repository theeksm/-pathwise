import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

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
  apiKey: firebaseApiKey || "AIzaSyA_MZkrOW1ge8aPbF42Kt_RYzcwx7rPTeA",
  authDomain: firebaseAuthDomain || "pathwise-e3558.firebaseapp.com",
  projectId: firebaseProjectId || "pathwise-e3558",
  storageBucket: firebaseStorageBucket || "pathwise-e3558.appspot.com",
  messagingSenderId: firebaseMessagingSenderId || "227768112306",
  appId: firebaseAppId || "1:227768112306:web:3a438581c5ca96be9e25ab",
  measurementId: firebaseMeasurementId || "G-WVG96RYLDK" // Updated to the correct measurement ID from server
};

// Initialize Firebase (avoid duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics if in browser environment
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set up providers
export const googleProvider = new GoogleAuthProvider();
export const phoneProvider = new PhoneAuthProvider(auth);

export default app;