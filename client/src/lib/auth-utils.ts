import { 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  ApplicationVerifier,
  UserCredential
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Add auth scopes for better user data
    googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
    googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    
    // Use signInWithPopup instead of redirect for better compatibility
    const result = await signInWithPopup(auth, googleProvider);
    
    // Log success for debugging
    console.log("Google sign-in successful", result.user);
    return result;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Initialize reCAPTCHA verifier
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const initRecaptchaVerifier = (buttonId: string) => {
  try {
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
        "expired-callback": () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          initRecaptchaVerifier(buttonId);
        },
      });
    }
    return recaptchaVerifier;
  } catch (error) {
    console.error("Error initializing recaptcha:", error);
    throw error;
  }
};

// Sign in with phone number
export const signInWithPhone = async (
  phoneNumber: string,
  recaptchaVerifier: ApplicationVerifier
) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );
    return confirmationResult;
  } catch (error: any) {
    console.error("Error signing in with phone:", error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get ID token for server verification
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error("Error getting ID token:", error);
      throw error;
    }
  }
  return null;
};