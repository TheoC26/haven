"use client";
import React from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

const GreetingModal = ({ isOpen, onClose, onLogin, onSkip }) => {
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
              className="relative bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[70vh] flex flex-col overflow-visible"
            >
              {/* Header */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white p-4 px-12 rounded-t-2xl">
                <Dialog.Title className="text-3xl font-bold text-[#53674F] text-center">
                  Welcome to Digital Haven
                </Dialog.Title>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 pt-16 flex-1 overflow-y-auto min-h-0">
                <div className="prose max-w-none text-[#53674F]">
                  <p className="text-lg">
                    Digital Haven is a place where people can connect through
                    online clubs centered around shared interests.
                  </p>
                  <h3 className="text-xl font-semibold mt-4">How it works:</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Browse different clubs represented as houses</li>
                    <li>Join clubs that match your interests</li>
                    <li>Connect with like-minded people</li>
                    <li>Create your own club (for registered users)</li>
                  </ul>
                </div>
                {/* Buttons */}
                <div className="flex flex-col gap-4 mt-8">
                  <button
                    onClick={onLogin}
                    className="w-full bg-[#53674F] text-white py-3 px-4 rounded-lg hover:bg-[#53674F]/90 transition-colors duration-200 font-semibold text-lg"
                  >
                    Login / Sign Up
                  </button>
                  <button
                    onClick={onSkip}
                    className="w-full bg-transparent border-2 border-[#53674F] text-[#53674F] py-2.5 px-4 rounded-lg hover:bg-[#53674F] hover:text-white transition-colors duration-200"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default GreetingModal;
