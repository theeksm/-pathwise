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

// Get auth domain from env
const firebaseAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;

// Firebase configuration
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain || `${firebaseProjectId}.firebaseapp.com`,
  projectId: firebaseProjectId,
  storageBucket: `${firebaseProjectId}.appspot.com`,
  messagingSenderId: "764806761857", // This will be auto-filled by Firebase
  appId: firebaseAppId,
};

// Validate Firebase configuration
if (!firebaseApiKey || !firebaseProjectId || !firebaseAppId) {
  console.error("Firebase configuration is incomplete. Authentication features will not work.");
  console.log("Missing values:", {
    apiKey: !firebaseApiKey ? "missing" : "present",
    projectId: !firebaseProjectId ? "missing" : "present",
    appId: !firebaseAppId ? "missing" : "present",
    authDomain: !firebaseAuthDomain ? "using default" : "present"
  });
}

// Initialize Firebase (avoid duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set up providers
export const googleProvider = new GoogleAuthProvider();
export const phoneProvider = new PhoneAuthProvider(auth);

export default app;