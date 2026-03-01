"use client";

import React, { memo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { SlideDTO, HtmlSlideDTO, VideoSlideDTO } from '@/lib/dto';
import { useStore } from '@/store/useStore';
import VideoControls from './VideoControls';
import { shallow } from 'zustand/shallow';
import { AnimatePresence, motion } from 'framer-motion';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import Sidebar from './Sidebar';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';
import { EyeOff } from 'lucide-react';
import SecretOverlay from './SecretOverlay';
import PwaOverlay from './PwaOverlay';
import { DEFAULT_AVATAR_URL } from '@/lib/constants';
import LocalVideoPlayer from './LocalVideoPlayer';
import { useQueryClient } from '@tanstack/react-query';
import { fetchComments, fetchAuthorProfile } from '@/lib/queries';

import HtmlContent from './HtmlContent';

interface SlideUIProps {
    slide: SlideDTO;
    isLocked?: boolean;
}

import { usePWAStatus } from '@/hooks/usePWAStatus';

const SlideUI = ({ slide, isLocked = false }: SlideUIProps) => {
    const {
        togglePlay,
        isPlaying,
        isMuted,
        seekTo,
        setIsMuted,
        isImmersionMode,
        setImmersionMode
    } = useStore(state => ({
        togglePlay: state.togglePlay,
        isPlaying: state.isPlaying,
        isMuted: state.isMuted,
        seekTo: state.seekTo,
        setIsMuted: state.setIsMuted,
        isImmersionMode: state.isImmersionMode,
        setImmersionMode: state.setImmersionMode
    }), shallow);

    const [showPlaybackIcon, setShowPlaybackIcon] = useState(false);
    const iconTimer = useRef<NodeJS.Timeout | null>(null);

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // If locked, we do NOT want to toggle play. We want clicks to go through to overlay (or just be ignored here)
        // But since this container has pointer-events-none when locked (see return), this might not be reachable.
        // Keeping logic just in case.
        if (isLocked) return;

        if (e.target === e.currentTarget) {
            togglePlay();
            setShowPlaybackIcon(true);
            if (iconTimer.current) {
                clearTimeout(iconTimer.current);
            }
            iconTimer.current = setTimeout(() => {
                setShowPlaybackIcon(false);
            }, 800);
        }
    }

    useEffect(() => {
        return () => {
            if (iconTimer.current) {
                clearTimeout(iconTimer.current);
            }
        };
    }, []);

    const isVideoSlide = slide.type === 'video';

    return (
      <div
        className={cn(
            "absolute inset-0 z-20 p-4 flex flex-col justify-end text-white pointer-events-none"
        )}
        onClick={handleContainerClick}
      >
        {/* Immersion Exit Overlay */}
        <AnimatePresence>
            {isImmersionMode && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 cursor-pointer pointer-events-auto"
                    onClick={() => setImmersionMode(false)}
                />
            )}
        </AnimatePresence>

        {/* Top gradient */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none" />

        <AnimatePresence>
            {/* Center click area for play/pause toggle */}
            {!isImmersionMode && (
                <div
                    className={cn(
                        "absolute inset-0 z-10",
                        !isLocked ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
                    )}
                    onClick={handleContainerClick}
                />
            )}

            {!isLocked && showPlaybackIcon && (
                <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="bg-black/50 rounded-full p-4">
                        {isPlaying ? (
                            <PlayIcon className="w-12 h-12 text-white" />
                        ) : (
                            <PauseIcon className="w-12 h-12 text-white" />
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Coordinated UI Animation Wrapper */}
        <motion.div
            className="w-full flex flex-col items-start z-20 pointer-events-none"
            initial={false}
            animate={{
                y: isImmersionMode ? 100 : 0,
                opacity: isImmersionMode ? 0 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* UI Controls Container */}
            <div className="relative w-full flex flex-col items-start text-left mb-2 pb-1 px-4">
                <div className="flex items-center gap-2.5 mb-2.5 pointer-events-auto max-w-full">
                    <Image
                        src={slide.avatar || DEFAULT_AVATAR_URL}
                        alt={slide.username || 'User'}
                        width={36}
                        height={36}
                        className="rounded-full border border-white/50 shrink-0"
                    />
                    <div className="flex items-center gap-2 truncate">
                        <p className="font-black italic uppercase tracking-widest text-lg truncate min-w-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">{slide.username}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setImmersionMode(true);
                            }}
                            className="p-1.5 bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all active:scale-90 pointer-events-auto group"
                            title="Tryb immersyjny"
                        >
                            <EyeOff size={14} className="text-white/80 group-hover:text-white" />
                        </button>
                    </div>
                </div>

                {slide.data && 'title' in slide.data && (
                    <h2 className="text-2xl font-black italic uppercase tracking-tight mb-1 truncate w-full drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] text-white leading-tight">
                        {slide.data.title}
                    </h2>
                )}
                {slide.data && 'description' in slide.data && (
                    <p className="text-sm font-bold tracking-wide opacity-90 truncate w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-white leading-relaxed">
                        {slide.data.description}
                    </p>
                )}
            </div>

            {/* Hide video controls if locked? Usually yes. */}
            {isVideoSlide && !isLocked && (
                <div className="pointer-events-auto w-full px-0 pb-[calc(env(safe-area-inset-bottom)+12px)]">
                    <VideoControls
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        onTogglePlay={togglePlay}
                        onToggleMute={() => setIsMuted(!isMuted)}
                        onSeek={seekTo}
                    />
                </div>
            )}
        </motion.div>

        <motion.div
            className="absolute right-0 inset-y-0 z-30 pointer-events-none flex items-center"
            animate={{
                // Removed x: 100 to keep it visible always as requested
                opacity: isImmersionMode ? 0.4 : 1,
                scale: isImmersionMode ? 0.9 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <Sidebar
                slideId={slide.id}
                initialLikes={slide.initialLikes}
                initialIsLiked={slide.isLiked}
                commentsCount={slide.initialComments}
                authorId={slide.userId}
                authorAvatar={slide.avatar || DEFAULT_AVATAR_URL}
            />
        </motion.div>
      </div>
    );
};

// --- Main Slide Component ---

interface SlideProps {
    slide: SlideDTO;
    priorityLoad?: boolean;
}

const Slide = memo<SlideProps>(({ slide, priorityLoad = false }) => {
    const { isLoggedIn } = useUser();
    const activeSlideId = useStore(state => state.activeSlide?.id);
    const { isStandalone } = usePWAStatus();

    // Determine active status: must be selected AND not locked by overlay
    // But overlay is checked below. If overlay is active, video should be paused.

    const isLockedSecret = slide.accessLevel === 'SECRET_PATRON' && !isLoggedIn;
    const isLockedPWA = slide.accessLevel === 'SECRET_PWA' && !isStandalone;
    const isLocked = isLockedSecret || isLockedPWA;

    const isActive = activeSlideId === slide.id;
    const shouldPlay = isActive && !isLocked;

    const queryClient = useQueryClient();

    // Prefetch comments and author profile logic
    useEffect(() => {
        if (isActive && slide?.id) {
            // Prefetch Comments (Infinite Query to match CommentsModal)
            try {
                queryClient.prefetchInfiniteQuery({
                    queryKey: ['comments', slide.id],
                    queryFn: ({ pageParam }) => fetchComments({ pageParam, slideId: slide.id }),
                    initialPageParam: '',
                    staleTime: 1000 * 60 * 5,
                });
            } catch (err) {
                console.error("Prefetch comments error:", err);
            }

            // Prefetch Author Profile
            if (slide.userId) {
                try {
                    queryClient.prefetchQuery({
                        queryKey: ['author', slide.userId],
                        queryFn: () => fetchAuthorProfile(slide.userId),
                        staleTime: 1000 * 60 * 5,
                    });
                } catch (err) {
                    console.error("Prefetch author error:", err);
                }
            }
        }
    }, [isActive, slide?.id, slide?.userId, queryClient]);

    const renderContent = () => {
        switch (slide.type) {
            case 'video':
                // Pass shouldPlay instead of just isActive to control playback under overlay
                return <LocalVideoPlayer slide={slide as VideoSlideDTO} isActive={shouldPlay} shouldLoad={priorityLoad} />;
            case 'html':
                return (
                    <HtmlContent
                        data={(slide as HtmlSlideDTO).data}
                        isActive={isActive}
                    />
                );
            default:
                return <div className="w-full h-full bg-gray-800 flex items-center justify-center"><p>Unsupported slide type</p></div>;
        }
    };

    return (
        <div className="relative w-full h-full z-10 bg-black">
            {/* Background Content with Blur if locked */}
            <div className={cn("w-full h-full transition-all duration-300", isLocked && "blur-md brightness-50")}>
                {renderContent()}
            </div>

            {/* Overlays (Rendered on top without blur) - z-10 */}
            {isLockedSecret && <SecretOverlay />}
            {isLockedPWA && <PwaOverlay />}

            {/* UI (Always rendered, but pointer-events managed) - z-20 */}
            <SlideUI slide={slide} isLocked={isLocked} />
        </div>
    );
});

Slide.displayName = 'Slide';
export default Slide;
