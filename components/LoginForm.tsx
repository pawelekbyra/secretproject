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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-5 pb-6">
      <Input
        type="text"
        name="login"
        placeholder="Email"
        required
        autoComplete="username"
        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20"
      />
      <Input
        type="password"
        name="password"
        placeholder={t('passwordPlaceholder')}
        required
        autoComplete="current-password"
        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20"
      />

      <Button
        type="submit"
        variant="default"
        disabled={isLoading}
        className="mt-1 h-12 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold tracking-wider shadow-lg shadow-pink-600/20 rounded-xl"
      >
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {isLoading ? t('loggingIn') : 'ENTER'}
      </Button>

      {errorMessage && (
        <p className="text-red-400 text-sm mt-1 text-center font-medium">{errorMessage}</p>
      )}
    </form>
  );
};

export default LoginForm;
