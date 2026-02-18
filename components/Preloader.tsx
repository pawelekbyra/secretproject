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
          className="absolute inset-0 bg-black z-[10000] overflow-hidden flex flex-col items-center justify-center"
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

          <div className="flex-1 flex items-center justify-center w-full px-6">
            <motion.div
              className="w-full max-w-[280px] aspect-square flex-shrink-0 relative"
              animate={{
                opacity: showLangButtons ? 1 : 0,
                y: showLangButtons ? -20 : 0
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                className="w-full h-full relative rounded-full overflow-hidden border-2 border-primary/20 shadow-[0_0_30px_rgba(236,72,153,0.2)]"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
              >
                <Image
                  src="/logo-guitar.jpg"
                  alt="Polutek Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>

          <AnimatePresence>
            {showLangButtons && (
              <motion.div
                className="w-full max-w-sm px-8 pb-20 flex flex-col items-center z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              >
                <h2 className="text-xl font-bold text-white mb-8 tracking-tight italic">{t('selectLang')}</h2>
                <div className="flex flex-col gap-4 w-full">
                  <motion.button
                    onClick={() => handleLangSelect('pl')}
                    className={cn(
                        "w-full bg-black border-2 border-primary/40 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_15px_rgba(236,72,153,0.15)]",
                        "hover:border-primary hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95"
                    )}
                  >
                    {t('polish')}
                  </motion.button>
                  <motion.button
                    onClick={() => handleLangSelect('en')}
                    className={cn(
                        "w-full bg-black border-2 border-primary/40 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_15px_rgba(236,72,153,0.15)]",
                        "hover:border-primary hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95"
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
