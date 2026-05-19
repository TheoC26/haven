"use client";
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const OnboardingModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [character, setCharacter] = useState("char_ambiguous");
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
    if (!name || !birthday || !character) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name,
        character,
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
              Choose your character
            </h3>
            <p className="text-[#6A3C1F]/80">
              Select an avatar that represents you best.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { id: "char_ambiguous", label: "Neutral" },
                { id: "char_male", label: "Style 1" },
                { id: "char_female", label: "Style 2" },
              ].map((char) => (
                <div
                  key={char.id}
                  onClick={() => setCharacter(char.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    character === char.id
                      ? "border-[#53674F] bg-[#53674F]/10 scale-105"
                      : "border-gray-200 hover:border-[#53674F]/50"
                  }`}
                >
                  <div className="aspect-[1/2] w-full bg-gray-100 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                    <img
                      src={`/art/${char.id === "char_ambiguous" ? "spritesheetambiguous" : char.id === "char_male" ? "spritesheetmale" : "spritesheetfemale"}.png`}
                      alt={char.label}
                      className="h-full object-cover object-top"
                      style={{ transform: "scale(2) translateY(10%)" }}
                    />
                  </div>
                  <p className="text-center font-medium text-sm">{char.label}</p>
                </div>
              ))}
            </div>
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
              className="relative bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[70vh] overflow-visable"
            >
              {/* Header */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white p-4 px-12 rounded-t-2xl">
                <Dialog.Title className="text-2xl font-semibold text-[#53674F] text-center">
                  Welcome to Digital Haven
                </Dialog.Title>
                <p className="text-center mt-2 text-[#53674F]/80">
                  Let's set up your profile ({step}/4)
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 pt-16">
                {renderStep()}
                {error && (
                  <div className="text-red-600 text-sm mt-4">{error}</div>
                )}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 rounded-lg border border-[#53674F] text-[#53674F] hover:bg-[#53674F]/10 transition-colors duration-200"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}
                  {step < 4 ? (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 rounded-lg bg-[#53674F] text-white hover:bg-[#53674F]/90 transition-colors duration-200 font-semibold text-lg"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-2 rounded-lg bg-[#53674F] text-white hover:bg-[#53674F]/90 transition-colors duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
