"use client";

import React, { useState } from 'react';
import { Input, Button } from '@heroui/react';
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

      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = { success: false, message: 'Invalid server response' };
      }

      if (res.ok && data.success) {
        setUser(data.user);
        router.push('/');
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 pb-5">
      <Input
        type="text"
        name="login"
        placeholder="Email"
        required
        autoComplete="username"
        variant="flat"
        classNames={{
          inputWrapper: "bg-zinc-100 border-zinc-200",
          input: "text-zinc-900"
        }}
      />
      <Input
        type="password"
        name="password"
        placeholder={t('passwordPlaceholder')}
        required
        autoComplete="current-password"
        variant="flat"
        classNames={{
          inputWrapper: "bg-zinc-100 border-zinc-200",
          input: "text-zinc-900"
        }}
      />

      <Button
        type="submit"
        color="primary"
        isLoading={isLoading}
        className="mt-2 font-bold"
      >
        ENTER.
      </Button>

      {errorMessage && (
        <p className="text-red-500 text-sm mt-2 text-center">{errorMessage}</p>
      )}
    </form>
  );
};

export default LoginForm;
