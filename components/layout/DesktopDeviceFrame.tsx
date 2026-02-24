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
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#f1f5f9] bg-gradient-to-br from-[#e2e8f0] via-[#f1f5f9] to-[#ffffff]">

      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 flex items-center gap-12 xl:gap-24">

        {/* Lewa strona - Widget QR (może być po prawej w zależności od preferencji, tutaj po lewej) */}
        <div className="hidden xl:block">
             <DesktopQRWidget />
        </div>

        {/* Ramka Telefonu */}
        <div className="relative shrink-0 group">
          {/* Cień i poświata telefonu */}
          <div className="absolute inset-0 bg-black/10 rounded-[60px] blur-3xl transform translate-y-12 scale-95" />

          {/* Subtle Glow */}
          <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-[60px] pointer-events-none" />

          {/* Przyciski fizyczne (Volume Up/Down) */}
          <div className="absolute -left-[3px] top-24 w-[3px] h-12 bg-slate-300 rounded-l-md z-10" />
          <div className="absolute -left-[3px] top-40 w-[3px] h-12 bg-slate-300 rounded-l-md z-10" />

          {/* Przycisk fizyczny (Power) */}
          <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-slate-300 rounded-r-md z-10" />

          {/* Fizyczna Ramka */}
          <div
            className="
              relative
              h-[94vh] aspect-[9/19] w-auto
              min-w-[360px]
              max-w-[calc(100vw-2rem)]
              rounded-[2.8rem]
              p-[8px]
              bg-gradient-to-b from-slate-200 to-slate-400
              shadow-2xl shadow-slate-900/10
              z-20
            "
          >
            {/* Inner frame/bezel */}
            <div className="w-full h-full bg-black overflow-hidden relative rounded-[2.2rem] shadow-inner select-none border border-slate-100/50">
               {/* Screen Reflection Overlay */}
               <div className="absolute inset-0 pointer-events-none z-[65] opacity-30 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />

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
