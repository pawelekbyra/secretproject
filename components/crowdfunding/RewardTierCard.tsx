"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface RewardTierCardProps {
  pledgeAmount: number;
  description: string;
  endMonth?: string;
  endYear?: string;
  itemLimit?: number;
  backersCount?: number;
}

export const RewardTierCard: React.FC<RewardTierCardProps> = ({
  pledgeAmount,
  description,
  endMonth,
  endYear,
  itemLimit,
  backersCount = 0
}) => {
  const { openTippingModal } = useStore();
  const quantityLeft = itemLimit !== undefined ? Math.max(itemLimit - backersCount, 0) : undefined;
  const isAvailable = quantityLeft === undefined || quantityLeft > 0;

  return (
    <div className={cn(
      "p-8 bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-stone-100 transition-all hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)]",
      !isAvailable && "opacity-60 grayscale"
    )}>
      <div className="space-y-6">
        <h4 className="text-4xl font-black tracking-tighter text-stone-900">
          PLN {pledgeAmount.toLocaleString()}
        </h4>

        <div
          className="text-stone-600 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />

        {(endMonth || endYear) && (
          <div className="pt-4 border-t border-stone-50">
            <p className="text-[10px] font-sans font-black uppercase tracking-widest text-stone-400">Przewidywana Dostawa</p>
            <p className="text-sm font-bold text-stone-900">{endMonth && `${endMonth}, `}{endYear}</p>
          </div>
        )}

        <div className="flex justify-between items-end pt-4">
          <div className="space-y-1">
            <p className="text-[10px] font-sans font-black uppercase tracking-widest text-stone-400">
              {backersCount} Wspierających
            </p>
            {quantityLeft !== undefined && (
              <p className={cn(
                "text-xs font-bold",
                quantityLeft < 5 ? "text-red-500" : "text-stone-900"
              )}>
                Zostało: {quantityLeft}
              </p>
            )}
          </div>

          <Button
            onClick={() => isAvailable && openTippingModal()}
            disabled={!isAvailable}
            className={cn(
              "h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs",
              isAvailable
                ? "bg-stone-900 hover:bg-stone-800 text-white shadow-xl shadow-stone-200"
                : "bg-stone-100 text-stone-400 cursor-not-allowed"
            )}
          >
            {isAvailable ? "Wybierz" : "Wyprzedane"}
          </Button>
        </div>
      </div>
    </div>
  );
};
