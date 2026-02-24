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
import { User, LogOut, ChevronDown, Settings, LayoutGrid, Wallet, CheckCircle, X, ChevronRight } from 'lucide-react';
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
          // --- WIDOK DLA UŻYTKOWNIKÓW NIEZALOGOWANYCH ---
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
          // --- WIDOK DLA ZALOGOWANYCH UŻYTKOWNIKÓW ---
          <>
            <div className="flex justify-start w-8">
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label={t('menuAriaLabel')} 
                className="-ml-1"
                onClick={() => setIsMenuOpen(true)}
              >
                <MenuIcon className="w-6 h-6" />
              </Button>

              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm"
                      onClick={() => setIsMenuOpen(false)}
                      aria-hidden="true"
                    />
                    
                    <motion.div
                      initial={{ x: '-100%', opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: '-100%', opacity: 0 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="fixed top-0 left-0 w-[280px] bg-slate-800/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-[80] overflow-hidden flex flex-col h-screen border-r border-slate-700/50"
                    >
                      <div className="flex justify-between items-center p-4 border-b border-slate-700/50">
                        <span className="font-bold text-slate-200 tracking-wider text-xs uppercase">Menu Aplikacji</span>
                        <button
                          onClick={() => setIsMenuOpen(false)}
                          className="text-slate-400 hover:text-white transition-colors p-1.5 bg-slate-700/30 rounded-full hover:bg-slate-600/50"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="flex flex-col p-3 gap-2 overflow-y-auto flex-1">
                        {user.role === 'admin' && (
                          <button
                            onClick={handleOpenAdmin}
                            className="flex flex-row items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition-all w-full border border-primary/30 group"
                          >
                            <div className="flex items-center gap-3">
                              <Settings size={18} className="text-primary group-hover:rotate-45 transition-transform" />
                              <span className="text-sm font-semibold whitespace-nowrap text-white/90 neon-text-primary">Zarządzaj</span>
                            </div>
                            <ChevronRight size={16} className="text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </button>
                        )}
                        
                        <button
                          onClick={handleOpenAccount}
                          className="flex flex-row items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all w-full group"
                        >
                          <div className="flex items-center gap-3">
                            <User size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium text-slate-200 whitespace-nowrap">{t('account')}</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </button>

                        <div className="mt-2 pt-2 border-t border-slate-700/30 flex flex-col gap-1">
                          <button
                            onClick={() => setIsAppsExpanded(!isAppsExpanded)}
                            className="px-3 py-2 flex items-center justify-between text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-white/5"
                          >
                            <div className="flex items-center gap-2">
                              <LayoutGrid size={14} />
                              <span className="text-xs font-bold tracking-wider uppercase">{t('apps') || 'Apki'}</span>
                            </div>
                            <ChevronDown size={14} className={cn("transition-transform", isAppsExpanded && "rotate-180")} />
                          </button>

                          <AnimatePresence>
                            {isAppsExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden flex flex-col gap-1 mt-1"
                              >
                                <button
                                  onClick={() => { setActiveModal('financial'); setIsMenuOpen(false); }}
                                  className="flex flex-row items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all w-full group ml-2"
                                >
                                  <div className="flex items-center gap-3">
                                    <Wallet size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-slate-300 whitespace-nowrap">{t('financialJournal') || 'Dziennik Finansowy'}</span>
                                  </div>
                                  <ChevronRight size={14} className="text-slate-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all mr-2" />
                                </button>
                                <button
                                  onClick={() => { setActiveModal('habits'); setIsMenuOpen(false); }}
                                  className="flex flex-row items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all w-full group ml-2"
                                >
                                  <div className="flex items-center gap-3">
                                    <CheckCircle size={18} className="text-orange-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium text-slate-300 whitespace-nowrap">{t('habits') || 'Nawyki'}</span>
                                  </div>
                                  <ChevronRight size={14} className="text-slate-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all mr-2" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="p-4 border-t border-slate-700/50 mt-auto bg-slate-900/60 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
                        <button
                          onClick={handleLogout}
                          className="flex flex-row items-center justify-center gap-3 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all w-full font-bold group"
                        >
                          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                          <span className="text-sm whitespace-nowrap">{t('logout') || 'Wyloguj'}</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

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
