"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { deleteAccount } from '@/lib/actions';

interface DeleteTabProps {
  onClose?: () => void;
}

const DeleteTab: React.FC<DeleteTabProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const DELETE_CONFIRM_TEXT = t('deleteAccountConfirmText');

  const [confirmation, setConfirmation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { logout } = useUser();

  const handleDeleteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmation.trim() !== DELETE_CONFIRM_TEXT) {
      addToast(t('deleteAccountConfirmError'), 'error');
      return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.append('confirm_text', confirmation);

    try {
      const result = await deleteAccount(null, formData);

      if (result.success) {
        addToast(result.message || 'Twoje konto zostało usunięte. Zostałeś wylogowany.', 'success');
        setTimeout(() => {
          logout();
          if (onClose) onClose();
        }, 2000);
      } else {
        throw new Error(result.message || t('deleteAccountError'));
      }
    } catch (error: any) {
      addToast(error.message, 'error');
      setIsSaving(false);
    }
  };

  return (
    <div className="tab-pane active p-4" id="delete-tab">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
        <h3 className="text-lg font-black italic tracking-tighter mb-6 flex items-center gap-3 text-white">
            <span className="w-1.5 h-6 bg-rose-600 rounded-full shadow-[0_0_10px_rgba(225,29,72,0.4)]"></span>
            {t('deleteAccountTitle')}
        </h3>

        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 mb-8">
          <h4 className="text-rose-400 font-black tracking-widest uppercase text-xs mb-3 flex items-center gap-2">
              ⚠️ {t('warningTitle')}
          </h4>
          <p className="text-white/60 text-xs leading-relaxed italic">
            {t('deleteAccountWarning')}
          </p>
        </div>

        <form id="deleteForm" onSubmit={handleDeleteSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-black tracking-widest text-white/40 ml-1 uppercase leading-relaxed">
                {t('deleteAccountPrompt')} <strong className="text-white">{DELETE_CONFIRM_TEXT}</strong>
            </label>
            <Input
              type="text"
              placeholder={DELETE_CONFIRM_TEXT}
              id="deleteConfirmation"
              name="confirm_text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="bg-black/40 border-rose-500/30 focus:border-rose-500"
            />
            <p className="text-[10px] text-white/30 italic mt-1 ml-1">
              {t('deleteAccountInfo')}
            </p>
          </div>

          <div className="pt-4">
              <Button
                type="submit"
                variant="destructive"
                className="w-full h-14 text-white font-black tracking-widest uppercase rounded-2xl shadow-2xl active:scale-[0.97] transition-all"
                disabled={confirmation !== DELETE_CONFIRM_TEXT || isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? t('deleting') : t('deleteAccountButton')}
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteTab;
