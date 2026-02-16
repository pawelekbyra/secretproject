"use client";

import React, { useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar'; // Zakładam, że masz ten komponent
import Preloader from './Preloader'; // Zakładam, że masz ten komponent

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Dodajemy stan do zarządzania sidebar'em
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-full flex-col bg-background text-foreground overflow-hidden relative">
      <Preloader />
      
      {/* Content area first so TopBar overlays on top */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

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
