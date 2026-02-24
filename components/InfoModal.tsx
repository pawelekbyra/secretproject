"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/button';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { login } = useUser();
    const { addToast } = useToast();

    const handleShowTipJar = async () => {
        const bmcButton = document.querySelector('#bmc-wbtn') as HTMLElement;
        if (bmcButton) {
            bmcButton.click();
        }

        // Conceptual logic for payment success
        setTimeout(async () => {
            const mockEmail = 'patron@example.com';
            const mockPassword = 'password123';

            try {
                const res = await fetch('/api/create-patron', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: mockEmail, password: mockPassword }),
                });
                const data = await res.json();
                if (data.success) {
                    addToast(`Twoje konto zostało utworzone! Login: ${mockEmail}`, 'success');
                    await login({ email: mockEmail, password: mockPassword });
                    onClose();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Błąd tworzenia konta po wpłacie:', error);
                addToast('Wystąpił błąd podczas tworzenia konta.', 'error');
                onClose();
            }
        }, 3000);
    };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content bg-white text-foreground rounded-[3rem] max-w-md w-full max-h-[80vh] flex flex-col border border-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between p-8 border-b border-black/5 bg-secondary/50">
              <h2 id="infoTitle" className="text-2xl font-black italic tracking-tighter uppercase text-foreground">
                {t('infoModalTitle') || 'Information'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-foreground/20 hover:text-foreground transition-colors"
                aria-label={t('closeInfoAriaLabel') || 'Close information'}
              >
                <X size={26} />
              </button>
            </div>
            <div className="modal-body flex-1 overflow-y-auto p-8 space-y-6 text-sm leading-relaxed text-foreground/60 font-medium">
              <p>{t('infoModalBodyP1') || 'Lorem ipsum dolor sit amet...'}</p>
              <p>{t('infoModalBodyP2') || 'Ut in nulla enim...'}</p>

              <div className="tip-cta bg-secondary/50 border border-black/5 rounded-[2rem] p-8 text-center shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Coffee className="mx-auto text-primary w-14 h-14 mb-4 drop-shadow-xl" />
                <p className="text-sm font-black italic text-foreground tracking-tight relative z-10">
                  {t('infoModalBodyTip') || 'Enjoying the app? Leave a tip...'}
                </p>
                <Button
                    onClick={handleShowTipJar}
                    className="mt-6 w-full bg-primary text-white font-black italic uppercase h-14 rounded-2xl shadow-xl shadow-primary/30 relative z-10"
                >
                  {t('tipText') || 'Napiwek'}
                </Button>
              </div>

              <p>{t('infoModalBodyP3') || 'Donec id elit non mi porta...'}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
