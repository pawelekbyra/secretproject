"use client";

import React from 'react';
import { motion } from "framer-motion";
import { ArrowDown, Play, Volume2, VolumeX } from "lucide-react";
import LocalVideoPlayer from '@/components/LocalVideoPlayer';
import { useStore } from '@/store/useStore';

interface CampaignHeroProps {
  slide: any;
  title: string;
}

export const CampaignHero: React.FC<CampaignHeroProps> = ({ slide, title }) => {
  const { isMuted, setIsMuted, isPlaying, playVideo } = useStore();

  return (
    <section className="relative pt-20 h-[85vh] w-full bg-stone-900 overflow-hidden">
      <div className="absolute inset-0 z-0">
        {slide ? (
          <div className="w-full h-full relative group">
            <LocalVideoPlayer
              slide={slide}
              isActive={true}
            />
            <div className="absolute bottom-10 right-10 z-30 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all shadow-2xl"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
            </div>
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <button
                  onClick={() => playVideo()}
                  className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/40 pointer-events-auto active:scale-90 transition-transform"
                >
                  <Play size={40} fill="currentColor" className="ml-2" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10 font-sans font-bold uppercase tracking-widest">
            Ładowanie wizji...
          </div>
        )}
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-white via-transparent to-black/40 pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 z-20 p-8 md:p-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <p className="font-sans text-xs font-black uppercase tracking-[0.6em] text-white/60 mb-4 drop-shadow-lg">Kampania Crowdfundingowa</p>
          <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
            {title.split(' ')[0]}<br /><span className="text-primary italic">{title.split(' ').slice(1).join(' ')}</span>.
          </h2>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-12 text-stone-400"
          >
            <ArrowDown size={32} className="mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
