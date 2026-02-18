"use client";

import React, { useEffect } from 'react';
import Preloader from './Preloader';
import TopBar from './TopBar';
import { useStore } from '@/store/useStore';
import { shallow } from 'zustand/shallow';
import { AuthorProfileModal } from './AuthorProfileModal';
import { PatronProfileModal } from './PatronProfileModal';
import AdminModal from './AdminModal';
import TippingModal from './TippingModal';
import CommentsModal from './CommentsModal';
import AccountPanel from './AccountPanel';
import HabitTrackerModal from './HabitTrackerModal';
import NotificationPopup from './NotificationPopup';
import { AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import PWAInstallPrompt from './PWAInstallPrompt';
import { ToastContainer } from '@/context/ToastContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const {
    activeModal,
    setActiveModal,
    activeSlide,
    isAuthorProfileModalOpen,
    activeAuthorId,
    closeAuthorProfileModal,
    isPatronProfileModalOpen,
    activePatronId,
    closePatronProfileModal,
    isAdminModalOpen,
    closeAdminModal
  } = useStore(state => ({
    activeModal: state.activeModal,
    setActiveModal: state.setActiveModal,
    activeSlide: state.activeSlide,
    isAuthorProfileModalOpen: state.isAuthorProfileModalOpen,
    activeAuthorId: state.activeAuthorId,
    closeAuthorProfileModal: state.closeAuthorProfileModal,
    isPatronProfileModalOpen: state.isPatronProfileModalOpen,
    activePatronId: state.activePatronId,
    closePatronProfileModal: state.closePatronProfileModal,
    isAdminModalOpen: state.isAdminModalOpen,
    closeAdminModal: state.closeAdminModal
  }), shallow);

  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setAppHeight);
    setAppHeight();

    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  return (
    <div
        id="app-layout"
        className="
            relative flex flex-col
            w-full h-full
            bg-black
        "
    >
      <Preloader />
      <TopBar />
      <div
        className="flex-1 overflow-auto z-10 custom-scrollbar relative scroll-snap-y-mandatory"
        data-scroll-container
      >
        {children}
      </div>
      <AnimatePresence mode="wait">
        {isAuthorProfileModalOpen && activeAuthorId && (
          <AuthorProfileModal
            authorId={activeAuthorId}
            onClose={closeAuthorProfileModal}
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {isPatronProfileModalOpen && activePatronId && (
            <PatronProfileModal
                patronId={activePatronId}
                onClose={closePatronProfileModal}
            />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
          {isAdminModalOpen && (
              <AdminModal />
          )}
      </AnimatePresence>
      <TippingModal />
      <CommentsModal
        isOpen={activeModal === 'comments'}
        onClose={() => setActiveModal(null)}
        slideId={activeSlide?.id || null}
        initialCommentsCount={activeSlide?.initialComments || 0}
      />
      <NotificationPopup
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
      />
      <AnimatePresence>
        {activeModal === 'account' && <AccountPanel key="account-panel" onClose={() => setActiveModal(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {activeModal === 'habits' && <HabitTrackerModal key="habits-modal" onClose={() => setActiveModal(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {activeModal === 'financial' && (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center">
                 <div className="w-1.5 h-12 bg-emerald-500 rounded-full mb-6 neon-glow-green mx-auto"></div>
                 <h2 className="text-3xl font-black italic tracking-tighter mb-4 text-white uppercase">Dziennik Finansowy</h2>
                 <p className="text-white/40 mb-10 text-sm leading-relaxed italic max-w-xs mx-auto">Ta funkcja będzie dostępna wkrótce! Pracujemy nad tym, abyś mógł lepiej zarządzać swoim sianem. 💸</p>
                 <Button onClick={() => setActiveModal(null)} variant="secondary" className="px-10 h-14 w-full max-w-xs">Zamknij</Button>
            </div>
        )}
      </AnimatePresence>

      {/* <PWAInstallPrompt /> */}
      <ToastContainer />
    </div>
  );
}
