"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

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
        className="flex items-center gap-4 text-white w-full transition-all"
        onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onTogglePlay} className="p-1 hover:text-white transition-all active:scale-90 shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
      </button>

      <div className="flex-1 relative flex items-center h-10 group">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-[4px] bg-white/10 rounded-full overflow-hidden relative backdrop-blur-md">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/60 via-white to-white transition-all duration-100 ease-out shadow-[0_0_12px_rgba(255,255,255,0.7)]"
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

      <button onClick={onToggleMute} className="p-1.5 hover:text-white transition-all active:scale-90 shrink-0">
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
};

export default VideoControls;
