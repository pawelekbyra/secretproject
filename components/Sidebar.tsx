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
  const iconSize = 26;
  const buttonClass = "flex flex-col items-center gap-1.5 justify-center cursor-pointer group";
  const labelClass = "text-[10px] leading-none text-center font-black uppercase tracking-widest text-white/90 group-hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]";
  const iconWrapClass = "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 bg-gradient-to-br from-white/25 via-white/10 to-transparent backdrop-blur-xl border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:border-white/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95";

  // Determine avatar border color
  const avatarBorderColor = 'border-white/80';

  return (
    <aside
      className="absolute right-3 flex flex-col items-center gap-4 z-30 pointer-events-auto"
      style={{
        top: 'calc((var(--app-height, 100vh) - var(--topbar-height, 56px) - var(--bottombar-height, 100px)) / 2 + var(--topbar-height, 56px))',
        transform: 'translateY(-50%)',
        textShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* Avatar / Author Profile */}
      <div className="relative w-12 h-12 mb-2">
        <button
            onClick={handleOpenAuthorProfile}
            className={cn(
                "w-full h-full flex items-center justify-center text-white bg-slate-800 rounded-full overflow-hidden border-2 shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95 transition-transform",
                avatarBorderColor
            )}
        >
           {displayAvatar ? (
             <Image src={displayAvatar} alt="Author" width={48} height={48} className="w-full h-full object-cover" />
           ) : (
             <User size={32} strokeWidth={1.4} />
           )}
        </button>
         {showPlusIcon && (
             <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-white pointer-events-none bg-primary shadow-[0_0_10px_rgba(255,255,255,0.6)]"
              >
                <Plus size={14} strokeWidth={4} />
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
        <div className={iconWrapClass}>
          <Heart
            size={iconSize}
            strokeWidth={1.8}
            className={`transition-all duration-200 ${(isLiked && isLoggedIn) ? 'fill-[var(--accent-color,theme(colors.rose.500))] stroke-white drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'fill-transparent stroke-white/90'}`}
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
        <div className={iconWrapClass}>
          <MessageSquare size={iconSize} strokeWidth={1.8} className="stroke-white/90" />
        </div>
        <span className={labelClass}>{formatCount(currentCommentCount)}</span>
      </motion.button>

      {/* Share */}
      <motion.button
        onClick={handleShare}
        data-action="share"
        className={buttonClass}
        whileTap={{ scale: 0.85 }}
      >
        <div className={iconWrapClass}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round" width={iconSize} height={iconSize} className="stroke-white/90">
              <polyline points="15 14 20 9 15 4"></polyline>
              <path d="M4 20v-7a4 4 0 0 1 4-4h12"></path>
          </svg>
        </div>
        <span className={labelClass}>{t('shareText') || 'Udostępnij'}</span>
      </motion.button>

      {/* Tip Jar (Custom SVG) */}
      <motion.button
        onClick={() => openTippingModal()}
        data-action="show-tip-jar"
        className={buttonClass}
        whileTap={{ scale: 0.85 }}
      >
        <div className={iconWrapClass}>
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
