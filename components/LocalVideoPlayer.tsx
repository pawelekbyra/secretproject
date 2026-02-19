"use client";

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useStore } from '@/store/useStore';
import { shallow } from 'zustand/shallow';
import { VideoSlideDTO } from '@/lib/dto';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LocalVideoPlayerProps {
    slide: VideoSlideDTO;
    isActive: boolean;
    playMode: 'active' | 'buffer' | 'hidden';
}

const LocalVideoPlayer = ({ slide, isActive, playMode }: LocalVideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [isReadyToPlay, setIsReadyToPlay] = useState(false);

    // Global state
    const { isPlaying, isMuted } = useStore(
        (state) => ({
            isPlaying: state.isPlaying,
            isMuted: state.isMuted,
        }),
        shallow
    );

    // 1. Inicjalizacja HLS (tylko raz)
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const { hlsUrl, mp4Url } = slide.data;

        if (Hls.isSupported() && hlsUrl) {
            const hls = new Hls({
                autoStartLoad: false, // WAŻNE: Nie ładuj automatycznie, czekaj na sygnał
                capLevelToPlayerSize: true,
            });
            hlsRef.current = hls;
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsReadyToPlay(true);
            });

            // Cleanup
            return () => {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                }
            };
        } else if (video.canPlayType('application/vnd.apple.mpegurl') && hlsUrl) {
             // Native HLS (iOS)
             video.src = hlsUrl;
             setIsReadyToPlay(true);
        } else if (mp4Url) {
             video.src = mp4Url;
             setIsReadyToPlay(true);
        }
    }, [slide.data]);

    // 2. Logika Preloadingu (Smart Loading)
    useEffect(() => {
        const hls = hlsRef.current;
        const isPreloadNeeded = playMode === 'active' || playMode === 'buffer';

        if (isPreloadNeeded && hls && slide.data.hlsUrl) {
            if (hls.url !== slide.data.hlsUrl) {
                 hls.loadSource(slide.data.hlsUrl);
                 hls.startLoad();
            }
        }
    }, [playMode, slide.data.hlsUrl, slide.id]);

    // 3. Logika Odtwarzania (Tylko Active)
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const shouldPlay = isActive && isPlaying;

        if (shouldPlay) {
            // Re-set src if it was removed
            if (!video.src && !hlsRef.current) {
                const { hlsUrl, mp4Url } = slide.data;
                if (!video.canPlayType('application/vnd.apple.mpegurl') || !hlsUrl) {
                    if (mp4Url) video.src = mp4Url;
                } else {
                    video.src = hlsUrl;
                }
            }

            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Autoplay prevented", error);
                });
            }
        } else {
            video.pause();
        }
    }, [isActive, isPlaying, slide.data]);

    // 4. Obsługa Mute
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    return (
        <div className="absolute inset-0 z-0 bg-black">
             {playMode !== 'hidden' ? (
                 <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    muted={isMuted}
                    poster={slide.data.poster}
                    preload="auto"
                />
             ) : (
                 <div className="relative w-full h-full">
                     <Image
                        src={slide.data.poster}
                        alt={slide.data.title || 'Video poster'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={false}
                     />
                 </div>
             )}
        </div>
    );
};

export default LocalVideoPlayer;
