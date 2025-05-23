"use client";
import React, { useState } from 'react';
import HouseModal from '../modals/HouseModal';

export const HouseWrapper = ({ name, description, children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer transition-transform hover:scale-105"
      >
        {children}
      </div>

      <HouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        house={{ name, description }}
      />
    </>
  );
}; 