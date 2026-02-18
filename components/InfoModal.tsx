"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { login } = useUser(); // Dodanie hooka useUser
    const { addToast } = useToast(); // Dodanie hooka useToast

    const handleShowTipJar = async () => {
        const bmcButton = document.querySelector('#bmc-wbtn') as HTMLElement;
        if (bmcButton) {
            bmcButton.click();
        }

        // Poniższa logika jest konceptualna i powinna być wywołana przez webhooka płatności.
        // Dla celów demonstracyjnych, udajemy, że płatność się powiodła.
        setTimeout(async () => {
            const mockEmail = 'patron@example.com';
            const mockPassword = 'password123';

            try {
                // Poniżej znajduje się koncepcyjne wywołanie API, które powinno stworzyć konto
                const res = await fetch('/api/create-patron', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: mockEmail, password: mockPassword }),
                });
                const data = await res.json();
                if (data.success) {
                    addToast(`Twoje konto zostało utworzone! Login: ${mockEmail}`, 'success');
                    await login({ email: mockEmail, password: mockPassword });
                    onClose(); // Close modal on success
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Błąd tworzenia konta po wpłacie:', error);
                addToast('Wystąpił błąd podczas tworzenia konta.', 'error');
                onClose(); // Close modal on error
            }
        }, 3000);
    };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content bg-[#1C1C1E]/90 backdrop-blur-2xl text-white rounded-[2.5rem] max-w-md w-full max-h-[80vh] flex flex-col border border-white/10 shadow-2xl"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 flex-shrink-0" />
            <div className="flex-shrink-0 flex items-center justify-between px-6 pb-4 border-b border-white/5">
              <h2 id="infoTitle" className="text-lg font-bold tracking-tight">
                {t('infoModalTitle') || 'Information'}
              </h2>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors"
                aria-label={t('closeInfoAriaLabel') || 'Close information'}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body flex-1 overflow-y-auto p-8 space-y-6 text-sm text-white/70 leading-relaxed custom-scrollbar">
              <p>{t('infoModalBodyP1') || 'Lorem ipsum dolor sit amet...'}</p>
              <p>{t('infoModalBodyP2') || 'Ut in nulla enim...'}</p>
              <div className="tip-cta bg-white/5 border border-white/10 rounded-3xl p-6 text-center shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Coffee className="mx-auto text-pink-500 w-12 h-12 mb-3 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]" />
                <p className="text-base font-medium text-white mb-4">
                  {t('infoModalBodyTip') || 'Enjoying the app? Leave a tip...'}
                </p>
                <button
                    onClick={handleShowTipJar}
                    className="w-full bg-gradient-to-r from-[#FE2C55] to-[#FF5E7D] text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
                >
                  {t('tipText') || 'Tip'}
                </button>
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
