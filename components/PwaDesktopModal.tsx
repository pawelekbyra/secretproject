"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import Image from "next/image";

interface PwaDesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PwaDesktopModal: React.FC<PwaDesktopModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#1C1C1E]/95 backdrop-blur-2xl text-white rounded-[2.5rem] p-10 shadow-2xl max-w-md w-full border border-white/10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end absolute right-6 top-6">
              <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter mb-4">{t('pwaModalTitle')}</h3>
            <p className="mb-8 text-white/60 leading-relaxed font-medium">
              {t('pwaModalBody')}
            </p>
            <div className="w-48 h-48 bg-white mx-auto flex items-center justify-center rounded-[2rem] shadow-2xl p-4">
              <Image src="/qr-code-placeholder.png" alt="QR Code" width={160} height={160} className="rounded-xl" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PwaDesktopModal;
