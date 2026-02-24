"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import ProfileTab from './ProfileTab';
import PasswordTab from './PasswordTab';
import DeleteTab from './DeleteTab';
import { useTranslation } from '@/context/LanguageContext';
import { X } from 'lucide-react';
import { Button, Tabs, Tab } from "@heroui/react";
import { useRouter } from 'next/navigation';

interface AccountPanelProps {
  onClose: () => void;
}

type TabKey = 'profile' | 'password' | 'delete';

const AccountPanel: React.FC<AccountPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const { t } = useTranslation();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      onClose();
    }
  }, [user, onClose]);

  return (
    <motion.div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="absolute top-0 left-0 h-full w-full max-w-md bg-white flex flex-col shadow-2xl"
        initial={{ x: '-100%' }}
        animate={{ x: '0%' }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="app-handle" />
        <div
            className="relative flex-shrink-0 flex items-center justify-center border-b border-zinc-100 z-10"
            style={{ height: '50px' }}
        >
          <h2 className="text-base font-bold italic tracking-tighter uppercase text-zinc-900">{t('account') || 'Konto'}</h2>
          <Button
            isIconOnly
            variant="light"
            onClick={onClose}
            className="absolute right-2"
            aria-label={t('closeAccountAriaLabel')}
          >
              <X size={20} />
          </Button>
        </div>

        <div className="flex-shrink-0">
          <Tabs
            variant="underlined"
            color="primary"
            fullWidth
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as TabKey)}
            classNames={{
              tabList: "rounded-none border-b border-zinc-100 p-0 gap-0",
              tab: "h-12",
              tabContent: "font-bold uppercase italic tracking-tighter text-xs"
            }}
          >
            <Tab key="profile" title={t('profileTab')} />
            <Tab key="password" title={t('passwordTab')} />
            <Tab key="delete" title={t('deleteTab')} />
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'profile' && <ProfileTab onClose={onClose} />}
            {activeTab === 'password' && <PasswordTab />}
            {activeTab === 'delete' && <DeleteTab onClose={onClose} />}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AccountPanel;
