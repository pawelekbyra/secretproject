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
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-black italic tracking-tighter mb-6 flex items-center gap-3 text-white uppercase">
            <span className="w-1.5 h-6 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>
            {t('deleteAccountTitle')}
        </h3>

        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
          <h4 className="text-red-400 font-black uppercase tracking-widest mb-3 text-xs flex items-center gap-2">
              ⚠️ {t('warningTitle')}
          </h4>
          <p className="text-white/60 text-sm leading-relaxed italic">
            {t('deleteAccountWarning')}
          </p>
        </div>

        <form id="deleteForm" onSubmit={handleDeleteSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">
                {t('deleteAccountPrompt')} <strong className="text-white">{DELETE_CONFIRM_TEXT}</strong>
            </label>
            <Input
              type="text"
              placeholder={DELETE_CONFIRM_TEXT}
              id="deleteConfirmation"
              name="confirm_text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="bg-black/40 border-white/10 h-12 rounded-xl text-white focus:border-red-500/50 focus:bg-black/60 transition-all"
            />
            <p className="text-xs text-white/50 mt-1 ml-1">
              {t('deleteAccountInfo')}
            </p>
          </div>

          <div className="pt-2">
              <Button
                type="submit"
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-7 rounded-2xl shadow-xl shadow-red-900/10 active:scale-[0.98] transition-all"
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
