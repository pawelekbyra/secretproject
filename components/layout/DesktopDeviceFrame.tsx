"use client";

import React, { useEffect, useRef } from 'react';
import DesktopQRWidget from './DesktopQRWidget';

interface DesktopDeviceFrameProps {
  children: React.ReactNode;
}

const DesktopDeviceFrame: React.FC<DesktopDeviceFrameProps> = ({ children }) => {

  // Obsługa klawiatury dla symulacji swipe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Znajdź kontener scrollowalny wewnątrz ramki
      // AppLayout ma div z klasą "flex-1 overflow-auto" - dodamy mu atrybut data-scroll-container
      const container = document.querySelector('[data-scroll-container]');
      if (!container) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        // Przewijanie o wysokość ekranu (symulacja swipe w dół/następny slide)
        container.scrollBy({ top: container.clientHeight, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // Przewijanie w górę
        container.scrollBy({ top: -container.clientHeight, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-zinc-950">

      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="relative z-10 flex items-center gap-12 xl:gap-24">

        {/* Lewa strona - Widget QR (może być po prawej w zależności od preferencji, tutaj po lewej) */}
        <div className="hidden xl:block">
             <DesktopQRWidget />
        </div>

        {/* Ramka Telefonu */}
        <div className="relative shrink-0">
          {/* Cień i poświata telefonu */}
          <div className="absolute inset-0 bg-black/40 rounded-[50px] blur-2xl transform translate-y-8 scale-90" />

          {/* Fizyczna Ramka */}
          <div
            className="
              relative bg-[#121212]
              w-[400px] h-[85vh] max-h-[900px]
              rounded-[50px]
              border-[8px] border-[#2a2a2a]
              shadow-[0_0_0_2px_#3a3a3a,0_20px_60px_-10px_rgba(0,0,0,0.8)]
              overflow-hidden
              z-20
            "
          >
            {/* Notch / Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[20px] z-[9999] pointer-events-none flex items-center justify-center">
                 <div className="w-[60px] h-[60px] bg-black/50 absolute -top-4 blur-xl rounded-full" />
            </div>

            {/* Ekran */}
            <div className="w-full h-full bg-black overflow-hidden relative rounded-[42px] select-none">
               {children}
            </div>

            {/* Odbicie światła na szkle (Glass reflection) */}
            <div className="absolute inset-0 rounded-[42px] pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-50 z-50" />
          </div>
        </div>

        {/* Prawa strona - Pusty slot lub drugi widget, jeśli potrzeba. Obecnie tylko centrujemy ramkę. */}
        {/* Na mniejszych ekranach desktop (lg), QR widget może być ukryty lub przenieść się tutaj. */}
         <div className="hidden lg:block xl:hidden">
             <DesktopQRWidget />
        </div>

      </div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DesktopDeviceFrame;
