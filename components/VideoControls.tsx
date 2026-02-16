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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
        className="flex items-center gap-2 text-white px-3 py-2.5 rounded-2xl max-w-full"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
        }}
        onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onTogglePlay} className="p-0.5 hover:text-primary transition-colors shrink-0">
        {isPlaying ? <Pause size={18} strokeWidth={2} /> : <Play size={18} strokeWidth={2} />}
      </button>

      <span className="text-[10px] font-mono w-8 text-center text-white/60">{formatTime(currentTime)}</span>

      <div className="flex-1 relative h-4 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/15" />
        {/* Progress fill */}
        <div
          className="absolute left-0 h-[3px] rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
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
          className="video-progress absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>

      <span className="text-[10px] font-mono w-8 text-center text-white/60">{formatTime(duration)}</span>

      <button onClick={onToggleMute} className="p-0.5 hover:text-primary transition-colors shrink-0">
        {isMuted ? <VolumeX size={18} strokeWidth={2} /> : <Volume2 size={18} strokeWidth={2} />}
      </button>
    </div>
  );
};

export default VideoControls;
