"use client";

import React, { useState } from 'react';
import TopBar from './TopBar';
import Preloader from './Preloader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-full flex-col bg-background text-foreground overflow-hidden relative">
      <Preloader />
      
      {/* Content area */}
      <div className="flex-1 flex overflow-hidden relative">
        <main 
          className="flex-1 overflow-auto z-10 custom-scrollbar relative scroll-snap-y-mandatory w-full"
          data-scroll-container
        >
          {children}
        </main>
      </div>

      {/* TopBar floating on top */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <TopBar 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
      </div>
    </div>
  );
}
