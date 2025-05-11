import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  id: string;
  username: string | null;
  isSubscriber: boolean;
}

interface Creds {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  loginMutation: UseMutationResult<FirebaseUser, Error, Creds>;
  registerMutation: UseMutationResult<FirebaseUser, Error, Creds>;
}

/* ------------------------------------------------------------------ */
/* Context setup                                                       */
/* ------------------------------------------------------------------ */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Track auth state once */
  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
          id: firebaseUser.uid,
          username: firebaseUser.displayName ?? "Guest",
          isSubscriber: false,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
  }, []);

  /* ------------------------------------------------------------------ */
  /* React‑Query mutations                                               */
  /* ------------------------------------------------------------------ */
  const loginMutation = useMutation<FirebaseUser, Error, Creds>(({ username, password }: Creds) =>
    signInWithEmailAndPassword(auth, username, password).then((res) => res.user)
  );

  const registerMutation = useMutation<FirebaseUser, Error, Creds>(({ username, password }: Creds) =>
    createUserWithEmailAndPassword(auth, username, password).then((res) => res.user)
  );

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast({ title: "Logged out", description: "You have been logged out successfully." });
    } catch (err: any) {
      toast({ title: "Logout failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, loginMutation, registerMutation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
