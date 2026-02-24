"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { useStore } from '@/store/useStore';
import LoginForm from './LoginForm';
import { useToast } from '@/context/ToastContext';
import MenuIcon from './icons/MenuIcon';
import BellIcon from './icons/BellIcon';
import PwaDesktopModal from './PwaDesktopModal';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [isDesktop, setIsDesktop] = useState(false);
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

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

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
    } else if (permission === 'granted') {
        setActiveModal('notifications');
    } else {
        setActiveModal('notifications');
    }
  };

  const handleShowPwaModal = () => {
    setShowPwaModal(true);
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
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-1 -ml-1 text-white hover:text-white transition-colors active:bg-white/10 rounded-md outline-none"
                onClick={handleLoggedOutMenuClick}
                aria-label={t('menuAriaLabel')}
              >
                <MenuIcon className="w-6 h-6" />
              </motion.button>
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
              <motion.button
                 whileTap={{ scale: 0.9 }}
                 className="p-1 -mr-1 text-white hover:text-white transition-colors active:bg-white/10 rounded-md outline-none"
                 onClick={handleBellClick}
                 aria-label={t('notificationAriaLabel')}
              >
                <BellIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-start w-8">
              <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={t('menuAriaLabel')} className="-ml-1">
                        <MenuIcon className="w-6 h-6" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    className="w-auto min-w-[220px] p-2 bg-slate-800/95 backdrop-blur-md border border-slate-700 shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-2xl z-[100] data-[state=closed]:slide-out-to-top-5 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                  >
                      <div className="flex flex-col gap-1.5">
                          {user.role === 'admin' && (
                              <button
                                  onClick={handleOpenAdmin}
                                  className="flex flex-row items-center gap-3 p-3 bg-primary/15 hover:bg-primary/25 rounded-xl transition-all w-full border border-primary/30 group"
                              >
                                  <Settings size={18} className="text-primary group-hover:rotate-45 transition-transform" />
                                  <span className="text-sm font-semibold whitespace-nowrap text-slate-100 neon-text-primary">Zarządzaj</span>
                              </button>
                          )}
                          <button
                            onClick={handleOpenAccount}
                            className="flex flex-row items-center gap-3 p-3 hover:bg-slate-700/60 rounded-xl transition-all w-full group"
                          >
                              <User size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                              <span className="text-sm font-medium whitespace-nowrap text-slate-200">{t('account')}</span>
                          </button>

                          <div className="mt-1 pt-1 border-t border-slate-700/50 flex flex-col gap-1">
                              <button
                                onClick={() => setIsAppsExpanded(!isAppsExpanded)}
                                className="px-3 py-2 flex items-center justify-between text-slate-400 hover:text-slate-200 transition-colors rounded-lg"
                              >
                                  <div className="flex items-center gap-2">
                                      <LayoutGrid size={12} />
                                      <span className="text-[10px] font-bold tracking-wider uppercase">{t('apps') || 'Apki'}</span>
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
                                          <button
                                            onClick={() => { setActiveModal('financial'); setIsMenuOpen(false); }}
                                            className="flex flex-row items-center gap-3 p-3 hover:bg-slate-700/60 rounded-xl transition-all w-full group"
                                          >
                                              <Wallet size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                              <span className="text-sm font-medium whitespace-nowrap text-slate-200">{t('financialJournal') || 'Dziennik Finansowy'}</span>
                                          </button>
                                          <button
                                            onClick={() => { setActiveModal('habits'); setIsMenuOpen(false); }}
                                            className="flex flex-row items-center gap-3 p-3 hover:bg-slate-700/60 rounded-xl transition-all w-full group"
                                          >
                                              <CheckCircle size={18} className="text-orange-400 group-hover:scale-110 transition-transform" />
                                              <span className="text-sm font-medium whitespace-nowrap text-slate-200">{t('habits') || 'Nawyki'}</span>
                                          </button>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-700/50">
                            <button
                              onClick={handleLogout}
                              className="flex flex-row items-center gap-3 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all w-full group"
                            >
                                <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                <span className="text-sm font-medium whitespace-nowrap">{t('logout')}</span>
                            </button>
                          </div>

                      </div>
                  </PopoverContent>
              </Popover>

            </div>
            <div className="flex justify-center flex-1 min-w-0">
              <span className="font-bold text-[13px] text-white truncate px-1">{loggedInTitle}</span>
            </div>
            <div className="flex justify-end w-8">
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={handleBellClick} aria-label={t('notificationAriaLabel')} className="-mr-1 relative">
                  <BellIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-2 block h-2 w-2 rounded-full bg-primary ring-2 ring-black shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
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
            className="absolute left-0 w-full z-[50] bg-black/80 backdrop-blur-md pt-0 border-b border-white/5"
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
