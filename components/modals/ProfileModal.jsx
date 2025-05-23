"use client";
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !isOpen) return;

      try {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          // User exists in auth but not in Firestore
          setUserData({
            name: "Anonymous User",
            color: "#6A3C1F",
            bio: "No profile information available.",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to log out. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
        <Dialog
          as={motion.div}
          static
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isOpen}
          onClose={onClose}
          className="relative z-50 text-[#7E4C2C]"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          {/* Full-screen container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#AF6E45] border-8 border-[#A3643C] rounded-2xl shadow-2xl shadow-[#AF6E45] max-w-md w-full"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-[#7E4C2C] transition-all hover:text-yellow-600 cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Header */}
              <div className="p-6 border-b-4 border-[#6A3C1F]">
                <Dialog.Title className="text-2xl font-bold text-[#6A3C1F] text-center">
                  Your Profile
                </Dialog.Title>
              </div>

              {/* Body */}
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A3C1F]"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-600 text-center py-4">{error}</div>
                ) : userData ? (
                  <div className="space-y-6">
                    {/* User color display */}
                    <div
                      className="h-20 w-20 rounded-full mx-auto border-4 border-[#6A3C1F]"
                      style={{ backgroundColor: userData.color || "#6A3C1F" }}
                    ></div>

                    {/* User info */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-[#6A3C1F]">
                          {userData.name}
                        </h3>
                        <p className="text-[#6A3C1F]/80">
                          {user.email || "Anonymous User"}
                        </p>
                      </div>

                      <div className="border-t border-[#6A3C1F]/30 pt-4">
                        <h4 className="font-medium text-[#6A3C1F]">Birthday</h4>
                        <p>{formatDate(userData.birthday)}</p>
                      </div>

                      {userData.bio && (
                        <div className="border-t border-[#6A3C1F]/30 pt-4">
                          <h4 className="font-medium text-[#6A3C1F]">Bio</h4>
                          <p className="mt-1">{userData.bio}</p>
                        </div>
                      )}

                      {/* Edit Profile button (for future implementation) */}
                      <div className="border-t border-[#6A3C1F]/30 pt-4">
                        <button
                          className="w-full bg-[#6A3C1F] text-white py-2 px-4 rounded-lg hover:bg-[#8B6B4F] transition-colors duration-200 mb-2"
                          onClick={() =>
                            alert("Edit profile functionality coming soon!")
                          }
                        >
                          Edit Profile
                        </button>
                        <button
                          className="w-full border border-[#6A3C1F] text-[#6A3C1F] py-2 px-4 rounded-lg hover:bg-[#6A3C1F10] transition-colors duration-200"
                          onClick={handleLogout}
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
