"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser } = useUser();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    const formData = new FormData(event.currentTarget);
    const login = formData.get('login') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      // Parsowanie odpowiedzi
      let data;
      try {
        data = await res.json();
      } catch (e) {
        // Fallback jeśli JSON nieprawidłowy (np. redirect HTML)
        data = { success: false, message: 'Invalid server response' };
      }

      if (res.ok && data.success) {
        // 1. Update Context immediately
        setUser(data.user);

        // 2. Redirect
        router.push('/');

        // 3. Refresh in background
        router.refresh();

        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setErrorMessage(data.message || t('loginFailed') || 'Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(t('loginError') || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 pb-8 pt-2">
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Email</label>
        <Input
            type="text"
            name="login"
            placeholder="email@example.com"
            required
            autoComplete="username"
            className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/20 focus:border-[#FE2C55]/50 focus:bg-white/[0.08] transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">{t('passwordPlaceholder')}</label>
        <Input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-white/20 focus:border-[#FE2C55]/50 focus:bg-white/[0.08] transition-all"
        />
      </div>

      <Button
        type="submit"
        variant="default"
        disabled={isLoading}
        className="mt-2 h-14 font-black uppercase tracking-[0.2em] bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white rounded-2xl shadow-lg shadow-[#FE2C55]/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? t('loggingIn') : 'ENTER'}
      </Button>

      {errorMessage && (
        <p className="text-red-500 text-sm mt-2 text-center">{errorMessage}</p>
      )}
    </form>
  );
};

export default LoginForm;
