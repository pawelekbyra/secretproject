"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button, Popover, PopoverTrigger, PopoverContent, Avatar } from "@heroui/react";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { useStore } from '@/store/useStore';
import LoginForm from './LoginForm';
import { useToast } from '@/context/ToastContext';
import MenuIcon from './icons/MenuIcon';
import BellIcon from './icons/BellIcon';
import PwaDesktopModal from './PwaDesktopModal';
import { User, LogOut, ChevronDown, Settings, LayoutGrid, Wallet, CheckCircle } from 'lucide-react';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

const TopBar = () => {
  const { user, logout } = useUser();
  const { activeModal, setActiveModal, openAdminModal } = useStore();
  const { t, lang } = useTranslation();
  const { addToast } = useToast();
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppsExpanded, setIsAppsExpanded] = useState(true);
  const pathname = usePathname();

  const { permission, subscribe } = usePushSubscription();

  useEffect(() => {
    if (activeModal === 'login') {
      setIsLoginPanelOpen(true);
    }
  }, [activeModal]);

  const handleToggleLoginPanel = () => {
    setIsLoginPanelOpen(prev => {
      const newState = !prev;
      if (!newState && activeModal === 'login') {
        setActiveModal(null);
      }
      return newState;
    });
  };

  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (pathname?.startsWith('/setup')) {
    return null;
  }

  const unreadCount = notificationData?.unreadCount || 0;

  const handleLoggedOutMenuClick = () => {
    addToast(t('loginRequired') || 'Musisz się zalogować', 'locked');
  };

  const handleBellClick = async () => {
    if (!user) {
        addToast(t('loginRequired') || 'Musisz się zalogować', 'locked');
        return;
    }

    if (permission === 'default') {
      const granted = await subscribe();
      if (granted) {
          addToast(t('notificationsEnabled') || 'Powiadomienia włączone', 'success');
      }
    } else {
        setActiveModal('notifications');
    }
  };

  const handleLogout = async () => {
      setIsMenuOpen(false);
      setTimeout(async () => {
        await logout();
        addToast(t('logoutSuccess'), 'success');
      }, 300);
  };

  const handleOpenAccount = () => {
      setActiveModal('account');
      setIsMenuOpen(false);
  };

  const handleOpenAdmin = () => {
      openAdminModal();
      setIsMenuOpen(false);
  };

  const loggedOutTitle = lang === 'pl' ? "Nie masz psychy się zalogować" : "No guts";
  const loggedInTitle = "Ting Tong";

  return (
    <>
      <div
        className="absolute top-0 left-0 w-full z-[60] flex items-center justify-between bg-black text-white border-b border-white/10 px-3"
        style={{
          height: 'var(--topbar-height)',
          paddingTop: 'var(--safe-area-top)',
        }}
      >
        {!user ? (
          <>
            <div className="flex justify-start w-8">
              <Button
                isIconOnly
                variant="light"
                className="text-white"
                onClick={handleLoggedOutMenuClick}
                aria-label={t('menuAriaLabel')}
              >
                <MenuIcon className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex justify-center flex-1 text-center min-w-0">
              <button
                onClick={handleToggleLoginPanel}
                className="flex items-center justify-center font-bold text-[13px] text-white transition-all duration-300 focus:outline-none outline-none px-1 min-w-0"
              >
                <span className="truncate">{loggedOutTitle}</span>
                <ChevronDown
                  size={10}
                  className={`ml-0.5 transition-transform duration-200 flex-shrink-0 ${isLoginPanelOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            <div className="flex justify-end items-center w-8">
              <Button
                 isIconOnly
                 variant="light"
                 className="text-white"
                 onClick={handleBellClick}
                 aria-label={t('notificationAriaLabel')}
              >
                <BellIcon className="w-6 h-6" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-start w-8">
              <Popover
                isOpen={isMenuOpen}
                onOpenChange={setIsMenuOpen}
                placement="bottom-start"
                classNames={{
                  content: "p-0 border border-zinc-200 shadow-xl bg-white",
                }}
              >
                  <PopoverTrigger>
                    <Button isIconOnly variant="light" className="text-white" aria-label={t('menuAriaLabel')}>
                        <MenuIcon className="w-6 h-6" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                      <div className="flex flex-col w-[200px] p-2 gap-1">
                          {user.role === 'admin' && (
                              <Button
                                  onClick={handleOpenAdmin}
                                  variant="flat"
                                  color="primary"
                                  className="justify-start gap-3 h-12 font-semibold uppercase italic tracking-tighter"
                                  startContent={<Settings size={18} />}
                              >
                                  Zarządzaj
                              </Button>
                          )}
                          <Button
                            onClick={handleOpenAccount}
                            variant="light"
                            className="justify-start gap-3 h-11 text-zinc-700"
                            startContent={<User size={18} className="text-blue-500" />}
                          >
                              {t('account')}
                          </Button>
                          <Button
                            onClick={handleLogout}
                            variant="light"
                            className="justify-start gap-3 h-11 text-red-500"
                            startContent={<LogOut size={18} />}
                          >
                              {t('logout')}
                          </Button>

                          <div className="mt-1 pt-1 border-t border-zinc-100 flex flex-col gap-1">
                              <button
                                onClick={() => setIsAppsExpanded(!isAppsExpanded)}
                                className="px-3 py-2 flex items-center justify-between text-zinc-400 hover:text-zinc-600 transition-colors"
                              >
                                  <div className="flex items-center gap-2">
                                      <LayoutGrid size={12} />
                                      <span className="text-[10px] font-bold tracking-tighter italic uppercase">{t('apps') || 'Apki'}</span>
                                  </div>
                                  <ChevronDown size={14} className={cn("transition-transform", isAppsExpanded && "rotate-180")} />
                              </button>

                              <AnimatePresence>
                                  {isAppsExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden flex flex-col gap-1"
                                      >
                                          <Button
                                            onClick={() => { setActiveModal('financial'); setIsMenuOpen(false); }}
                                            variant="light"
                                            className="justify-start gap-3 h-11 text-zinc-700"
                                            startContent={<Wallet size={18} className="text-emerald-500" />}
                                          >
                                              {t('financialJournal') || 'Dziennik'}
                                          </Button>
                                          <Button
                                            onClick={() => { setActiveModal('habits'); setIsMenuOpen(false); }}
                                            variant="light"
                                            className="justify-start gap-3 h-11 text-zinc-700"
                                            startContent={<CheckCircle size={18} className="text-orange-500" />}
                                          >
                                              {t('habits') || 'Nawyki'}
                                          </Button>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>
                  </PopoverContent>
              </Popover>

            </div>
            <div className="flex justify-center flex-1 min-w-0">
              <span className="font-bold text-[13px] text-white truncate px-1 uppercase italic tracking-tighter">{loggedInTitle}</span>
            </div>
            <div className="flex justify-end w-8">
              <div className="relative">
                <Button isIconOnly variant="light" className="text-white relative" onClick={handleBellClick} aria-label={t('notificationAriaLabel')}>
                  <BellIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-black" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {isLoginPanelOpen && (
          <motion.div
            className="absolute left-0 w-full z-[50] bg-white border-b border-zinc-200"
            style={{ top: 'var(--topbar-height)' }}
            initial={{ y: '-100%' }}
            animate={{ y: '0%', transition: { type: 'spring', stiffness: 200, damping: 30 } }}
            exit={{ y: '-100%', transition: { ease: 'easeInOut', duration: 0.5 } }}
          >
            <div className="relative z-[70] pt-5">
                <LoginForm onLoginSuccess={() => {
                  setIsLoginPanelOpen(false);
                  if (activeModal === 'login') setActiveModal(null);
                }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPwaModal && <PwaDesktopModal isOpen={showPwaModal} onClose={() => setShowPwaModal(false)} />}
    </>
  );
};

export default TopBar;
