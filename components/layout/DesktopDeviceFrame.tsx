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
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">

      <div className="relative z-10 flex items-center gap-12 xl:gap-24">

        {/* Lewa strona - Widget QR (może być po prawej w zależności od preferencji, tutaj po lewej) */}
        <div className="hidden xl:block">
             <DesktopQRWidget />
        </div>

        {/* Ramka Telefonu */}
        <div className="relative shrink-0 group">
          {/* Cień i poświata telefonu */}
          <div className="absolute inset-0 bg-black/40 rounded-[50px] blur-2xl transform translate-y-8 scale-90" />

          {/* Intense Metallic Glow */}
          <div className="absolute -inset-4 bg-white/10 rounded-[3rem] blur-[60px] pointer-events-none animate-pulse-slow" />
          <div className="absolute -inset-1 bg-gradient-to-tr from-white/40 to-transparent rounded-[2.5rem] blur-[20px] pointer-events-none" />

          {/* Physical Buttons with Chrome Effect */}
          <div className="absolute -left-[3.5px] top-24 w-[4px] h-12 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-200 rounded-l-md z-10 shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
          <div className="absolute -left-[3.5px] top-40 w-[4px] h-12 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-200 rounded-l-md z-10 shadow-[0_0_12px_rgba(255,255,255,0.4)]" />

          {/* Power Button */}
          <div className="absolute -right-[3.5px] top-32 w-[4px] h-16 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-200 rounded-r-md z-10 shadow-[0_0_12px_rgba(255,255,255,0.4)]" />

          {/* Fizyczna Ramka - Polished Chrome Effect */}
          <div
            className="
              relative
              h-[94vh] aspect-[9/19] w-auto
              min-w-[360px]
              max-w-[calc(100vw-2rem)]
              rounded-[2.4rem]
              p-[6px]
              bg-gradient-to-b from-slate-200 via-slate-400 to-slate-800
              shadow-[0_0_80px_-10px_rgba(255,255,255,0.3),0_30px_60px_rgba(0,0,0,0.9)]
              border border-white/30
              z-20
            "
          >
            {/* Inner frame/bezel */}
            <div className="w-full h-full bg-black overflow-hidden relative rounded-[2rem] shadow-inner select-none border border-white/5">
               {/* Screen Reflection Overlay */}
               <div className="absolute inset-0 pointer-events-none z-[65] opacity-20 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />

               {children}
            </div>
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
