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
import { Button } from './ui/button';

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
                  src="/samagitara.jpg"
                  alt="Polutek Logo"
                  fill
                  className="object-contain mix-blend-screen"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>

          {/* LANGUAGE PANEL - Positioned elegantly below the centered logo */}
          <AnimatePresence>
            {showLangButtons && (
              <motion.div
                className="absolute inset-x-0 bottom-[8%] flex flex-col items-center z-[100]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex flex-col gap-3 w-full max-w-[320px] px-6">
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-full text-sm font-bold active:scale-95 transition-all duration-300"
                    onClick={() => handleLangSelect('pl')}
                  >
                    Polski
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-full text-sm font-bold active:scale-95 transition-all duration-300"
                    onClick={() => handleLangSelect('en')}
                  >
                    English
                  </Button>
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
