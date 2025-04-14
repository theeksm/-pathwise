import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";

// Get environment variables
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const firebaseAppId = import.meta.env.VITE_FIREBASE_APP_ID;

// Log configuration for debugging (without exposing sensitive values)
console.log("Firebase config initialized with:", { 
  projectIdAvailable: !!firebaseProjectId,
  apiKeyAvailable: !!firebaseApiKey,
  appIdAvailable: !!firebaseAppId
});

// Firebase configuration
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: `${firebaseProjectId}.firebaseapp.com`,
  projectId: firebaseProjectId,
  storageBucket: `${firebaseProjectId}.appspot.com`,
  messagingSenderId: "000000000000", // This is a placeholder, will be auto-filled by Firebase
  appId: firebaseAppId,
};

// Initialize Firebase (avoid duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set up providers
export const googleProvider = new GoogleAuthProvider();
export const phoneProvider = new PhoneAuthProvider(auth);

export default app;