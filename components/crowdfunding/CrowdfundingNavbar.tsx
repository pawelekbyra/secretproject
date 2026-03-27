"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface CrowdfundingNavbarProps {
  onLoginClick: () => void;
  title: string;
}

export const CrowdfundingNavbar: React.FC<CrowdfundingNavbarProps> = ({ onLoginClick, title }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-black text-white px-6 py-4 shadow-2xl">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-black italic uppercase tracking-tighter">
          {title}
        </h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={onLoginClick}
            className="font-sans font-bold text-xs uppercase tracking-widest text-stone-400 hover:text-white transition-colors"
          >
            Zaloguj.
          </button>
          <Button
            onClick={() => window.location.href = '/tingtong'}
            className="bg-white hover:bg-stone-200 text-black px-6 py-5 rounded-full font-sans font-bold text-xs tracking-widest uppercase shadow-lg group border-none"
          >
            Aplikacja.
            <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
