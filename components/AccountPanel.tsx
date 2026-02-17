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
        className="absolute top-0 left-0 h-full w-full max-w-md flex flex-col shadow-2xl shadow-black/60"
        style={{ background: 'hsl(var(--surface))' }}
        // Zaktualizowana animacja: taka sama jak AuthorProfileModal, ale z lewej strony (x: -100%)
        initial={{ x: '-100%' }}
        animate={{ x: '0%' }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the panel
      >
        {/* Top Bar - styled to be distinct but integrated */}
        <div
            className="relative flex-shrink-0 flex items-center justify-center backdrop-blur-md border-b border-border/20 z-10"
            style={{ height: 'var(--topbar-height)', paddingTop: 'var(--safe-area-top)', background: 'hsl(var(--surface))' }}
        >
          <h2 className="text-sm font-display font-semibold text-foreground tracking-tight">{t('account') || 'Konto'}</h2>
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 active:scale-90"
            aria-label={t('closeAccountAriaLabel')}
          >
              <X size={18} />
          </button>
        </div>

        {/* Tabs Header */}
        <div className="flex-shrink-0 flex border-b border-border/20" style={{ background: 'hsl(var(--surface))' }}>
          <button
            onClick={() => handleTabClick('profile')}
            aria-label={t('profileTab')}
            className={`flex-1 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'profile' ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-transparent hover:text-foreground/70 hover:bg-foreground/3'}`}
          >
            {t('profileTab')}
          </button>
          <button
            onClick={() => handleTabClick('password')}
            aria-label={t('passwordTab')}
            className={`flex-1 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'password' ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-transparent hover:text-foreground/70 hover:bg-foreground/3'}`}
          >
            {t('passwordTab')}
          </button>
          <button
            onClick={() => handleTabClick('delete')}
            aria-label={t('deleteTab')}
            className={`flex-1 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'delete' ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-transparent hover:text-foreground/70 hover:bg-foreground/3'}`}
          >
            {t('deleteTab')}
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
