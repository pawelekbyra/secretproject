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
import { AnimatePresence, motion } from 'framer-motion';
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
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 text-center"
              style={{ background: 'hsl(var(--background))' }}
            >
                 <h2 className="text-2xl font-display font-bold mb-3 text-foreground tracking-tight">Dziennik Finansowy</h2>
                 <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-xs">Ta funkcja wkrotce. Pracujemy nad tym.</p>
                 <button onClick={() => setActiveModal(null)} className="px-8 py-3 bg-foreground text-background font-bold rounded-2xl text-sm active:scale-95">Zamknij</button>
            </motion.div>
        )}
      </AnimatePresence>

      <PWAInstallPrompt />
      <ToastContainer />
    </div>
  );
}
