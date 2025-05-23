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
              className="relative bg-[#AF6E45] border-8 border-[#A3643C] rounded-2xl shadow-2xl shadow-[#AF6E45] max-w-md w-full max-h-[80vh] overflow-auto"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
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
                  {success ? "Club Suggested!" : "Suggest a New Club"}
                </Dialog.Title>
              </div>

              {/* Body */}
              <div className="p-6">
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

                    <h3 className="text-xl font-semibold text-[#6A3C1F]">
                      Thank You for Your Suggestion!
                    </h3>

                    <p className="text-[#6A3C1F]">
                      Your club suggestion has been submitted successfully. Our
                      admins will review it and may reach out to you for more
                      information.
                    </p>

                    <button
                      onClick={handleClose}
                      className="mt-4 w-full bg-[#6A3C1F] text-white py-2 px-4 rounded-lg hover:bg-[#8B6B4F] transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#6A3C1F] mb-1">
                        Club Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#6A3C1F] mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
                        placeholder="What is this club about? What activities would members do?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#6A3C1F] mb-1">
                        Meeting Times (comma separated)
                      </label>
                      <input
                        type="text"
                        value={meetingTimes}
                        onChange={(e) => setMeetingTimes(e.target.value)}
                        placeholder="E.g. Mondays 7PM EST, Fridays 3PM EST"
                        className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#6A3C1F] mb-1">
                        Communication Method
                      </label>
                      <input
                        type="text"
                        value={communicationMethod}
                        onChange={(e) => setCommunicationMethod(e.target.value)}
                        placeholder="E.g. Discord, Zoom, Slack"
                        className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#6A3C1F] mb-1">
                        Commitment Level (1-5)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={commitmentLevel}
                          onChange={(e) => setCommitmentLevel(e.target.value)}
                          className="w-full"
                        />
                        <span>{commitmentLevel}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#6A3C1F]/70 mt-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#6A3C1F] text-white py-2 px-4 rounded-lg hover:bg-[#8B6B4F] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
