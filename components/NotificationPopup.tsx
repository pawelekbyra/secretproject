import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ChevronDown, Loader2, Heart, MessageSquare, UserPlus, Info, Trash, Rocket } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button, Avatar, ScrollShadow } from '@heroui/react';

type NotificationType = 'like' | 'comment' | 'follow' | 'message' | 'system' | 'welcome';

interface Notification {
  id: string;
  type: NotificationType;
  preview: string;
  time: string;
  full: string;
  unread: boolean;
  expanded?: boolean;
  user: {
    displayName: string;
    avatar: string;
    role?: string;
  } | null;
}

const iconMap: Record<NotificationType, React.ReactNode> = {
  like: <Heart size={20} className="text-red-500 fill-current" />,
  comment: <MessageSquare size={20} className="text-zinc-400" />,
  follow: <UserPlus size={20} className="text-zinc-400" />,
  message: <Mail size={20} className="text-zinc-400" />,
  system: <Info size={20} className="text-blue-500" />,
  welcome: <Rocket size={20} className="text-amber-500" />,
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ notification, onMarkAsRead, onDelete }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    const newIsExpanded = !isExpanded;
    setIsExpanded(newIsExpanded);

    if (newIsExpanded && notification.unread) {
      onMarkAsRead(notification.id);
    }
  };

  const getFullText = () => {
      if (notification.full && !notification.full.includes(' ')) {
          return t(notification.full, { name: notification.user?.displayName || 'System' });
      }
      return notification.full || notification.preview;
  }

  // Determine avatar border color based on role
  const isPatron = notification.user?.role === 'patron';
  const isAuthor = notification.user?.role === 'author';

  let avatarBorderClass = 'border-white/20'; // Default
  if (isPatron) avatarBorderClass = 'border-yellow-500/50';
  else if (isAuthor) avatarBorderClass = 'border-purple-600/50';

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "rounded-2xl cursor-pointer transition-all mb-2 border border-transparent",
        isExpanded ? 'bg-zinc-50 border-zinc-100 shadow-sm' : 'hover:bg-zinc-50/50',
        notification.unread && !isExpanded && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div onClick={handleToggle} className="flex-shrink-0">
            {notification.type === 'system' || notification.type === 'welcome' ? (
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                {iconMap[notification.type] || iconMap['system']}
            </div>
            ) : (
            <Avatar
                src={notification.user?.avatar || '/default-avatar.png'}
                className="w-10 h-10"
                isBordered
                color={isPatron ? "warning" : (isAuthor ? "secondary" : "default")}
            />
            )}
        </div>

        <div className="flex-1 flex flex-col" onClick={handleToggle}>
          <p className="text-sm leading-tight text-zinc-900">
            {notification.type !== 'system' && notification.type !== 'welcome' && <span className="font-bold">{notification.user?.displayName}</span>} <span className="text-zinc-600 font-medium">{notification.preview}</span>
          </p>
          <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">{notification.time}</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {notification.unread && <div className="w-2 h-2 bg-primary rounded-full" />}

          <div onClick={handleToggle} className="text-zinc-300 hover:text-zinc-900 transition-colors">
             <ChevronDown size={14} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-zinc-100 mt-1 bg-white/50">
                <p className="text-sm text-zinc-600 whitespace-pre-line leading-relaxed font-medium">
                {getFullText()}
                </p>
                <div className="mt-3 flex justify-end">
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                        className="text-zinc-300 hover:text-red-500"
                    >
                        <Trash size={16} />
                    </Button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
};

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: isOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
        await fetch('/api/notifications/mark-as-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: id }),
        });
    },
    onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: ['notifications'] });
        const previousData = queryClient.getQueryData(['notifications']);
        queryClient.setQueryData(['notifications'], (old: any) => {
            if (!old) return old;
            return {
                ...old,
                notifications: old.notifications.map((n: any) =>
                    n.id === id ? { ...n, unread: false } : n
                ),
                unreadCount: Math.max(0, (old.unreadCount || 0) - 1)
            };
        });
        return { previousData };
    },
    onError: (err, newTodo, context) => {
        queryClient.setQueryData(['notifications'], context?.previousData);
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        await fetch(`/api/notifications/${id}`, {
            method: 'DELETE',
        });
    },
    onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: ['notifications'] });
        const previousData = queryClient.getQueryData(['notifications']);
        queryClient.setQueryData(['notifications'], (old: any) => {
            if (!old) return old;
            const notification = old.notifications.find((n: any) => n.id === id);
            const wasUnread = notification && !notification.read;
            return {
                ...old,
                notifications: old.notifications.filter((n: any) => n.id !== id),
                unreadCount: wasUnread ? Math.max(0, (old.unreadCount || 0) - 1) : old.unreadCount
            };
        });
        return { previousData };
    },
    onError: (err, id, context) => {
        queryClient.setQueryData(['notifications'], context?.previousData);
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const notifications: Notification[] = data?.success ? data.notifications.map((n: any) => {
        const previewText = n.text || t(n.previewKey) || '';
        return {
            id: n.id,
            type: (n.type as NotificationType) || 'system',
            preview: previewText,
            time: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: lang === 'pl' ? pl : undefined }),
            full: n.text || n.fullKey,
            unread: !n.read,
            user: n.fromUser ? {
                displayName: n.fromUser.displayName || 'User',
                avatar: n.fromUser.avatar || '/icons/icon-192x192.png',
                role: n.fromUser.role
            } : { displayName: 'System', avatar: '/icons/icon-192x192.png' },
        };
  }) : [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-grow flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-10 text-red-400 p-6">
          <p className="text-sm">{t('notificationsError')}</p>
        </div>
      );
    }
    if (notifications.length === 0) {
      return (
        <div className="p-10 text-center text-zinc-400 text-sm font-medium italic">
            Brak nowych powiadomień
        </div>
      );
    }
    return (
      <ScrollShadow className="flex-grow p-3 max-h-[60vh]">
        <AnimatePresence>
          {notifications.map((notif) => (
            <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkAsRead={(id) => markReadMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </AnimatePresence>
      </ScrollShadow>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-[80] flex items-start justify-center bg-black/40 backdrop-blur-[2px] pt-3 md:pt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-[380px] max-w-[calc(100vw-20px)] bg-white border border-zinc-100 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-bold text-lg tracking-tight text-zinc-900">{t('notificationsTitle')}</h3>
              <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            {renderContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPopup;
