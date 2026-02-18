"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { useStore } from '@/store/useStore';
import Image from 'next/image';
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
        className="absolute top-0 left-0 w-full z-[60] flex items-center justify-between bg-black text-white border-b border-white/10 px-6"
        style={{
          height: 'var(--topbar-height)',
          paddingTop: 'var(--safe-area-top)',
        }}
      >
        {!user ? (
          // --- WIDOK DLA UŻYTKOWNIKÓW NIEZALOGOWANYCH ---
          <>
            <div className="flex justify-start w-8">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-1 -ml-2 text-white hover:text-white transition-colors active:bg-white/10 rounded-md outline-none"
                onClick={handleLoggedOutMenuClick}
                aria-label={t('menuAriaLabel')}
              >
                <MenuIcon className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex justify-center flex-1 text-center min-w-0">
              <button
                onClick={handleToggleLoginPanel}
                className="relative flex items-center justify-center font-bold text-[13px] tracking-tight text-white transition-all duration-300 focus:outline-none outline-none px-1 group"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src="/samagitara.jpg"
                    alt="Logo"
                    width={20}
                    height={20}
                    className="mix-blend-screen opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="whitespace-nowrap group-hover:text-primary transition-colors">{loggedOutTitle}</span>
                </div>
                <div className="absolute left-full ml-0.5 flex items-center">
                  <ChevronDown
                    size={14}
                    className={`text-white/40 group-hover:text-primary transition-all duration-200 ${isLoginPanelOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>
            </div>
            <div className="flex justify-end items-center w-8">
              <motion.button
                 whileTap={{ scale: 0.9 }}
                 className="p-1 -mr-2 text-white hover:text-white transition-colors active:bg-white/10 rounded-md outline-none"
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
            <div className="flex justify-start w-8">
              <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={t('menuAriaLabel')} className="-ml-1">
                        <MenuIcon className="w-6 h-6" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={5}
                    className="w-auto min-w-[180px] p-2 app-glass border-white/10 text-white shadow-2xl rounded-2xl data-[state=closed]:slide-out-to-top-5 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                  >
                      <div className="flex flex-col gap-1.5">
                          {/* Admin Button */}
                          {user.role === 'admin' && (
                              <button
                                  onClick={handleOpenAdmin}
                                  className="flex flex-row items-center gap-3 p-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition-all w-full mb-1 border border-primary/30 group"
                              >
                                  <Settings size={18} className="text-primary group-hover:rotate-45 transition-transform" />
                                  <span className="text-sm font-semibold whitespace-nowrap text-white/90 neon-text-primary">Zarządzaj</span>
                              </button>
                          )}
                          <button
                            onClick={handleOpenAccount}
                            className="flex flex-row items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-all w-full group"
                          >
                              <User size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                              <span className="text-sm font-medium whitespace-nowrap">{t('account')}</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="flex flex-row items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-all w-full group"
                          >
                              <LogOut size={18} className="text-red-400 group-hover:translate-x-0.5 transition-transform" />
                              <span className="text-sm font-medium whitespace-nowrap">{t('logout')}</span>
                          </button>

                          {/* Apki Section */}
                          <div className="mt-1 pt-1 border-t border-white/5 flex flex-col gap-1">
                              <button
                                onClick={() => setIsAppsExpanded(!isAppsExpanded)}
                                className="px-3 py-2 flex items-center justify-between text-white/40 hover:text-white transition-colors"
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
                                            className="flex flex-row items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-all w-full group"
                                          >
                                              <Wallet size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                              <span className="text-sm font-medium whitespace-nowrap">{t('financialJournal') || 'Dziennik Finansowy'}</span>
                                          </button>
                                          <button
                                            onClick={() => { setActiveModal('habits'); setIsMenuOpen(false); }}
                                            className="flex flex-row items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-all w-full group"
                                          >
                                              <CheckCircle size={18} className="text-orange-400 group-hover:scale-110 transition-transform" />
                                              <span className="text-sm font-medium whitespace-nowrap">{t('habits') || 'Nawyki'}</span>
                                          </button>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>
                      </div>
                  </PopoverContent>
              </Popover>

            </div>
            <div className="flex justify-center flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Image
                  src="/samagitara.jpg"
                  alt="Logo"
                  width={20}
                  height={20}
                  className="mix-blend-screen"
                />
                <span className="font-bold text-[13px] tracking-tight text-white truncate">{loggedInTitle}</span>
              </div>
            </div>
            <div className="flex justify-end w-8">
              <div className="relative">
                <Button variant="ghost" size="icon" onClick={handleBellClick} aria-label={t('notificationAriaLabel')} className="-mr-2 relative">
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-2 block h-2 w-2 rounded-full bg-primary ring-2 ring-black shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
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
            className="absolute left-0 w-full z-[50] bg-black/80 backdrop-blur-md pt-0 border-b border-white/5"
            style={{ top: 'var(--topbar-height)' }}
            initial={{ y: '-100%' }}
            animate={{ y: '0%', transition: { type: 'spring', stiffness: 200, damping: 30 } }}
            exit={{ y: '-100%', transition: { ease: 'easeInOut', duration: 0.5 } }}
          >
            {/* Zmieniono padding na pt-5 (20px) i usunięto dodatkowy div spacerujący, aby wyrównać odległości (20px góra / 20px dół) */}
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
