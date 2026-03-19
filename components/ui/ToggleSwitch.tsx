"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TRANSITION_SPRING_SNAPPY, TAP_SCALE } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  isActive: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isActive, onToggle }) => {
  return (
    <motion.div
      whileTap={{ scale: TAP_SCALE }}
      onClick={onToggle}
      className={cn(
        "relative w-[50px] h-[26px] rounded-full cursor-pointer transition-all duration-500 flex items-center p-[3px]",
        isActive
          ? "bg-primary shadow-[0_0_15px_-3px_hsl(var(--primary))]"
          : "bg-white/10 border border-white/5"
      )}
    >
      <motion.div
        className="w-[20px] h-[20px] bg-white rounded-full shadow-xl"
        animate={{
          x: isActive ? 24 : 0,
        }}
        transition={TRANSITION_SPRING_SNAPPY}
      />
    </motion.div>
  );
};

export default ToggleSwitch;
