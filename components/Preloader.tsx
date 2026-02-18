"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import { shallow } from 'zustand/shallow';
// Importujemy komponent odtwarzacza i typy
import LocalVideoPlayer from './LocalVideoPlayer';
import { VideoSlideDTO, SlideDTO } from '@/lib/dto';
import { cn } from '@/lib/utils';

const fetchSlides = async () => {
    const res = await fetch(`/api/slides?cursor=&limit=1`);
    if (!res.ok) {
        throw new Error('Failed to fetch slides');
    }
    const data = await res.json();
    return data;
};

const Preloader: React.FC = () => {
  const { t, selectInitialLang, isLangSelected } = useTranslation();
  const {
    setIsMuted,
    togglePlay,
  } = useStore(
    (state) => ({
      setIsMuted: state.setIsMuted,
      togglePlay: state.togglePlay,
    }),
    shallow
  );

  const [showLangButtons, setShowLangButtons] = useState(false);

  // Zmieniamy użycie useQuery, aby odebrać 'data'
  const { data } = useQuery({
      queryKey: ['slides', 'preload'],
      queryFn: fetchSlides,
      staleTime: Infinity,
  });

  // Wyciągamy pierwszy slajd (jeśli istnieje)
  const firstSlide = data?.slides?.[0] as SlideDTO | undefined;

  useEffect(() => {
    const timer = setTimeout(() => setShowLangButtons(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLangSelect = (lang: 'pl' | 'en') => {
    selectInitialLang(lang);
    setIsMuted(false);

    // Ensure video starts playing
    if (!useStore.getState().isPlaying) {
      togglePlay();
    }
  };

  return (
    <AnimatePresence>
      {!isLangSelected && (
        <motion.div
          className="absolute inset-0 bg-black z-[10000] overflow-hidden flex flex-col items-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.2 } }}
        >
          {/* --- UKRYTY PREFETCHER --- */}
          {firstSlide && firstSlide.type === 'video' && (
            <div className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
                <LocalVideoPlayer
                    slide={firstSlide as VideoSlideDTO}
                    isActive={false}
                    shouldLoad={true}
                />
            </div>
          )}
          {/* ------------------------- */}

          {/* LOGO - Trully centered vertically */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-full max-w-[460px] aspect-square relative px-4"
              animate={{
                opacity: 1,
                scale: [0.98, 1],
              }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <motion.div
                className="w-full h-full relative"
                animate={{
                  scale: [1, 1.02, 1],
                  filter: ["brightness(1)", "brightness(1.15)", "brightness(1)"]
                }}
                transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
              >
                <Image
                  src="/zajebiscie5.jpg"
                  alt="Polutek Logo"
                  fill
                  className="object-contain mix-blend-screen"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>

          {/* LANGUAGE PANEL - Refined and Bottom-aligned */}
          <AnimatePresence>
            {showLangButtons && (
              <motion.div
                className="mt-auto w-full max-w-[320px] px-6 pb-[calc(env(safe-area-inset-bottom)+50px)] flex flex-col items-center z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-12 h-[1px] bg-primary/30 mb-8" />
                <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mb-8">{t('selectLang')}</h2>

                <div className="flex flex-col gap-4 w-full">
                  <motion.button
                    onClick={() => handleLangSelect('pl')}
                    className={cn(
                        "w-full bg-gradient-to-r from-zinc-900/50 to-zinc-900/30 backdrop-blur-2xl border border-white/10 text-white font-black py-4 rounded-full transition-all tracking-[0.1em]",
                        "shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]",
                        "hover:border-primary/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] active:scale-[0.96]"
                    )}
                  >
                    {t('polish')}
                  </motion.button>
                  <motion.button
                    onClick={() => handleLangSelect('en')}
                    className={cn(
                        "w-full bg-gradient-to-r from-zinc-900/50 to-zinc-900/30 backdrop-blur-2xl border border-white/10 text-white font-black py-4 rounded-full transition-all tracking-[0.1em]",
                        "shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)]",
                        "hover:border-primary/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] active:scale-[0.96]"
                    )}
                  >
                    {t('english')}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
