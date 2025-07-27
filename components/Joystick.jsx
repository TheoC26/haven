import React, { useState, useRef } from 'react';

const Joystick = ({ onMove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const stickRef = useRef(null);
  const baseRef = useRef(null);

  const handleTouchStart = (e) => {
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const base = baseRef.current.getBoundingClientRect();
    const stick = stickRef.current;

    const stickRadius = stick.offsetWidth / 2;
    const baseRadius = base.width / 2;

    let x = touch.clientX - base.left - baseRadius;
    let y = touch.clientY - base.top - baseRadius;

    const distance = Math.sqrt(x * x + y * y);

    if (distance > baseRadius - stickRadius) {
      x = (x / distance) * (baseRadius - stickRadius);
      y = (y / distance) * (baseRadius - stickRadius);
    }

    stick.style.transform = `translate(${x}px, ${y}px)`;

    const angle = Math.atan2(y, x);
    const degrees = angle * (180 / Math.PI);

    const directions = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    if (degrees >= -22.5 && degrees < 22.5) {
      // Right
      directions.right = true;
    } else if (degrees >= 22.5 && degrees < 67.5) {
      // Down-Right
      directions.down = true;
      directions.right = true;
    } else if (degrees >= 67.5 && degrees < 112.5) {
      // Down
      directions.down = true;
    } else if (degrees >= 112.5 && degrees < 157.5) {
      // Down-Left
      directions.down = true;
      directions.left = true;
    } else if (degrees >= 157.5 || degrees < -157.5) {
      // Left
      directions.left = true;
    } else if (degrees >= -157.5 && degrees < -112.5) {
      // Up-Left
      directions.up = true;
      directions.left = true;
    } else if (degrees >= -112.5 && degrees < -67.5) {
      // Up
      directions.up = true;
    } else if (degrees >= -67.5 && degrees < -22.5) {
      // Up-Right
      directions.up = true;
      directions.right = true;
    }

    onMove(directions);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    stickRef.current.style.transform = 'translate(0, 0)';
    onMove({
      up: false,
      down: false,
      left: false,
      right: false,
    });
  };

  return (
    <div
      ref={baseRef}
      className="fixed bottom-10 right-10 w-32 h-32 bg-gray-400 bg-opacity-50 rounded-full flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={stickRef}
        className="w-16 h-16 bg-gray-600 rounded-full"
      ></div>
    </div>
  );
};

export default Joystick;