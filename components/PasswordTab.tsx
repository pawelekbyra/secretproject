"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { changePassword } from '@/lib/actions';
import { useToast } from '@/context/ToastContext';

const PasswordTab: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = newPassword === confirmPassword;
  const isValidLength = newPassword.length >= 6;
  const isFormValid = passwordsMatch && isValidLength && newPassword.length > 0;

  useEffect(() => {
      if (confirmPassword && !passwordsMatch) {
          setError(t('passwordsDoNotMatch') || 'Passwords do not match');
      } else if (newPassword && !isValidLength) {
          setError(t('passwordMinLength') || 'Password must be at least 6 characters');
      } else {
          setError(null);
      }
  }, [newPassword, confirmPassword, passwordsMatch, isValidLength, t]);

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) return;

    setIsSaving(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await changePassword(null, formData);

      if (result.success) {
        addToast(result.message || t('passwordChangeSuccess'), 'success');
        (event.target as HTMLFormElement).reset();
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(result.message || t('passwordChangeError'));
      }
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="tab-pane active p-4" id="password-tab">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
        <h3 className="text-lg font-black italic tracking-tighter mb-6 flex items-center gap-3 text-white">
            <span className="w-1.5 h-6 bg-primary rounded-full neon-glow-primary"></span>
            {t('changePasswordTitle')}
        </h3>
        <form id="passwordForm" onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest text-white/40 ml-1 uppercase">{t('currentPasswordLabel')}</label>
            <Input
                type="password"
                name="currentPassword"
                placeholder={t('currentPasswordPlaceholder')}
                required
                autoComplete="current-password"
                className="bg-black/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest text-white/40 ml-1 uppercase">{t('newPasswordLabel')}</label>
            <Input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('newPasswordPlaceholder')}
                required
                autoComplete="new-password"
                className="bg-black/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black tracking-widest text-white/40 ml-1 uppercase">{t('confirmPasswordLabel')}</label>
            <Input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
                required
                autoComplete="new-password"
                className={confirmPassword && !passwordsMatch ? 'border-rose-500/50 focus:border-rose-500 bg-black/40' : 'bg-black/40'}
            />
            {error && (
                <p className="text-xs text-red-400 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
            {!error && (
                <p className="text-xs text-white/50 mt-1 ml-1">
                  {t('passwordMinLength')}
                </p>
            )}
          </div>

          <div className="pt-4">
            <Button
                type="submit"
                className="w-full h-14 bg-primary text-white font-black tracking-widest uppercase rounded-2xl shadow-2xl active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving || !isFormValid}
            >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? t('changingPassword') : t('changePasswordButton')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordTab;
