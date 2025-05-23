"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Header = ({ onInfoClick, onLoginClick, onProfileClick }) => {
  const { user } = useAuth();

  return (
    <header className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-center">
      {/* Info button */}
      <button
        onClick={onInfoClick}
        className="text-[#6A3C1F] hover:text-[#8B6B4F] transition-colors"
        aria-label="Info"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </button>

      {/* Logo/Title (optional, could be added here) */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-2xl font-bold text-[#6A3C1F]">Digital Haven</h1>
      </div>

      {/* Login/Profile button */}
      {user && !user.isAnonymous ? (
        <button
          onClick={onProfileClick}
          className="text-[#6A3C1F] hover:text-[#8B6B4F] transition-colors flex items-center"
          aria-label="Profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={onLoginClick}
          className="px-4 py-2 bg-[#6A3C1F] text-white rounded-lg hover:bg-[#8B6B4F] transition-colors"
        >
          Login
        </button>
      )}
    </header>
  );
};

export default Header;
