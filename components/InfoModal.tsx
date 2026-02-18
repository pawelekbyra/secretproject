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
          className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content glass-modal text-white rounded-[2.5rem] max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex flex-col items-center pb-4">
              <div className="modal-handle" />
              <h2 id="infoTitle" className="text-xl font-black italic tracking-tighter uppercase">
                {t('infoModalTitle') || 'Information'}
              </h2>
              <button
                onClick={onClose}
                className="absolute right-5 top-6 text-white/40 hover:text-white transition-colors"
                aria-label={t('closeInfoAriaLabel') || 'Close information'}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body flex-1 overflow-y-auto p-8 pt-4 space-y-6 text-sm text-white/70 border-t border-white/5 leading-relaxed">
              <p>{t('infoModalBodyP1') || 'Lorem ipsum dolor sit amet...'}</p>
              <p>{t('infoModalBodyP2') || 'Ut in nulla enim...'}</p>
              <div className="tip-cta bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-center shadow-inner">
                <div className="w-16 h-16 bg-[#FE2C55]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coffee className="text-[#FE2C55] w-8 h-8" />
                </div>
                <p className="text-sm font-medium text-white/90 mb-4">
                  {t('infoModalBodyTip') || 'Enjoying the app? Leave a tip...'}
                </p>
                <button onClick={handleShowTipJar} className="w-full bg-[#FE2C55] text-white py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#FE2C55]/90 shadow-lg shadow-[#FE2C55]/10 active:scale-95 transition-all">
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
