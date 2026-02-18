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
          className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content app-modal-glass text-white rounded-[2.5rem] max-w-md w-full max-h-[80vh] flex flex-col border border-white/20 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
              <h2 id="infoTitle" className="text-xl font-bold tracking-tight">
                {t('infoModalTitle') || 'Information'}
              </h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white"
                aria-label={t('closeInfoAriaLabel') || 'Close information'}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body flex-1 overflow-y-auto p-6 space-y-4 text-sm text-white/80">
              <p>{t('infoModalBodyP1') || 'Lorem ipsum dolor sit amet...'}</p>
              <p>{t('infoModalBodyP2') || 'Ut in nulla enim...'}</p>
              <div className="tip-cta bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-inner">
                <Coffee className="mx-auto text-pink-500 w-10 h-10 mb-2" />
                <p className="text-sm">
                  {t('infoModalBodyTip') || 'Enjoying the app? Leave a tip...'}
                </p>
                <button onClick={handleShowTipJar} className="mt-4 bg-pink-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-700 transition-all active:scale-[0.98] shadow-lg shadow-pink-600/20">
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
