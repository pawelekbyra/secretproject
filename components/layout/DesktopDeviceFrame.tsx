import React from 'react';
import { usePathname } from 'next/navigation';
import DesktopQRWidget from './DesktopQRWidget';

interface DesktopDeviceFrameProps {
  children: React.ReactNode;
}

export default function DesktopDeviceFrame({ children }: DesktopDeviceFrameProps) {
  const pathname = usePathname();
  const isPublicRoute = ['/login', '/register', '/forgot-password'].includes(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[1400px] flex gap-8 z-10 items-stretch h-[85vh] max-h-[900px]">
        {/* Left side - QR Code & Info */}
        <div className="hidden lg:flex flex-col flex-1 justify-center max-w-[500px] text-white space-y-8 pr-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
              Secret Project
            </h1>
            <p className="text-lg text-neutral-400 leading-relaxed">
              Zarządzaj swoimi treściami, komunikuj się z patronami i rozwijaj swoją społeczność - wszystko w jednym miejscu.
            </p>
          </div>
          <DesktopQRWidget />
        </div>

        {/* Right side - The App Frame */}
        <div className="flex-1 flex justify-center lg:justify-start w-full">
          {/* ZWIĘKSZONO max-w do 480px i USUNIĘTO sztuczny notch, który zasłaniał TopBar */}
          <div className="relative w-full max-w-[480px] h-full bg-background rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-neutral-800 flex flex-col mx-auto lg:mx-0 ring-1 ring-white/10">
            
            {/* USUNIĘTO: <div className="absolute top-0 left-0 right-0 h-6 bg-neutral-800 z-50..." /> - to zasłaniało tytuł */}
            
            {/* Content */}
            <div className="flex-1 w-full h-full overflow-hidden bg-background relative rounded-[32px]">
              {children}
            </div>
            
            {/* Opcjonalnie: Usunięto dolny pasek "Home Bar", jeśli przeszkadzał w nawigacji */}
            {/* <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-neutral-600/50 rounded-full z-50 pointer-events-none" /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
