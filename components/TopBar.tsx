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

  // Hook for push subscription
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
    refetchInterval: 30000, // Poll every 30s
  });

  if (pathname?.startsWith('/setup')) {
    return null;
  }

  const unreadCount = notificationData?.unreadCount || 0;

  const handleLoggedOutMenuClick = () => {
    addToast(t('loginRequired') || 'Musisz się zalogować', 'locked');
  };

  const handleBellClick = async () => {
    // If not logged in, ALWAYS show the login toast, regardless of permissions.
    if (!user) {
        addToast(t('loginRequired') || 'Musisz się zalogować', 'locked');
        return;
    }

    // Only if logged in, proceed with subscription/notifications logic
    if (permission === 'default') {
      const granted = await subscribe();
      if (granted) {
          addToast(t('notificationsEnabled') || 'Powiadomienia włączone', 'success');
      }
    } else if (permission === 'granted') {
        setActiveModal('notifications');
    } else {
        // Denied
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

  // Custom titles
  const loggedOutTitle = lang === 'pl' ? "Nie masz psychy się zalogować" : "Too scared to log in?";
  const loggedInTitle = "Ting Tong";

  return (
    <>
      <div
        className="absolute top-0 left-0 w-full z-[60] flex items-center justify-between text-foreground"
        style={{
          height: 'var(--topbar-height)',
          paddingTop: 'var(--safe-area-top)',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {!user ? (
          // --- WIDOK DLA UŻYTKOWNIKÓW NIEZALOGOWANYCH ---
          <>
            <div className="flex justify-start">
              <motion.button
                whileTap={{ scale: 0.85 }}
                className="p-2 ml-1 text-foreground/80 hover:text-foreground rounded-full hover:bg-foreground/5 outline-none"
                onClick={handleLoggedOutMenuClick}
                aria-label={t('menuAriaLabel')}
              >
                <MenuIcon className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex justify-center flex-1 text-center">
              <button
                onClick={handleToggleLoginPanel}
                className="relative flex items-center justify-center gap-1 font-display font-semibold text-sm text-foreground/90 hover:text-foreground focus:outline-none whitespace-nowrap outline-none"
              >
                <span className="tracking-tight">{loggedOutTitle}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ease-out text-foreground/50 ${isLoginPanelOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
            <div className="flex justify-end items-center gap-1">
              {isDesktop && (
                <Button variant="ghost" size="icon" onClick={handleShowPwaModal} aria-label={t('installPwaAriaLabel')}>
                  <span className="text-sm font-semibold">{t('installAppText')}</span>
                </Button>
              )}
              <motion.button
                 whileTap={{ scale: 0.85 }}
                 className="p-2 mr-1 text-foreground/80 hover:text-foreground rounded-full hover:bg-foreground/5 outline-none"
                 onClick={handleBellClick}
                 aria-label={t('notificationAriaLabel')}
              >
                <BellIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </>
        ) : (
          // --- WIDOK DLA ZALOGOWANYCH UŻYTKOWNIKÓW ---
          <>
            <div className="flex justify-start">
              <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={t('menuAriaLabel')} className="ml-1.5">
                        <MenuIcon className="w-6 h-6" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={8}
                    className="w-auto min-w-[180px] p-2 bg-surface-elevated/95 backdrop-blur-xl border-border/50 text-foreground shadow-2xl shadow-black/50 rounded-2xl"
                  >
                      <div className="flex flex-col gap-2">
                          {/* Admin Button */}
                          {user.role === 'admin' && (
                              <button
                                  onClick={handleOpenAdmin}
                                  className="flex flex-row items-center gap-3 px-3 py-2.5 hover:bg-foreground/5 rounded-xl w-full mb-0.5 border border-primary/20 bg-primary/5"
                              >
                                  <Settings size={18} className="text-primary" />
                                  <span className="text-sm font-medium whitespace-nowrap text-primary/90">Zarządzaj</span>
                              </button>
                          )}
                          <button
                            onClick={handleOpenAccount}
                            className="flex flex-row items-center gap-3 px-3 py-2.5 hover:bg-foreground/5 rounded-xl w-full"
                          >
                              <User size={18} className="text-blue-400" />
                              <span className="text-sm font-medium whitespace-nowrap text-foreground/90">{t('account')}</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex flex-row items-center gap-3 px-3 py-2.5 hover:bg-foreground/5 rounded-xl w-full"
                          >
                              <LogOut size={18} className="text-red-400" />
                              <span className="text-sm font-medium whitespace-nowrap text-foreground/90">{t('logout')}</span>
                          </button>

                          {/* Apki Section */}
                          <div className="mt-1.5 pt-1.5 border-t border-border/30 flex flex-col gap-0.5">
                              <button
                                onClick={() => setIsAppsExpanded(!isAppsExpanded)}
                                className="px-3 py-2 flex items-center justify-between text-muted-foreground hover:text-foreground"
                              >
                                  <div className="flex items-center gap-2">
                                      <LayoutGrid size={13} />
                                      <span className="text-[10px] font-bold uppercase tracking-widest">{t('apps') || 'Apki'}</span>
                                  </div>
                                  <ChevronDown size={13} className={cn("transition-transform duration-300", isAppsExpanded && "rotate-180")} />
                              </button>

                              <AnimatePresence>
                                  {isAppsExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden flex flex-col gap-0.5"
                                      >
                                          <button
                                            onClick={() => { setActiveModal('financial'); setIsMenuOpen(false); }}
                                            className="flex flex-row items-center gap-3 px-3 py-2.5 hover:bg-foreground/5 rounded-xl w-full"
                                          >
                                              <Wallet size={18} className="text-emerald-400" />
                                              <span className="text-sm font-medium whitespace-nowrap text-foreground/90">{t('financialJournal') || 'Dziennik Finansowy'}</span>
                                          </button>
                                          <button
                                            onClick={() => { setActiveModal('habits'); setIsMenuOpen(false); }}
                                            className="flex flex-row items-center gap-3 px-3 py-2.5 hover:bg-foreground/5 rounded-xl w-full"
                                          >
                                              <CheckCircle size={18} className="text-orange-400" />
                                              <span className="text-sm font-medium whitespace-nowrap text-foreground/90">{t('habits') || 'Nawyki'}</span>
                                          </button>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>
                  </PopoverContent>
              </Popover>

            </div>
            <div className="flex justify-center flex-1">
              <span className="font-display font-bold text-base tracking-tight text-foreground">{loggedInTitle}</span>
            </div>
            <div className="flex justify-end">
              {isDesktop && (
                <Button variant="ghost" size="icon" onClick={handleShowPwaModal} aria-label={t('installPwaAriaLabel')}>
                  <span className="text-sm font-semibold">{t('installAppText')}</span>
                </Button>
              )}
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={handleBellClick} aria-label={t('notificationAriaLabel')} className="mr-1.5 relative">
                  <BellIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-2 block h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-glow-pulse" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- Login Panel --- */}
      <AnimatePresence>
        {isLoginPanelOpen && (
          <motion.div
            className="absolute left-0 w-full z-[50] backdrop-blur-xl border-b border-border/30"
            style={{
              top: 'var(--topbar-height)',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.75))',
            }}
            initial={{ y: '-100%', opacity: 0.5 }}
            animate={{ y: '0%', opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 28 } }}
            exit={{ y: '-100%', opacity: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.4 } }}
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

      {/* --- PWA Modal --- */}
      {showPwaModal && <PwaDesktopModal isOpen={showPwaModal} onClose={() => setShowPwaModal(false)} />}
    </>
  );
};

export default TopBar;
