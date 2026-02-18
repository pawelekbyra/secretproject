"use client";

import React from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
    showBack?: boolean;
    onBack?: () => void;
    className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    title,
    subtitle,
    onClose,
    showBack = false,
    onBack,
    className
}) => {
    return (
        <div
            className={cn(
                "flex-shrink-0 flex items-center justify-between px-6 pb-4 border-b border-white/5 bg-black/80 backdrop-blur-md z-50",
                className
            )}
            style={{
                paddingTop: 'calc(var(--safe-area-top) + 1.5rem)',
            }}
        >
            <div className="flex items-center gap-4">
                {showBack && onBack && (
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                <div>
                    <h1 className="text-2xl font-black tracking-tighter italic leading-none text-white">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[10px] font-bold tracking-widest mt-1.5 uppercase text-pink-500">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
            >
                <X size={24} />
            </button>
        </div>
    );
};
