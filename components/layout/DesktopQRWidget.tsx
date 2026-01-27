import React from 'react';
import { QrCode, Smartphone } from 'lucide-react';

const DesktopQRWidget = () => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center gap-6 p-8 w-80 animate-fade-in">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Pobierz aplikację
        </h2>
        <p className="text-sm text-zinc-400">
          Zeskanuj kod QR, aby otworzyć na telefonie i cieszyć się pełnią wrażeń.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative p-4 bg-white rounded-lg shadow-2xl">
           {/* Placeholder QR - w produkcji można użyć biblioteki qrcode.react */}
           <img
             src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://polutek-app.vercel.app')}`} // Fallback to public URL or current
             alt="QR Code"
             className="w-36 h-36 object-contain mix-blend-multiply opacity-90"
           />
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium px-4 py-2 bg-zinc-900/50 rounded-full border border-white/5">
        <Smartphone size={14} />
        <span>Mobile-First Experience</span>
      </div>
    </div>
  );
};

export default DesktopQRWidget;
