import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// ZMIANA: Importujemy defaultowo (bez nawiasów klamrowych)
import MenuIcon from '@/components/icons/MenuIcon';
import BellIcon from '@/components/icons/BellIcon';
import { useUser } from '@/context/UserContext';
import { usePathname, useRouter } from 'next/navigation';
import NotificationPopup from './NotificationPopup';

export interface TopBarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function TopBar({ toggleSidebar, isSidebarOpen }: TopBarProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (user?.notifications) {
      const unread = user.notifications.some((n: any) => !n.read);
      setHasUnread(unread);
    }
  }, [user?.notifications]);

  const getPageTitle = () => {
    if (pathname === '/') return 'Strona Główna';
    if (pathname === '/admin') return 'Panel Administratora';
    if (pathname === '/admin/users') return 'Użytkownicy';
    if (pathname === '/admin/slides') return 'Slajdy';
    if (pathname === '/setup') return 'Konfiguracja Profilu';
    return 'Strona Główna';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-white/10 safe-top">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-foreground hover:bg-white/10 shrink-0"
        >
          <MenuIcon className="w-6 h-6" />
        </Button>
        
        <h1 className="text-lg font-semibold truncate pr-2">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-white/10"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <BellIcon className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background" />
            )}
          </Button>
          
          {showNotifications && (
            <NotificationPopup 
              onClose={() => setShowNotifications(false)} 
            />
          )}
        </div>
      </div>
    </header>
  );
}
