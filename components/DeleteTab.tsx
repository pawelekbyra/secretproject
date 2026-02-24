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
      <div className="bg-white border border-black/5 rounded-[2rem] p-6 shadow-sm">
        <h3 className="text-lg font-black italic mb-6 flex items-center gap-3 text-foreground">
            <span className="w-1.5 h-6 bg-rose-500 rounded-full shadow-lg shadow-rose-500/20"></span>
            {t('deleteAccountTitle')}
        </h3>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-6">
          <h4 className="text-rose-600 font-black mb-2 text-base flex items-center gap-2 italic uppercase tracking-tighter">
              ⚠️ {t('warningTitle')}
          </h4>
          <p className="text-rose-900/60 text-sm leading-relaxed font-medium">
            {t('deleteAccountWarning')}
          </p>
        </div>

        <form id="deleteForm" onSubmit={handleDeleteSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-2 leading-relaxed">
                {t('deleteAccountPrompt')} <strong className="text-foreground">{DELETE_CONFIRM_TEXT}</strong>
            </label>
            <Input
              type="text"
              placeholder={DELETE_CONFIRM_TEXT}
              id="deleteConfirmation"
              name="confirm_text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="focus-visible:border-red-500/50 focus-visible:ring-red-500/20 focus-visible:shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]"
            />
            <p className="text-xs text-foreground/30 mt-1 ml-2 font-medium">
              {t('deleteAccountInfo')}
            </p>
          </div>

          <div className="pt-4">
              <Button
                type="submit"
                variant="destructive"
                size="lg"
                className="w-full"
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
