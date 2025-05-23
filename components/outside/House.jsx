"use client";
import React from "react";
import HouseLeft from "../svg/HouseLeft";
import HouseRight from "../svg/HouseRight";
import { HouseWrapper } from "./HouseWrapper";

export const House = ({ club, index, onClick }) => {

  if (index % 2 === 1) {
    return (
      <div
        className="cursor-pointer transition-transform hover:scale-105"
        onClick={() => onClick && onClick(club)}
      >
        <HouseLeft />
        <div className="absolute top-[53%] left-[5%] right-[58%]">
          <h3 className="text-lg font-bold text-[#6A3C1F] text-center truncate max-w-full">
            {club?.name || `House ${index + 1}`}
          </h3>
        </div>
      </div>
    );  
  } else {
    return (
      <div
        className="cursor-pointer transition-transform hover:scale-105"
        onClick={() => onClick && onClick(club)}
      >
        <HouseRight />
        <div className="absolute top-[53%] right-[5%] left-[58%]">
          <h3 className="text-lg font-bold text-[#6A3C1F] text-center truncate max-w-full">
            {club?.name || `House ${index + 1}`}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-64 h-48 bg-[#AF6E45] border-8 border-[#A3643C] rounded-2xl shadow-xl cursor-pointer transform transition-transform hover:scale-105"
      onClick={() => onClick && onClick(club)}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {/* House roof */}
        <div className="absolute -top-14 left-0 w-full h-24 bg-[#8B4513] border-8 border-[#703911] rounded-t-3xl"></div>

        {/* House window */}
        <div className="absolute top-6 left-6 w-12 h-12 bg-[#F5DEB3] border-4 border-[#703911] rounded-lg grid grid-cols-2 grid-rows-2 overflow-hidden">
          <div className="border-r border-b border-[#703911]"></div>
          <div className="border-b border-[#703911]"></div>
          <div className="border-r border-[#703911]"></div>
          <div></div>
        </div>

        {/* House window */}
        <div className="absolute top-6 right-6 w-12 h-12 bg-[#F5DEB3] border-4 border-[#703911] rounded-lg grid grid-cols-2 grid-rows-2 overflow-hidden">
          <div className="border-r border-b border-[#703911]"></div>
          <div className="border-b border-[#703911]"></div>
          <div className="border-r border-[#703911]"></div>
          <div></div>
        </div>

        {/* Door */}
        <div className="absolute bottom-0 w-14 h-20 bg-[#5D4037] border-t-4 border-x-4 border-[#3E2723] rounded-t-lg">
          <div className="absolute right-2 top-1/2 w-2 h-2 bg-[#FFEB3B] rounded-full"></div>
        </div>

        {/* Club name */}
        <div className="absolute top-[60%] left-0 w-full flex justify-center items-center px-4">
          <h3 className="text-lg font-bold text-[#6A3C1F] text-center truncate max-w-full">
            {club?.name || `House ${index + 1}`}
          </h3>
        </div>
      </div>
    </div>
  );
};
