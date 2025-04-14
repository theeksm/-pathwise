import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  DocumentReference, 
  DocumentSnapshot,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentSingleTabManager
} from "firebase/firestore";
import app from "./firebase";

// Initialize Firestore with default settings
const db = getFirestore(app);

// User data interface
export interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt?: string;
  lastLogin?: string;
  phoneNumber?: string | null;
}

// Save user data to Firestore with enhanced error handling
export async function saveUserToFirestore(userData: UserData): Promise<void> {
  if (!userData || !userData.uid) {
    console.error("Invalid user data provided to saveUserToFirestore");
    return;
  }

  try {
    console.log("Saving user to Firestore:", userData);
    const userRef = doc(db, "users", userData.uid);
    
    let existingUser = false;
    
    // Try to check if the user document already exists
    try {
      const userDoc = await getDoc(userRef);
      existingUser = userDoc.exists();
    } catch (checkError) {
      console.warn("Error checking if user exists, will attempt to create/update anyway:", checkError);
    }
    
    // Prepare timestamp
    const now = new Date().toISOString();
    
    try {
      if (existingUser) {
        // User already exists, only update lastLogin
        await setDoc(userRef, { 
          lastLogin: now 
        }, { merge: true });
        console.log("Updated existing user's login time");
      } else {
        // New user, create document with all user data
        await setDoc(userRef, {
          ...userData,
          createdAt: now,
          lastLogin: now
        });
        console.log("Created new user document in Firestore");
      }
    } catch (writeError: any) {
      console.error(`Error ${existingUser ? 'updating' : 'creating'} user in Firestore:`, writeError);
      // Don't rethrow - we want authentication to continue even if Firestore fails
    }
  } catch (error) {
    console.error("Error in saveUserToFirestore:", error);
    // Don't rethrow - we want authentication to continue even if Firestore fails
  }
}

// Get user data from Firestore by UID with enhanced error handling
export async function getUserFromFirestore(uid: string): Promise<UserData | null> {
  if (!uid) {
    console.error("Invalid UID provided to getUserFromFirestore");
    return null;
  }
  
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      console.log("No user document found for UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error getting user from Firestore:", error);
    // Return null instead of throwing - don't prevent UI from loading
    return null;
  }
}

export default db;