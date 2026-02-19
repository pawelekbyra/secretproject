import React from 'react';
import Preloader from './Preloader';
import TopBar from './TopBar';
import UIController from './layout/UIController';
import ViewportHandler from './layout/ViewportHandler';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
        id="app-layout"
        className="
            relative flex flex-col
            w-full h-full
            bg-black
        "
    >
      <ViewportHandler />
      <Preloader />
      <TopBar />
      <div
        className="flex-1 overflow-auto z-10 custom-scrollbar relative scroll-snap-y-mandatory"
        data-scroll-container
      >
        {children}
      </div>
      <UIController />
    </div>
  );
}
