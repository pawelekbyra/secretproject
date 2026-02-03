'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center text-white font-mono">
      INITIALIZING PROTOCOL...
    </div>
  ),
});

export default function Home() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden">
      <Game />
    </main>
  );
}
