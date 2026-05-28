"use client";
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout, saveUserProfile } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    bio: "",
    character: "char_ambiguous",
  });
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !isOpen) return;

      try {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setEditData({
            name: data.name || "",
            bio: data.bio || "",
            character: data.character || "char_ambiguous",
          });
        } else {
          const defaultData = {
            name: "Anonymous User",
            character: "char_ambiguous",
            bio: "No profile information available.",
          };
          setUserData(defaultData);
          setEditData(defaultData);
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

  const handleSave = async () => {
    if (!editData.name) {
      setError("Name is required");
      return;
    }

    try {
      setSaveLoading(true);
      await saveUserProfile(user.uid, editData);
      setUserData({ ...userData, ...editData });
      setIsEditing(false);
      setError("");
    } catch (error) {
      console.error("Save profile error:", error);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const characterOptions = [
    { id: "char_ambiguous", label: "Neutral", img: "spritesheetambiguous" },
    { id: "char_male", label: "Style 1", img: "spritesheetmale" },
    { id: "char_female", label: "Style 2", img: "spritesheetfemale" },
  ];

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
          className="relative z-50 text-[#808d7e]"
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
              className="relative bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[70vh] flex flex-col overflow-visible"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 bg-white rounded-bl-xl p-2 text-[#53674F] transition-all hover:text-[#53674F]/90 cursor-pointer z-10"
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

              {/* Header with "Bump" */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white p-4 px-12 rounded-t-2xl -z-10">
                <Dialog.Title className="text-2xl font-semibold text-[#53674F] text-center whitespace-nowrap">
                  {isEditing ? "Edit Profile" : "Your Profile"}
                </Dialog.Title>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 pt-16 flex-1 overflow-y-auto min-h-0">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#53674F]"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-600 text-center py-4">{error}</div>
                ) : userData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Character Selection/Display */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="h-48 w-24 mb-10 overflow-hidden flex items-center justify-center relative">
                        <img
                          src={`/art/${characterOptions.find(o => o.id === (isEditing ? editData.character : userData.character))?.img || 'spritesheetambiguous'}.png`}
                          alt="Character"
                          className="h-full object-cover object-top"
                          style={{ transform: "scale(4.5) translateY(12%)" }}
                        />
                      </div>
                      
                      {isEditing && (
                        <div className="grid grid-cols-3 gap-2 w-full">
                          {characterOptions.map((char) => (
                            <button
                              key={char.id}
                              onClick={() => setEditData({ ...editData, character: char.id })}
                              className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                                editData.character === char.id
                                  ? "border-[#53674F] bg-[#53674F]/10 text-[#53674F]"
                                  : "border-gray-100 hover:border-gray-300"
                              }`}
                            >
                              {char.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column: User Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-[#53674F] mb-1 uppercase tracking-wider">Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#53674F] outline-none"
                          />
                        ) : (
                          <h3 className="text-xl font-semibold text-[#53674F]">{userData.name}</h3>
                        )}
                      </div>

                      {!isEditing && (
                        <div>
                          <label className="block text-sm font-bold text-[#53674F] mb-1 uppercase tracking-wider">Email</label>
                          <p className="text-[#53674F]/80">{user.email || "Anonymous User"}</p>
                        </div>
                      )}

                      <div className="border-t border-[#53674F]/10 pt-4">
                        <label className="block text-sm font-bold text-[#53674F] mb-1 uppercase tracking-wider">Birthday</label>
                        <p className="text-[#53674F]/80">{formatDate(userData.birthday)}</p>
                      </div>

                      <div className="border-t border-[#53674F]/10 pt-4">
                        <label className="block text-sm font-bold text-[#53674F] mb-1 uppercase tracking-wider">Bio</label>
                        {isEditing ? (
                          <textarea
                            value={editData.bio}
                            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#53674F] outline-none"
                            placeholder="Tell us about yourself..."
                          />
                        ) : (
                          <p className="mt-1 text-[#53674F]/80 italic">
                            {userData.bio || "No profile information available."}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-[#53674F]/10 pt-6 space-y-3">
                        {isEditing ? (
                          <div className="flex gap-3">
                            <button
                              onClick={handleSave}
                              disabled={saveLoading}
                              className="flex-1 bg-[#53674F] text-white py-3 rounded-lg font-bold hover:bg-[#53674F]/90 transition-all disabled:opacity-50"
                            >
                              {saveLoading ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-6 py-3 border border-gray-200 rounded-lg font-bold hover:bg-gray-50 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="w-full bg-[#53674F] text-white py-3 px-4 rounded-lg hover:bg-[#53674F]/90 transition-colors duration-200 font-semibold text-lg"
                            >
                              Edit Profile
                            </button>
                            <button
                              onClick={handleLogout}
                              className="w-full border border-[#53674F] text-[#53674F] py-3 px-4 rounded-lg hover:bg-[#53674F]/10 transition-colors duration-200 font-semibold text-lg"
                            >
                              Log Out
                            </button>
                          </>
                        )}
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
