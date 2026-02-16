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
    const notifications = (user as any)?.notifications;
    if (notifications) {
      const unread = notifications.some((n: any) => !n.read);
      setHasUnread(unread);
    }
  }, [user]);

  const getPageTitle = () => {
    if (pathname === '/') return 'Strona Główna';
    if (pathname === '/admin') return 'Panel Administratora';
    if (pathname === '/admin/users') return 'Użytkownicy';
    if (pathname === '/admin/slides') return 'Slajdy';
    if (pathname === '/setup') return 'Konfiguracja Profilu';
    return 'Strona Główna';
  };

  return (
    <header className="flex items-center justify-between px-3 py-2 safe-top"
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
      }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-foreground/90 hover:text-foreground hover:bg-white/10 shrink-0 rounded-full w-9 h-9 transition-colors"
        >
          <MenuIcon className="w-5 h-5" />
        </Button>
        
        <h1 className="text-sm font-semibold truncate pr-2 tracking-wide uppercase text-foreground/70">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/90 hover:text-foreground hover:bg-white/10 rounded-full w-9 h-9 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <BellIcon className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
            )}
          </Button>
          
          <NotificationPopup 
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)} 
          />
        </div>
      </div>
    </header>
  );
}
