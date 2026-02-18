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
          className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="premium-glass text-white rounded-[2.5rem] p-10 shadow-2xl max-w-sm w-full overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end -mt-4 -mr-4 mb-2">
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-4 leading-tight">{t('pwaModalTitle')}</h3>
            <p className="mb-8 text-white/60 text-sm leading-relaxed italic">
              {t('pwaModalBody')}
            </p>
            <div className="p-3 bg-white rounded-3xl mx-auto inline-block shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <div className="w-32 h-32 flex items-center justify-center overflow-hidden">
                <Image src="/qr-code-placeholder.png" alt="QR Code" width={128} height={128} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PwaDesktopModal;
