"use client";
import React from 'react';
import LocalVideoPlayer from '@/components/LocalVideoPlayer';
import { VideoSlideDTO } from '@/lib/dto';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

const TEASER_VIDEO_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"; // Placeholder stream

const mockSlide: VideoSlideDTO = {
    id: 'hero-teaser',
    userId: 'system',
    username: 'Polutek',
    avatar: '',
    createdAt: new Date().toISOString(),
    initialLikes: 0,
    isLiked: false,
    initialComments: 0,
    accessLevel: 'PUBLIC',
    type: 'video',
    data: {
        mp4Url: '',
        hlsUrl: TEASER_VIDEO_URL,
        poster: '',
        title: 'Teaser',
        description: 'Teaser'
    }
};

const HeroSection = () => {
    const { openTippingModal } = useStore();

    return (
        <section className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
            {/* Background Video */}
            <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
                <LocalVideoPlayer slide={mockSlide} isActive={true} shouldLoad={true} />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 drop-shadow-2xl">
                        GŁOS, KTÓRY<br />BUDZI DUCHY
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-lg md:text-2xl text-white/80 max-w-2xl font-light"
                >
                    Pomóż mi dotrzeć do źródeł muzyki w Gabonie i odblokuj mój występ życia.
                </motion.p>

                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    onClick={openTippingModal}
                    className="group relative px-8 py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xl tracking-widest rounded-full shadow-[0_0_30px_rgba(217,119,6,0.4)] transition-all hover:scale-105 active:scale-95 overflow-hidden"
                >
                    <span className="relative z-10">ODBLOKUJ KONCERT - 50 PLN</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>
            </div>
        </section>
    );
};

export default HeroSection;
