"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import ProfileTab from './ProfileTab';
import PasswordTab from './PasswordTab';
import DeleteTab from './DeleteTab';
import { useTranslation } from '@/context/LanguageContext';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface AccountPanelProps {
  onClose: () => void;
}

type Tab = 'profile' | 'password' | 'delete';

const AccountPanel: React.FC<AccountPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { t } = useTranslation();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user logs out while this panel is open, close it automatically.
    if (!user) {
      onClose();
    }
  }, [user, onClose]);

  const handleTabClick = (tab: Tab) => {
      setActiveTab(tab);
  }

  const handlePublishClick = () => {
      router.push('/admin/slides');
  }

  const canPublish = user?.role === 'admin' || user?.role === 'author';

  return (
    <motion.div
      className="absolute inset-0 bg-black/80 z-[9999]"
      initial={{ opacity: 0, pointerEvents: 'none' }}
      animate={{ opacity: 1, pointerEvents: 'auto' }}
      exit={{ opacity: 0, pointerEvents: 'none' }}
      onClick={onClose} // Close on overlay click
    >
      <motion.div
        className="absolute top-0 left-0 h-full w-full max-w-md bg-[#121212] flex flex-col shadow-2xl border-r border-white/10"
        // Zaktualizowana animacja: taka sama jak AuthorProfileModal, ale z lewej strony (x: -100%)
        initial={{ x: '-100%' }}
        animate={{ x: '0%' }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 35, stiffness: 250 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
      >
        {/* Top Bar - styled to be distinct but integrated */}
        <div
            className="relative flex-shrink-0 flex items-center justify-center bg-black/40 backdrop-blur-xl border-b border-white/5 z-10"
            style={{ height: 'var(--topbar-height)', paddingTop: 'var(--safe-area-top)'}}
        >
          <div className="flex flex-col items-center">
             <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">{t('account') || 'Konto'}</h2>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-all active:scale-90"
            aria-label={t('closeAccountAriaLabel')}
          >
              <X size={24} />
          </button>
        </div>

        {/* Tabs Header */}
        <div className="flex-shrink-0 flex bg-white/[0.02] border-b border-white/5">
          <button
            onClick={() => handleTabClick('profile')}
            aria-label={t('profileTab')}
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'profile' ? 'text-pink-500' : 'text-white/30 hover:text-white/60'}`}
          >
            {t('profileTab')}
            {activeTab === 'profile' && <motion.div layoutId="accountTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />}
          </button>
          <button
            onClick={() => handleTabClick('password')}
            aria-label={t('passwordTab')}
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'password' ? 'text-pink-500' : 'text-white/30 hover:text-white/60'}`}
          >
            {t('passwordTab')}
            {activeTab === 'password' && <motion.div layoutId="accountTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />}
          </button>
          <button
            onClick={() => handleTabClick('delete')}
            aria-label={t('deleteTab')}
            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'delete' ? 'text-pink-500' : 'text-white/30 hover:text-white/60'}`}
          >
            {t('deleteTab')}
            {activeTab === 'delete' && <motion.div layoutId="accountTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeTab === 'profile' && <ProfileTab onClose={onClose} />}
            {activeTab === 'password' && <PasswordTab />}
            {activeTab === 'delete' && <DeleteTab onClose={onClose} />}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AccountPanel;
