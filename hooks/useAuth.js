"use client"
import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user exists in database
  const checkUserExists = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  };

  // Sign in anonymously
  const signInAnon = async () => {
    try {
      const result = await signInAnonymously(auth);
      localStorage.setItem("anonymousId", result.user.uid);
      return result;
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign up with email and password
  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Sign out
  const logout = async () => {
    setUser(null);
    return signOut(auth);
  };

  // Save user profile data
  const saveUserProfile = async (uid, userData) => {
    return setDoc(doc(db, "users", uid), userData, { merge: true });
  };

  useEffect(() => {
    // Check for anonymous ID in localStorage
    const anonymousId = localStorage.getItem("anonymousId");

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else if (anonymousId) {
        // Try to restore anonymous session
        try {
          await signInAnon();
        } catch (error) {
          console.error("Error restoring anonymous session:", error);
        }
      } else {
        // Create new anonymous user
        try {
          await signInAnon();
        } catch (error) {
          console.error("Error creating anonymous user:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        signInAnon,
        signInWithGoogle,
        saveUserProfile,
        checkUserExists,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
