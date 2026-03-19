"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { TAP_SCALE, TRANSITION_SPRING_SNAPPY } from '@/lib/animations';

interface VideoControlsProps {
    isPlaying: boolean;
    isMuted: boolean;
    onTogglePlay: () => void;
    onToggleMute: () => void;
    onSeek: (time: number) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
    isPlaying,
    isMuted,
    onTogglePlay,
    onToggleMute,
    onSeek,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const handleProgress = (event: Event) => {
          const customEvent = event as CustomEvent;
          if (!isDragging) {
            const { currentTime, duration } = customEvent.detail;
            setCurrentTime(currentTime);
            setDuration(duration);
          }
      };

      window.addEventListener('video-progress', handleProgress);
      return () => window.removeEventListener('video-progress', handleProgress);
  }, [isDragging]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const handleSeekStart = () => {
      setIsDragging(true);
  }

  const handleSeekEnd = () => {
      setIsDragging(false);
      onSeek(currentTime);
  }

  // Hide controls if no duration (optional, but might flash 0:00 initially)
  // Keeping it visible but 0:00 is usually better UX than popping in.

  return (
    <div
        className="flex items-center gap-3 text-white w-full transition-all pl-4 pr-20"
        onClick={(e) => e.stopPropagation()}
    >
      <motion.button
        whileTap={{ scale: TAP_SCALE }}
        transition={TRANSITION_SPRING_SNAPPY}
        onClick={onTogglePlay}
        className="p-1 hover:text-white transition-all shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
      >
        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
      </motion.button>

      <div className="flex-1 relative flex items-center h-8 group">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-[4px] bg-white/20 rounded-full overflow-hidden relative backdrop-blur-sm">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/80 to-white transition-all duration-100 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ width: `${(currentTime / (duration || 100)) * 100}%` }}
              />
            </div>
          </div>
          <input
            ref={progressRef}
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            onChange={handleSeekChange}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
      </div>

      <span className="text-[9px] font-black italic uppercase opacity-90 shrink-0 drop-shadow-md">{formatTime(currentTime)} / {formatTime(duration)}</span>

      <motion.button
        whileTap={{ scale: TAP_SCALE }}
        transition={TRANSITION_SPRING_SNAPPY}
        onClick={onToggleMute}
        className="p-1.5 hover:text-white transition-all shrink-0"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </motion.button>
    </div>
  );
};

export default VideoControls;
