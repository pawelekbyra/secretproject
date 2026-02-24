import React from 'react';
import { QrCode, Smartphone } from 'lucide-react';
import Image from 'next/image';

const DesktopQRWidget = () => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center gap-8 p-10 w-96 animate-fade-in bg-white/40 backdrop-blur-xl rounded-[3rem] border border-black/5 shadow-xl">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-3xl font-black italic text-foreground tracking-tighter uppercase">
          Ting Tong App
        </h2>
        <p className="text-sm font-bold text-slate-500 leading-relaxed px-4">
          Zeskanuj kod QR i wejdź do świata zajebistości prosto ze swojego telefonu.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary to-indigo-400 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-300"></div>
        <div className="relative p-6 bg-white rounded-[2rem] shadow-2xl border border-slate-100">
           {/* Placeholder QR */}
           <Image
             src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://polutek-app.vercel.app')}`}
             alt="QR Code"
             width={200}
             height={200}
             className="w-44 h-44 object-contain mix-blend-multiply opacity-90 transition-transform group-hover:scale-105 duration-500"
           />
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-primary font-black uppercase tracking-[0.2em] px-6 py-3 bg-white rounded-full border border-black/5 shadow-sm">
        <Smartphone size={16} />
        <span>Mobile-First Experience</span>
      </div>
    </div>
  );
};

export default DesktopQRWidget;
