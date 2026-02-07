"use client";

import { UserProvider } from '@/context/UserContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ToastProvider } from '@/context/ToastContext';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <UserProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </UserProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
