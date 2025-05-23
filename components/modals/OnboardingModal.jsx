"use client";
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const OnboardingModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6A3C1F");
  const [birthday, setBirthday] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user, saveUserProfile } = useAuth();

  const handleNext = () => {
    if (step === 1 && !name) {
      setError("Please enter your name");
      return;
    }

    if (step === 2 && !birthday) {
      setError("Please select your birthday");
      return;
    }

    setError("");
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!name || !birthday || !color) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name,
        color,
        birthday,
        bio: bio || "",
        createdAt: new Date(),
      };

      await saveUserProfile(user.uid, userData);
      onClose();
    } catch (error) {
      setError("Failed to save your profile. Please try again.");
      console.error("Profile save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#6A3C1F]">
              What's your name?
            </h3>
            <p className="text-[#6A3C1F]/80">
              This is how you'll appear to others in the community.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#6A3C1F]">
              When's your birthday?
            </h3>
            <p className="text-[#6A3C1F]/80">
              This helps us personalize your experience.
            </p>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#6A3C1F]">
              Choose your color
            </h3>
            <p className="text-[#6A3C1F]/80">
              Select a color that represents you best.
            </p>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-12 rounded-lg cursor-pointer border border-[#6A3C1F]"
            />
            <div
              className="mt-4 h-16 w-full rounded-lg border border-[#6A3C1F]"
              style={{ backgroundColor: color }}
            ></div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#6A3C1F]">
              Tell us about yourself
            </h3>
            <p className="text-[#6A3C1F]/80">
              This is optional, but helps others get to know you.
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Your bio (optional)"
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
            />
          </div>
        );
      default:
        return null;
    }
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
          onClose={() => {}}
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
              {/* Header */}
              <div className="p-6 border-b-4 border-[#6A3C1F]">
                <Dialog.Title className="text-2xl font-bold text-[#6A3C1F] text-center">
                  Welcome to Digital Haven
                </Dialog.Title>
                <p className="text-center mt-2 text-[#6A3C1F]/80">
                  Let's set up your profile ({step}/4)
                </p>
              </div>

              {/* Body */}
              <div className="p-6">
                {renderStep()}

                {error && (
                  <div className="text-red-600 text-sm mt-4">{error}</div>
                )}

                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 rounded-lg border border-[#6A3C1F] text-[#6A3C1F] hover:bg-[#6A3C1F10] transition-colors duration-200"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {step < 4 ? (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 rounded-lg bg-[#6A3C1F] text-white hover:bg-[#8B6B4F] transition-colors duration-200"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-2 rounded-lg bg-[#6A3C1F] text-white hover:bg-[#8B6B4F] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Saving..." : "Finish"}
                    </button>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
