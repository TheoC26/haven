"use client";
import React, { useState } from "react";
import { Dialog, Tab } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const AuthModal = ({ isOpen, onClose, onAuthComplete }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, signup, signInWithGoogle } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      onAuthComplete();
      onClose();
    } catch (error) {
      setError("Failed to log in. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      await signup(email, password);
      onAuthComplete();
      onClose();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email already in use. Please try logging in instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else {
        setError("Failed to create account. Please try again.");
      }
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      onAuthComplete();
      onClose();
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.");
      console.error("Google sign-in error:", error);
    } finally {
      setLoading(false);
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
              className="relative bg-[#AF6E45] border-8 border-[#A3643C] rounded-2xl shadow-2xl shadow-[#AF6E45] max-w-md w-full overflow-hidden"
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
                  {activeTab === "login" ? "Login" : "Sign Up"}
                </Dialog.Title>
              </div>

              {/* Body */}
              <div className="p-6">
                <Tab.Group
                  selectedIndex={activeTab === "login" ? 0 : 1}
                  onChange={(index) =>
                    setActiveTab(index === 0 ? "login" : "signup")
                  }
                >
                  <Tab.List className="flex mb-6 border-b border-[#6A3C1F]">
                    <Tab
                      className={({ selected }) =>
                        `flex-1 py-2 text-lg font-medium leading-5 text-[#6A3C1F] border-b-2 ${
                          selected
                            ? "border-[#6A3C1F]"
                            : "border-transparent hover:border-[#6A3C1F]/50"
                        }`
                      }
                    >
                      Login
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        `flex-1 py-2 text-lg font-medium leading-5 text-[#6A3C1F] border-b-2 ${
                          selected
                            ? "border-[#6A3C1F]"
                            : "border-transparent hover:border-[#6A3C1F]/50"
                        }`
                      }
                    >
                      Sign Up
                    </Tab>
                  </Tab.List>
                  <Tab.Panels>
                    {/* Login Panel */}
                    <Tab.Panel>
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#6A3C1F] mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#6A3C1F] mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
                          />
                        </div>

                        {error && (
                          <div className="text-red-600 text-sm mt-2">
                            {error}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-[#6A3C1F] text-white py-2 px-4 rounded-lg hover:bg-[#8B6B4F] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Loading..." : "Login"}
                        </button>
                      </form>
                    </Tab.Panel>

                    {/* Sign Up Panel */}
                    <Tab.Panel>
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#6A3C1F] mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#6A3C1F] mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#6A3C1F] mb-1">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-[#6A3C1F] focus:outline-none focus:ring-2 focus:ring-[#A27B5C] bg-[#BE9871]"
                          />
                        </div>

                        {error && (
                          <div className="text-red-600 text-sm mt-2">
                            {error}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-[#6A3C1F] text-white py-2 px-4 rounded-lg hover:bg-[#8B6B4F] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Loading..." : "Sign Up"}
                        </button>
                      </form>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>

                {/* Google Sign In */}
                <div className="mt-6 pt-6 border-t border-[#6A3C1F]/30">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12c0,5.523,4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    Continue with Google
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

export default AuthModal;
