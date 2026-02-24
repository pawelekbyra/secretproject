import React, { memo, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageSquare, User, Plus, Share2, Wallet } from 'lucide-react';
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
import { Button, Avatar, Badge } from "@heroui/react";

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

  const displayAvatar = (currentUser && currentUser.id === authorId) ? currentUser.avatar : authorAvatar;
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
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('shareTitle') || 'Polutek',
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast(t('linkCopied') || 'Link skopiowany!', 'success');
    }
  };

  const handleOpenAuthorProfile = () => {
    if (authorId) openAuthorProfileModal(authorId);
  };

  const buttonClass = "flex flex-col items-center gap-1 justify-center group pointer-events-auto";
  const labelClass = "text-[11px] font-bold text-white drop-shadow-md uppercase italic tracking-tighter";

  return (
    <aside
      className="absolute right-3 flex flex-col items-center gap-5 z-20 pointer-events-none"
      style={{
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    >
      <div className="relative mb-2 pointer-events-auto">
        <Badge
          content={<Plus size={10} strokeWidth={4} />}
          color="primary"
          shape="circle"
          placement="bottom-right"
          isInvisible={!showPlusIcon}
          className="border-2 border-black"
        >
          <Avatar
            isBordered
            color="primary"
            src={displayAvatar}
            className="w-12 h-12 cursor-pointer transition-transform active:scale-90"
            onClick={handleOpenAuthorProfile}
            fallback={<User size={24} />}
          />
        </Badge>
      </div>

      <button onClick={handleLike} className={buttonClass}>
        <div className="w-11 h-11 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all active:scale-75">
          <Heart
            size={26}
            className={cn(
              "transition-all duration-300",
              (isLiked && isLoggedIn) ? "fill-blue-500 stroke-blue-500 drop-shadow-[0_0_8px_rgba(0,112,243,0.6)]" : "text-white"
            )}
          />
        </div>
        <span className={labelClass}>{formatCount(currentLikes)}</span>
      </button>

      <button onClick={() => setActiveModal('comments')} className={buttonClass}>
        <div className="w-11 h-11 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all active:scale-75">
          <MessageSquare size={26} className="text-white" />
        </div>
        <span className={labelClass}>{formatCount(currentCommentCount)}</span>
      </button>

      <button onClick={handleShare} className={buttonClass}>
        <div className="w-11 h-11 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all active:scale-75">
          <Share2 size={24} className="text-white" />
        </div>
        <span className={labelClass}>{t('shareText') || 'Share'}</span>
      </button>

      <button onClick={() => openTippingModal()} className={buttonClass}>
        <div className="w-11 h-11 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all active:scale-75">
          <Wallet size={24} className="text-white" />
        </div>
        <span className={labelClass}>Tip</span>
      </button>
    </aside>
  );
};

export default memo(Sidebar);
