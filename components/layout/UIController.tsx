"use client";

import React from 'react';
import { useStore } from '@/store/useStore';
import { shallow } from 'zustand/shallow';
import { AuthorProfileModal } from '@/components/AuthorProfileModal';
import { PatronProfileModal } from '@/components/PatronProfileModal';
import AdminModal from '@/components/AdminModal';
import TippingModal from '@/components/TippingModal';
import CommentsModal from '@/components/CommentsModal';
import AccountPanel from '@/components/AccountPanel';
import HabitTrackerModal from '@/components/HabitTrackerModal';
import NotificationPopup from '@/components/NotificationPopup';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from '@/context/ToastContext';

export default function UIController() {
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

  return (
    <>
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
    </>
  );
}
