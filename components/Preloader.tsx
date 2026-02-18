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

          <div className="flex-1 flex items-center justify-center w-full mt-10">
            <motion.div
              className="w-full max-w-[480px] aspect-square flex-shrink-0 relative px-2"
              animate={{
                opacity: 1,
                scale: [0.95, 1],
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <motion.div
                className="w-full h-full relative"
                animate={{
                  scale: [1, 1.02, 1],
                  filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
                }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
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

          <AnimatePresence>
            {showLangButtons && (
              <motion.div
                className="w-full max-w-[400px] px-8 pb-[calc(env(safe-area-inset-bottom)+40px)] flex flex-col items-center z-10"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em] mb-6">{t('selectLang')}</h2>
                <div className="flex gap-4 w-full">
                  <motion.button
                    onClick={() => handleLangSelect('pl')}
                    className={cn(
                        "flex-1 bg-white/5 backdrop-blur-xl border border-primary/30 text-white font-bold py-5 rounded-2xl transition-all",
                        "shadow-[0_0_25px_-5px_hsl(var(--primary)/0.2)]",
                        "hover:border-primary/60 hover:bg-white/10 active:scale-[0.97]"
                    )}
                  >
                    {t('polish')}
                  </motion.button>
                  <motion.button
                    onClick={() => handleLangSelect('en')}
                    className={cn(
                        "flex-1 bg-white/5 backdrop-blur-xl border border-primary/30 text-white font-bold py-5 rounded-2xl transition-all",
                        "shadow-[0_0_25px_-5px_hsl(var(--primary)/0.2)]",
                        "hover:border-primary/60 hover:bg-white/10 active:scale-[0.97]"
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
