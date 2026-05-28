"use client";
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const ApplyModal = ({ isOpen, onClose, clubId }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [bio, setBio] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // If user is logged in, pre-populate fields from their profile
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || user.isAnonymous) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setName(userData.name || "");
          setBirthday(userData.birthday || "");
          setBio(userData.bio || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !whyJoin) {
      setError("Please fill out the required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "applications"), {
        userID: user ? user.uid : "anonymous",
        clubID: clubId,
        name,
        bio,
        birthday,
        whyWantToJoin: whyJoin,
        anythingWeShouldKnow: extraInfo,
        submittedAt: new Date(),
        status: "pending",
      });

      setSuccess(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("Failed to submit your application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    if (success) {
      setName("");
      setBirthday("");
      setBio("");
      setWhyJoin("");
      setExtraInfo("");
      setSuccess(false);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          static
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          open={isOpen}
          onClose={handleClose}
          className="relative z-50 text-black"
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
                onClick={handleClose}
                className="absolute right-4 top-4 bg-white rounded-bl-xl p-2 text-[#53674F] transition-all hover:text-[#53674F]/90 cursor-pointer"
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
                  {success ? "Application Submitted!" : "Apply to Join Club"}
                </Dialog.Title>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 pt-16 flex-1 overflow-y-auto min-h-0">
                  {success ? (
                    <div className="text-center space-y-4 mt-16">
                      <svg
                        className="mx-auto h-16 w-16 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <h3 className="text-xl font-semibold text-[#53674F]">
                        Thank You!
                      </h3>
                      <p className="text-black">
                        Your application has been successfully submitted. The
                        club leader will review your application and get back to
                        you soon.
                      </p>
                      <button
                        onClick={handleClose}
                        className="mt-4 w-full bg-[#53674F] text-white py-3 px-4 rounded-lg hover:bg-[#53674F]/90 transition-colors duration-200 font-semibold text-lg"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-16">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#53674F] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Birthday
                        </label>
                        <input
                          type="date"
                          value={birthday}
                          onChange={(e) => setBirthday(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#53674F] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Bio
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#53674F] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Why do you want to join this club?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={whyJoin}
                          onChange={(e) => setWhyJoin(e.target.value)}
                          required
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#53674F] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Anything else we should know?
                        </label>
                        <textarea
                          value={extraInfo}
                          onChange={(e) => setExtraInfo(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#53674F] focus:border-transparent"
                        />
                      </div>

                      {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                          {error}
                        </div>
                      )}

                      {/* Submit button in its own section with border */}
                      <div className="mt-8 pt-8 border-t border-[#53674F]/30">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-[#53674F] text-white py-3 px-4 rounded-lg hover:bg-[#53674F]/90 transition-colors duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Submitting..." : "Submit Application"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ApplyModal;
