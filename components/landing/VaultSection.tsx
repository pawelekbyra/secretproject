"use client";
import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import LocalVideoPlayer from '@/components/LocalVideoPlayer';
import { useStore } from '@/store/useStore';
import { VideoSlideDTO } from '@/lib/dto';

// Mock for the full video
const fullVideoSlide: VideoSlideDTO = {
    id: 'full-concert',
    userId: 'system',
    username: 'Polutek',
    avatar: '',
    createdAt: new Date().toISOString(),
    initialLikes: 0,
    isLiked: false,
    initialComments: 0,
    accessLevel: 'SECRET_PATRON',
    type: 'video',
    data: {
        mp4Url: '',
        hlsUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Using sample stream again for demo
        poster: '',
        title: 'Full Concert',
        description: 'Full Concert'
    }
};

const VaultSection = ({ isPatron }: { isPatron: boolean }) => {
    const { openTippingModal } = useStore();

    if (!isPatron) {
        return (
            <section className="relative min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 border-t border-white/10">
                <div className="max-w-md w-full text-center space-y-8 p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl">
                    <div className="mx-auto w-24 h-24 rounded-full bg-black flex items-center justify-center border-2 border-amber-600/50 shadow-[0_0_30px_rgba(217,119,6,0.2)]">
                        <Lock size={40} className="text-amber-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white tracking-wider">SKARBIEC ZABLOKOWANY</h2>
                        <p className="text-gray-400">
                            To nagranie jest dostępne tylko dla Wspierających.
                        </p>
                    </div>

                    <button
                        onClick={() => openTippingModal()}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-amber-900/40 active:scale-95"
                    >
                        WPŁAĆ, ABY OTWORZYĆ
                    </button>

                    <p className="text-xs text-white/20 uppercase tracking-widest">Secure Access V1.0</p>
                </div>
            </section>
        );
    }

    return (
        <section className="relative min-h-screen w-full bg-black text-white border-t border-white/10">
            <div className="absolute inset-0">
                <LocalVideoPlayer slide={fullVideoSlide} isActive={true} shouldLoad={true} />
            </div>

            {/* Overlay UI for Patron */}
            <div className="absolute top-0 left-0 p-6 z-20">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-green-500/30 text-green-400 font-bold text-sm tracking-wide">
                    <Unlock size={14} />
                    DOSTĘP MECENASA AKTYWNY
                </div>
            </div>

             <div className="absolute bottom-0 left-0 w-full p-8 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
                <h2 className="text-2xl font-bold mb-2">Ekskluzywny Występ</h2>
                <p className="text-white/60">Dziękuję za Twoje wsparcie. Oglądasz pełną wersję.</p>
            </div>
        </section>
    );
};

export default VaultSection;
