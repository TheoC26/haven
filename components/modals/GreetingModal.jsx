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
              className="relative bg-[#AF6E45] border-8 border-[#A3643C] rounded-2xl shadow-2xl shadow-[#AF6E45] max-w-lg w-full"
            >
              {/* Header */}
              <div className="p-6 border-b-4 border-[#6A3C1F]">
                <Dialog.Title className="text-3xl font-bold text-[#6A3C1F] text-center">
                  Welcome to Digital Haven
                </Dialog.Title>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <div className="prose max-w-none text-[#6A3C1F]">
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
                    className="w-full bg-[#6A3C1F] text-white py-3 px-4 rounded-lg hover:bg-[#8B6B4F] transition-colors duration-200 font-semibold text-lg"
                  >
                    Login / Sign Up
                  </button>

                  <button
                    onClick={onSkip}
                    className="w-full bg-transparent border-2 border-[#6A3C1F] text-[#6A3C1F] py-2.5 px-4 rounded-lg hover:bg-[#6A3C1F10] transition-colors duration-200"
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
