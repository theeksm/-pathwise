import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  DocumentReference, 
  DocumentSnapshot 
} from "firebase/firestore";
import app from "./firebase";

// Initialize Firestore service
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

// Save user data to Firestore
export async function saveUserToFirestore(userData: UserData): Promise<void> {
  try {
    console.log("Saving user to Firestore:", userData);
    const userRef = doc(db, "users", userData.uid);
    
    // First check if the user document already exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // User already exists, only update lastLogin
      await setDoc(userRef, { 
        lastLogin: new Date().toISOString() 
      }, { merge: true });
      console.log("Updated existing user's login time");
    } else {
      // New user, create document with all user data
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      console.log("Created new user document in Firestore");
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    throw error;
  }
}

// Get user data from Firestore by UID
export async function getUserFromFirestore(uid: string): Promise<UserData | null> {
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
    throw error;
  }
}

export default db;