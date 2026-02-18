"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  isActive: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isActive, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={`relative w-[48px] h-[24px] rounded-full cursor-pointer transition-all duration-300 ${
        isActive ? 'bg-primary neon-glow-primary' : 'bg-white/10 border border-white/5'
      }`}
    >
      <motion.div
        className="absolute top-[2px] left-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-lg"
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        style={{
          x: isActive ? '24px' : '0px',
        }}
      />
    </div>
  );
};

export default ToggleSwitch;
