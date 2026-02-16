import React, { memo, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageSquare, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Ably from 'ably';
import { ably } from '@/lib/ably-client';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from '@/context/LanguageContext';
import { useStore } from '@/store/useStore';
import { formatCount } from '@/lib/utils';
import { shallow } from 'zustand/shallow';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  initialLikes: number;
  initialIsLiked: boolean;
  slideId: string;
  commentsCount: number;
  authorId: string;
  authorAvatar?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  initialLikes,
  initialIsLiked,
  slideId,
  commentsCount,
  authorId,
  authorAvatar,
}) => {
  const { addToast } = useToast();
  const { t } = useTranslation();
  const { isLoggedIn, user: currentUser } = useUser();
  const {
    setActiveModal,
    toggleLike,
    likeChanges,
    commentCountChanges,
    openAuthorProfileModal,
    openTippingModal
  } = useStore(state => ({
    setActiveModal: state.setActiveModal,
    toggleLike: state.toggleLike,
    likeChanges: state.likeChanges,
    commentCountChanges: state.commentCountChanges,
    openAuthorProfileModal: state.openAuthorProfileModal,
    openTippingModal: state.openTippingModal
  }), shallow);

  const likeState = likeChanges[slideId];
  const currentCommentCount = commentCountChanges[slideId] ?? commentsCount;
  const [liveLikes, setLiveLikes] = React.useState(initialLikes);
  const currentLikes = likeState ? likeState.likes : liveLikes;
  const isLiked = likeState ? likeState.isLiked : initialIsLiked;

  // Optimistic update for author avatar if it's the current user
  const displayAvatar = (currentUser && currentUser.id === authorId) ? currentUser.avatar : authorAvatar;

  // Logic to hide the plus icon: if logged in (per user request: "bo tak jakby juz subskrajbuje")
  // or if currentUser is the author.
  const showPlusIcon = !isLoggedIn && (!currentUser || currentUser.id !== authorId);

  useEffect(() => {
    setLiveLikes(initialLikes);
    const channel = ably.channels.get(`likes:${slideId}`);

    const onLikeUpdate = (message: Ably.Message) => {
      setLiveLikes((message.data as { likeCount: number }).likeCount);
    };

    channel.subscribe('update', onLikeUpdate);

    return () => {
      channel.unsubscribe('update', onLikeUpdate);
    };
  }, [initialLikes, slideId]);

  const handleLike = () => {
    if (!isLoggedIn) {
      addToast(t('loginRequired') || 'Musisz się zalogować', 'locked');
      return;
    }
    toggleLike(slideId, initialLikes, initialIsLiked);
    addToast(isLiked ? (t('unlikedToast') || 'Unliked') : (t('likedToast') || 'Liked!'), 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('shareTitle') || 'Check out this video!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast(t('linkCopied') || 'Link copied to clipboard!', 'success');
    }
  };

  const handleOpenAuthorProfile = () => {
    // Trigger Author Profile
    if (authorId) {
      openAuthorProfileModal(authorId);
    }
  };

  // Shared styles
  const buttonClass = "flex flex-col items-center gap-1 justify-center cursor-pointer group";
  const labelClass = "text-[10px] leading-none text-center font-medium text-white/80 group-hover:text-white transition-colors";
  const iconSize = 26;
  const iconWrapClass = "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200";
  const iconGlass = { background: 'var(--glass-bg)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)' };

  return (
    <aside
      className="absolute right-2 flex flex-col items-center gap-3 z-20 pointer-events-auto"
      style={{
        top: 'calc((var(--app-height) - var(--topbar-height) - var(--bottombar-height)) / 2 + var(--topbar-height))',
        transform: 'translateY(-50%)',
      }}
    >
      {/* Avatar / Author Profile */}
      <div className="relative mb-1">
        <button
            onClick={handleOpenAuthorProfile}
            className="w-11 h-11 flex items-center justify-center rounded-full overflow-hidden ring-2 ring-primary/60 hover:ring-primary transition-all duration-200"
        >
           {displayAvatar ? (
             <Image src={displayAvatar} alt="Author" width={44} height={44} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-muted">
               <User size={24} strokeWidth={1.4} className="text-white/70" />
             </div>
           )}
        </button>
         {showPlusIcon && (
             <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-4 h-4 rounded-full flex items-center justify-center text-white pointer-events-none bg-primary shadow-lg">
                <Plus size={10} strokeWidth={4} />
              </div>
         )}
      </div>

      {/* Like */}
      <motion.button
        onClick={handleLike}
        className={buttonClass}
        data-action="toggle-like"
        data-slide-id={slideId}
        whileTap={{ scale: 0.85 }}
      >
        <div className={cn(iconWrapClass, (isLiked && isLoggedIn) && "bg-primary/20")} style={!(isLiked && isLoggedIn) ? iconGlass : { ...iconGlass, background: 'rgba(225,29,72,0.2)', borderColor: 'rgba(225,29,72,0.3)' }}>
          <Heart
            size={iconSize}
            strokeWidth={1.8}
            className={`transition-all duration-200 ${(isLiked && isLoggedIn) ? 'fill-primary stroke-primary' : 'fill-transparent stroke-white/90'}`}
          />
        </div>
        <span className={labelClass}>{formatCount(currentLikes)}</span>
      </motion.button>

      {/* Comments */}
      <motion.button
        data-testid="comments-button"
        data-action="open-comments-modal"
        onClick={() => setActiveModal('comments')}
        className={buttonClass}
        whileTap={{ scale: 0.85 }}
      >
        <div className={iconWrapClass} style={iconGlass}>
          <MessageSquare size={iconSize} strokeWidth={1.8} className="stroke-white/90" />
        </div>
        <span className={labelClass}>{formatCount(currentCommentCount)}</span>
      </motion.button>

      {/* Share */}
      <motion.button onClick={handleShare} data-action="share" className={buttonClass} whileTap={{ scale: 0.85 }}>
        <div className={iconWrapClass} style={iconGlass}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={iconSize} height={iconSize} className="stroke-white/90">
              <polyline points="15 14 20 9 15 4"></polyline>
              <path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>
          </svg>
        </div>
        <span className={labelClass}>{t('shareText') || 'Udostępnij'}</span>
      </motion.button>

      {/* Tip Jar */}
      <motion.button onClick={() => openTippingModal()} data-action="show-tip-jar" className={buttonClass} whileTap={{ scale: 0.85 }}>
        <div className={iconWrapClass} style={iconGlass}>
          <svg viewBox="0 0 24 24" className="text-white/90" style={{ width: iconSize, height: iconSize }} fill="none" stroke="currentColor" strokeWidth="1.8">
             <rect x="2" y="7" width="20" height="12" rx="2" ry="2" />
             <path d="M2 10h20" />
             <circle cx="18" cy="13" r="2" />
          </svg>
        </div>
        <span className={labelClass}>Napiwek</span>
      </motion.button>
    </aside>
  );
};

export default memo(Sidebar);
