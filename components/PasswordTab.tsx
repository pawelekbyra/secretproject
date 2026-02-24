"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { changePassword } from '@/lib/actions';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

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
      <div className="bg-white border border-black/5 rounded-[2rem] p-6 shadow-sm">
        <h3 className="text-lg font-black italic mb-6 flex items-center gap-3 text-foreground">
            <span className="w-1.5 h-6 bg-primary rounded-full shadow-lg shadow-primary/20"></span>
            {t('changePasswordTitle')}
        </h3>
        <form id="passwordForm" onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-2">{t('currentPasswordLabel')}</label>
            <Input
                type="password"
                name="currentPassword"
                placeholder={t('currentPasswordPlaceholder')}
                required
                autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-2">{t('newPasswordLabel')}</label>
            <Input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('newPasswordPlaceholder')}
                required
                autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-2">{t('confirmPasswordLabel')}</label>
            <Input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
                required
                autoComplete="new-password"
                className={cn(confirmPassword && !passwordsMatch && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 focus:shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]")}
            />
            {error && (
                <p className="text-xs text-red-400 mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
            {!error && (
                <p className="text-xs text-foreground/30 mt-1 ml-2 font-medium">
                  {t('passwordMinLength')}
                </p>
            )}
          </div>

          <div className="pt-4">
            <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full"
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
