"use client";
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase";

const SuggestClubModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [meetingTimes, setMeetingTimes] = useState("");
  const [communicationMethod, setCommunicationMethod] = useState("");
  const [commitmentLevel, setCommitmentLevel] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description) {
      setError("Please fill out the required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const clubSuggestion = {
        name,
        description,
        meetingTimes: meetingTimes
          .split(",")
          .map((time) => time.trim())
          .filter(Boolean),
        communicationMethod,
        commitmentLevel: Number(commitmentLevel),
        suggestedBy: user ? user.uid : "anonymous",
        suggestedAt: new Date(),
        status: "pending",
      };

      await addDoc(collection(db, "clubSuggestions"), clubSuggestion);

      setSuccess(true);
      // Reset form
      setName("");
      setDescription("");
      setMeetingTimes("");
      setCommunicationMethod("");
      setCommitmentLevel(3);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      setError("Failed to submit your suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (success) {
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
          className="relative z-50 text-[#53674F]"
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
              className="relative bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[70vh] overflow-visable"
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
              {/* Header */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white p-4 px-12 rounded-t-2xl">
                <Dialog.Title className="text-2xl font-semibold text-[#53674F] text-center">
                  {success ? "Club Suggested!" : "Suggest a New Club"}
                </Dialog.Title>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 pt-16">
                {success ? (
                  <div className="text-center space-y-4">
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
                      Thank You for Your Suggestion!
                    </h3>
                    <p className="text-[#53674F]">
                      Your club suggestion has been submitted successfully. Our
                      admins will review it and may reach out to you for more
                      information.
                    </p>
                    <button
                      onClick={handleClose}
                      className="mt-4 w-full bg-[#53674F] text-white py-3 px-4 rounded-lg hover:bg-[#53674F]/90 transition-colors duration-200 font-semibold text-lg"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#53674F] mb-1">
                        Club Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-[#53674F] focus:outline-none focus:ring-2 focus:ring-[#53674F]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#53674F] mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-[#53674F] focus:outline-none focus:ring-2 focus:ring-[#53674F]"
                        placeholder="What is this club about? What activities would members do?"
                      />
                    </div>

                    

                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#53674F] text-white py-3 px-4 rounded-lg hover:bg-[#53674F]/90 transition-colors duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Submitting..." : "Submit Suggestion"}
                    </button>
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

export default SuggestClubModal;
