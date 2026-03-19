import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TRANSITION_SPRING_DEFAULT,
    TRANSITION_SPRING_MODAL,
    MODAL_VARIANTS_SCALE,
    FADE_VARIANTS,
    ITEM_VARIANTS,
    TAP_SCALE
} from '@/lib/animations';
import { X, Mail, ChevronDown, Loader2, Heart, MessageSquare, UserPlus, Info, Trash, Rocket } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
  comment: <MessageSquare size={20} className="text-white/80" />,
  follow: <UserPlus size={20} className="text-white/80" />,
  message: <Mail size={20} className="text-white/80" />,
  system: <Info size={20} className="text-blue-400" />,
  welcome: <Rocket size={20} className="text-yellow-400" />,
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
      variants={ITEM_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TRANSITION_SPRING_DEFAULT}
      className={cn(
        "rounded-2xl cursor-pointer transition-all mb-2 border border-transparent",
        isExpanded ? 'app-glass border-white/10' : 'hover:bg-white/5',
        notification.unread && !isExpanded && "bg-white/5"
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        <div onClick={handleToggle} className="flex-shrink-0">
            {notification.type === 'system' || notification.type === 'welcome' ? (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                {iconMap[notification.type] || iconMap['system']}
            </div>
            ) : (
            <Image
                src={notification.user?.avatar || '/default-avatar.png'}
                alt={t('userAvatar', { user: notification.user?.displayName || 'User' })}
                width={40}
                height={40}
                className={cn("w-10 h-10 rounded-full object-cover border-2", avatarBorderClass)}
            />
            )}
        </div>

        <div className="flex-1 flex flex-col" onClick={handleToggle}>
          <p className="text-sm leading-tight">
            {notification.type !== 'system' && notification.type !== 'welcome' && <span className="font-bold text-white">{notification.user?.displayName}</span>} <span className="text-white/80">{notification.preview}</span>
          </p>
          <span className="text-[10px] font-medium text-white/40 mt-1 uppercase tracking-wider">{notification.time}</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {notification.unread && <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_var(--primary-glow)]" />}

          <div onClick={handleToggle} className="text-white/30">
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
            <div className="p-3.5 pt-0 border-t border-white/5 mt-1">
                <p className="text-sm text-white/70 whitespace-pre-line leading-relaxed">
                {getFullText()}
                </p>
                <div className="mt-3 flex justify-end">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                        className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors rounded-lg"
                    >
                        <Trash size={14} />
                    </button>
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
        <div className="p-10 text-center text-white/30 text-sm italic">
            Brak nowych powiadomień
        </div>
      );
    }
    return (
      <motion.ul
        className="flex-grow p-3 max-h-[60vh] overflow-y-auto custom-scrollbar"
        initial="initial"
        animate="animate"
        variants={{
            animate: {
                transition: {
                    staggerChildren: 0.05
                }
            }
        }}
      >
        <AnimatePresence mode="popLayout">
          {notifications.map((notif) => (
            <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkAsRead={(id) => markReadMutation.mutate(id)}
                onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </AnimatePresence>
      </motion.ul>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-[80] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-3 md:pt-5"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={FADE_VARIANTS}
          onClick={onClose}
        >
          <motion.div
            className="w-[380px] max-w-[calc(100vw-20px)] app-modal-glass border border-white/20 rounded-[2.5rem] shadow-2xl text-white flex flex-col overflow-hidden"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={MODAL_VARIANTS_SCALE}
            transition={TRANSITION_SPRING_MODAL}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-white/5 bg-black/20">
              <h3 className="font-bold text-lg tracking-tight">{t('notificationsTitle')}</h3>
              <button onClick={onClose} className="p-2 -mr-2 text-white/40 hover:text-white transition-colors">
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
