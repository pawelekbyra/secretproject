"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
// --- React Query Client ---
const queryClient = new QueryClient();

// Dynamically import FeedSwiper to ensure it only runs on the client side.
const DynamicFeedSwiper = dynamic(() => import('@/components/FeedSwiper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  ),
});

// --- Main Page Export ---
export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <DynamicFeedSwiper />
    </QueryClientProvider>
  );
}
