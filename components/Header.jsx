"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";

const Header = ({ onInfoClick, onLoginClick, onProfileClick }) => {
  const { user } = useAuth();

  return (
    <header className="absolute top-0 left-0 w-full p-4 px-10 z-50 flex justify-between font-bold text-xl items-start bg-gradient-to-b from-[#B3DAAA] to-[#b3daaa00]">
      <Link href={"/"}>
        <Image src={"/logo.png"} width={80} height={80} alt="logo" />
      </Link>

      {/* Logo/Title (optional, could be added here) */}
      {/* <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-2xl font-bold text-[#53674F]">Digital Haven</h1>
      </div> */}

      {/* Login/Profile button */}
      {user && !user.isAnonymous ? (
        <button
          onClick={onProfileClick}
          className="text-[#53674F] hover:text-[#808d7e] transition-colors flex items-center"
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
        <div className="flex items-center gap-2 text-black">
          {/* <div className="hover:opacity-90 transition-colors px-4 py-2 cursor-pointer">
            About
          </div>
          <div className="hover:opacity-90 transition-colors px-4 py-2 cursor-pointer">
            Community
          </div> */}
          <button
            onClick={onLoginClick}
            className="hover:opacity-90 transition-colors px-4 py-2 cursor-pointer mr-3"
          >
            Login
          </button>
          <Link
            href={"https://form.typeform.com/to/xSrMkAaB"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 cursor-pointer py-2 bg-[#A1D196] text-black rounded-xl hover:scale-105 hover:opacity-90 transition-all"
          >
            Apply
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
