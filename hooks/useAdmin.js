import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

// Admin IDs - in a real app, this would be stored in Firestore or environment variables
const ADMIN_IDS = ["LOYLdbBW7LXUFtddSy28Ag1PEhM2"]; // Replace with actual admin user IDs

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Global admin check
      if (ADMIN_IDS.includes(user.uid)) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Could check for additional admin roles stored in Firestore
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Check if user is a club admin (leader)
  const isClubAdmin = async (clubId) => {
    if (!user) return false;

    try {
      const clubRef = doc(db, "clubs", clubId);
      const clubDoc = await getDoc(clubRef);

      if (clubDoc.exists() && clubDoc.data().leaderID === user.uid) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking club admin status:", error);
      return false;
    }
  };

  return {
    isAdmin,
    isClubAdmin,
    loading,
  };
};
