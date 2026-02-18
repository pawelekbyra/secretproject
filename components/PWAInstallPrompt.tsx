"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import PwaDesktopModal from './PwaDesktopModal';

const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setIsDesktop(window.innerWidth > 768);
        const handleResize = () => setIsDesktop(window.innerWidth > 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    const userAgent = window.navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(userAgent) && !window.matchMedia('(display-mode: standalone)').matches) {
      setIsIOS(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (isDesktop) {
        setShowPwaModal(true);
        return;
    }

    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
      });
    } else if (isIOS) {
      setShowInstructions(true);
    }
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  if (isStandalone) {
    return null;
  }

  if (!isDesktop && !installPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isIOS && showInstructions ? (
          <motion.div
            className="absolute bottom-0 w-full bg-[#1C1C1E]/95 backdrop-blur-2xl text-white p-8 flex flex-col items-center z-50 rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.5)]"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            style={{ paddingBottom: 'calc(2rem + var(--safe-area-bottom))' }}
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 shrink-0" />
            <div className="flex w-full justify-between items-center mb-8 px-2">
              <h3 className="text-xl font-black italic tracking-tighter">Zainstaluj Polutek</h3>
              <button onClick={handleCloseInstructions} className="p-2 text-white/40 hover:text-white transition-colors">
                <X size={28} />
              </button>
            </div>
            <div className="flex flex-col items-center space-y-8 text-center text-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                    <Share size={32} className="text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]" />
                </div>
                <p className="font-medium text-white/70 leading-relaxed">1. Stuknij ikonę **udostępniania**<br/>na pasku Safari.</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                    <PlusSquare size={32} className="text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]" />
                </div>
                <p className="font-medium text-white/70 leading-relaxed">2. Wybierz **&quot;Dodaj do<br/>ekranu początkowego&quot;**.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 left-0 w-full bg-[#1C1C1E]/95 backdrop-blur-2xl text-white p-6 flex flex-row justify-between items-center text-left gap-6 z-[9999] border-t border-white/10 shadow-[0_-8px_30px_rgb(0,0,0,0.5)] rounded-t-3xl"
            style={{ height: 'auto', minHeight: 'var(--bottombar-height)', paddingBottom: 'calc(1.5rem + var(--safe-area-bottom))' }}
          >
            <div className="flex-1">
              <h3 className="font-black italic tracking-tighter text-xl mb-1 text-white">Zainstaluj Polutek!</h3>
              <p className="text-xs text-white/50 font-medium leading-tight">Uzyskaj pełne wrażenia aplikacji na swoim urządzeniu.</p>
            </div>
            <button
                onClick={handleInstallClick}
                className="w-auto flex-shrink-0 bg-gradient-to-r from-[#FE2C55] to-[#FF5E7D] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-pink-500/20 active:scale-95 transition-all uppercase tracking-wider"
            >
              Zainstaluj
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <PwaDesktopModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
      />
    </>
  );
};

export default PWAInstallPrompt;
