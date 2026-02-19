"use client";

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Preloader from './Preloader';
import TopBar from './TopBar';
import { useStore } from '@/store/useStore';
import { shallow } from 'zustand/shallow';
import { AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { ToastContainer } from '@/context/ToastContext';

// Dynamic imports for heavy modals to improve initial load time
const AuthorProfileModal = dynamic(() => import('./AuthorProfileModal').then(mod => mod.AuthorProfileModal));
const PatronProfileModal = dynamic(() => import('./PatronProfileModal').then(mod => mod.PatronProfileModal));
const AdminModal = dynamic(() => import('./AdminModal'));
const TippingModal = dynamic(() => import('./TippingModal'));
const CommentsModal = dynamic(() => import('./CommentsModal'));
const AccountPanel = dynamic(() => import('./AccountPanel'));
const HabitTrackerModal = dynamic(() => import('./HabitTrackerModal'));
const NotificationPopup = dynamic(() => import('./NotificationPopup'));

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
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center">
                 <h2 className="text-2xl font-bold mb-4">Dziennik Finansowy</h2>
                 <p className="text-white/60 mb-8">Ta funkcja będzie dostępna wkrótce! Pracujemy nad tym, abyś mógł lepiej zarządzać swoim sianem. 💸</p>
                 <button onClick={() => setActiveModal(null)} className="px-8 py-3 bg-white text-black font-bold rounded-full">Zamknij</button>
            </div>
        )}
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
}
