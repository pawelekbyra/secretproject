"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users } from "lucide-react";
import { useStore } from '@/store/useStore';

interface CampaignStatsProps {
  fundingAmount: number;
  goalAmount: number;
  backersCount: number;
  daysRemaining: number;
}

export const CampaignStats: React.FC<CampaignStatsProps> = ({ fundingAmount, goalAmount, backersCount, daysRemaining }) => {
  const { openTippingModal } = useStore();
  const progressPercent = Math.min((fundingAmount / goalAmount) * 100, 100);

  return (
    <div className="sticky top-32 space-y-8">
      <div className="bg-white p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-stone-100">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-sans font-black uppercase tracking-widest text-primary">Status Zbiórki</p>
            <p className="text-5xl font-black tracking-tighter text-stone-900">PLN {fundingAmount.toLocaleString()}</p>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-full bg-stone-50 rounded-full overflow-hidden border border-stone-100 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-primary rounded-full relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </motion.div>
            </div>
            <div className="flex justify-between text-[10px] font-sans font-black uppercase tracking-tighter text-stone-400">
              <span>{Math.round(progressPercent)}% CELU</span>
              <span>{goalAmount.toLocaleString()} PLN</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-center">
              <p className="text-2xl font-black text-stone-900">{backersCount.toLocaleString()}</p>
              <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Wspierających</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 text-center">
              <p className="text-2xl font-black text-stone-900">{daysRemaining}</p>
              <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Dni do końca</p>
            </div>
          </div>

          <Button
            onClick={() => openTippingModal()}
            className="w-full bg-primary hover:bg-primary/90 text-white h-20 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-all mt-4"
          >
            Wesprzyj Projekt
          </Button>
        </div>
      </div>

      <div className="p-8 bg-black rounded-[2.5rem] text-white space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
            <ShieldCheck size={20} />
          </div>
          <p className="text-sm font-bold tracking-tight">Bezpieczne płatności Stripe</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
            <Users size={20} />
          </div>
          <p className="text-sm font-bold tracking-tight">System Patronek 2.0</p>
        </div>
      </div>
    </div>
  );
};
