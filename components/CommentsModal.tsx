"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageSquare, Loader2, MoreHorizontal, Trash, Flag, Smile, ChevronDown, ImageIcon, ArrowUp } from 'lucide-react';
import Image from 'next/image';
import { ably } from '@/lib/ably-client';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useTranslation } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/context/ToastContext';
import { useStore } from '@/store/useStore';
import { CommentWithRelations } from '@/lib/dto';
import { formatDistanceToNow } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { DEFAULT_AVATAR_URL } from '@/lib/constants';
import UserBadge from './UserBadge';
import { fetchComments } from '@/lib/queries';
import { cn, formatCount } from '@/lib/utils';
import { Button, Avatar, Input, Textarea } from "@heroui/react";

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slideId: string | null;
  initialCommentsCount: number;
}

interface CommentItemProps {
  comment: CommentWithRelations;
  onLike: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onReport: (id: string) => void;
  onAvatarClick: (userId: string) => void;
  onStartReply: (comment: CommentWithRelations) => void;
  currentUserId?: string;
  lang: string;
  level?: number;
  slideId: string | null;
  lastRepliedParentId?: string | null;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onLike, onDelete, onReport, onAvatarClick, onStartReply, currentUserId, lang, level = 0, slideId, lastRepliedParentId }) => {
  const { t } = useTranslation();
  const [areRepliesVisible, setAreRepliesVisible] = useState(false);

  useEffect(() => {
    if (lastRepliedParentId === comment.id) {
        setAreRepliesVisible(true);
    }
  }, [lastRepliedParentId, comment.id]);

  const {
    data: repliesData,
    fetchNextPage: fetchReplies,
    hasNextPage: hasMoreReplies,
    isLoading: isLoadingReplies,
  } = useInfiniteQuery({
    queryKey: ['comments', slideId, 'replies', comment.id],
    queryFn: ({ pageParam }) => fetch(`/api/comments/replies?parentId=${comment.id}&cursor=${pageParam || ''}`).then(res => res.json()),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: areRepliesVisible,
  });

  const replies = repliesData?.pages.flatMap(page => page.replies || []) ?? [];

  const isLiked = comment.isLiked;
  const likeCount = comment._count?.likes ?? 0;
  const replyCount = comment._count?.replies ?? 0;

  const handleToggleReplies = () => {
    setAreRepliesVisible(prev => !prev);
  };

  const author = comment.author;
  const dateLocale = lang === 'pl' ? pl : enUS;
  const formattedTime = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: dateLocale });

  const isL0 = level === 0;
  const isL1Plus = level >= 1;

  const safeAuthor = author || {
      id: 'unknown',
      displayName: 'Unknown',
      username: 'unknown',
      avatar: DEFAULT_AVATAR_URL,
      role: 'user'
  };

  const { addToast } = useToast();

  const handleLikeClick = () => {
    if (!currentUserId) {
      addToast(t('loginRequired') || 'Musisz się zalogować', 'locked');
      return;
    }
    onLike(comment.id);
  };

  let avatarBorderClass = 'border-white';
  if (safeAuthor.role === 'patron') avatarBorderClass = 'border-yellow-500';
  else if (safeAuthor.role === 'author') avatarBorderClass = 'border-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex items-start gap-3 group px-4", isL1Plus && "pl-12")}
    >
      <div
        onClick={() => onAvatarClick(safeAuthor.id)}
        className="cursor-pointer flex-shrink-0 flex flex-col items-center gap-1"
      >
        <Avatar
          src={safeAuthor.avatar || DEFAULT_AVATAR_URL}
          size={isL0 ? "md" : "sm"}
          className={cn("border-2", avatarBorderClass)}
        />
        <UserBadge role={safeAuthor.role} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-transparent rounded-lg">
           <div className="flex items-center gap-2">
             <p className="text-xs font-bold text-zinc-500 cursor-pointer hover:underline" onClick={() => onAvatarClick(safeAuthor.id)}>
                {safeAuthor.displayName || safeAuthor.username || 'User'}
              </p>
           </div>
          <p className="text-[14px] text-zinc-900 leading-snug break-words">
            {isL1Plus && comment.parentAuthorUsername && (
                <span
                  className="text-primary font-bold mr-1 cursor-pointer"
                  onClick={() => comment.parentAuthorId && onAvatarClick(comment.parentAuthorId)}
                >
                  @{comment.parentAuthorUsername}
                </span>
            )}
            {comment.text}
          </p>
          {comment.imageUrl && (
            <div className="mt-2">
              <Image src={comment.imageUrl} alt="Comment image" width={200} height={200} className="rounded-xl object-cover border border-zinc-100" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400 mt-1">
          <span>{formattedTime}</span>
          {currentUserId && (
            <button onClick={() => onStartReply(comment)} className="hover:text-zinc-600 transition-colors uppercase italic tracking-tighter">
              {t('reply')}
            </button>
          )}
          {currentUserId && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="text-zinc-300 hover:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="min-w-[150px] bg-white rounded-xl p-1 shadow-2xl z-[60] border border-zinc-100" align="end">
                  {currentUserId === comment.authorId ? (
                    <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg cursor-pointer outline-none font-bold italic tracking-tighter uppercase" onSelect={() => { if (confirm(t('deleteConfirmation'))) onDelete(comment.id); }}>
                      <Trash size={14} />{t('delete') || 'Usuń'}
                    </DropdownMenu.Item>
                  ) : (
                    <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg cursor-pointer outline-none font-bold italic tracking-tighter uppercase" onSelect={() => onReport(comment.id)}>
                      <Flag size={14} />{t('report') || 'Zgłoś'}
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>

        {replyCount > 0 && (
          <div className="mt-2">
            <button onClick={handleToggleReplies} className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-bold uppercase italic tracking-tighter mb-2">
              <div className="w-8 h-[1px] bg-zinc-200 mr-1" />
              {areRepliesVisible ? t('hideReplies') : t('viewReplies', { count: replyCount.toString() })}
            </button>
            <AnimatePresence>
            {areRepliesVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden pt-2"
              >
                {isLoadingReplies && replies.length === 0 && (
                   <div className="flex justify-center p-2"><Loader2 className="animate-spin h-4 w-4 text-primary" /></div>
                )}
                {replies.map((reply) => (
                  <MemoizedCommentItem key={reply.id} slideId={slideId} comment={reply} onLike={onLike} onDelete={onDelete} onReport={onReport} onAvatarClick={onAvatarClick} onStartReply={onStartReply} currentUserId={currentUserId} lang={lang} level={level + 1} lastRepliedParentId={lastRepliedParentId} />
                ))}
                {hasMoreReplies && (
                   <button onClick={() => fetchReplies()} disabled={isLoadingReplies} className="text-[11px] text-primary font-bold uppercase italic tracking-tighter pl-12 flex items-center gap-2">
                      {isLoadingReplies ? <Loader2 className="animate-spin h-3 w-3" /> : t('loadMore')}
                   </button>
                )}
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 text-zinc-400 pt-1">
        <button onClick={handleLikeClick} className="group/like">
          <Heart size={20} className={cn("transition-colors", isLiked ? 'text-red-500 fill-current' : 'group-hover/like:text-zinc-600')} />
        </button>
        <span className="text-[11px] font-bold">{likeCount > 0 ? formatCount(likeCount) : ''}</span>
      </div>
    </motion.div>
  );
};

const MemoizedCommentItem = React.memo(CommentItem);

const recursivelyUpdateComment = (comments: CommentWithRelations[], commentId: string, updateFn: (comment: CommentWithRelations) => CommentWithRelations): [CommentWithRelations[], boolean] => {
  let foundAndUpdated = false;
  if (!comments) return [[], false];
  const updatedComments = comments.map(c => {
    if (c.id === commentId) {
      foundAndUpdated = true;
      return updateFn(c);
    }
    if (c.replies && c.replies.length > 0) {
      const [updatedReplies, didUpdate] = recursivelyUpdateComment(c.replies, commentId, updateFn);
      if (didUpdate) {
        foundAndUpdated = true;
        return { ...c, replies: updatedReplies };
      }
    }
    return c;
  });
  return [updatedComments, foundAndUpdated];
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, slideId, initialCommentsCount }) => {
  const { t, lang } = useTranslation();
  const { user } = useUser();
  const { setActiveModal, openPatronProfileModal, commentCountChanges } = useStore();
  const { addToast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'top'>('top');
  const [replyingTo, setReplyingTo] = useState<CommentWithRelations | null>(null);
  const [lastRepliedParentId, setLastRepliedParentId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const {
    data, error, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['comments', slideId, sortBy],
    queryFn: ({ pageParam }) => fetchComments({ pageParam, slideId: slideId!, sortBy }),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isOpen && !!slideId,
  });

  const comments = data?.pages.flatMap((page) => page.comments) ?? [];
  const totalCommentCount = (slideId && commentCountChanges[slideId]) ?? initialCommentsCount;

  useEffect(() => {
    if (!isOpen || !slideId) return;
    const channel = ably.channels.get(`comments:${slideId}`);
    const onNewComment = () => queryClient.invalidateQueries({ queryKey: ['comments', slideId] });
    channel.subscribe('new-comment', onNewComment);
    return () => channel.unsubscribe('new-comment', onNewComment);
  }, [isOpen, slideId, queryClient]);

  useEffect(() => {
    if (!isOpen) {
      setNewComment('');
      setReplyingTo(null);
      setImageFile(null);
      setShowEmojiPicker(false);
    }
  }, [isOpen]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [modalHeight, setModalHeight] = useState<string>('75vh');

  useEffect(() => {
      setModalHeight(`${window.innerHeight * 0.75}px`);
  }, []);

  const likeMutation = useMutation({
    mutationFn: (commentId: string) => fetch('/api/comments/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commentId }) }),
    onMutate: async (commentId: string) => {
      await queryClient.cancelQueries({ queryKey: ['comments', slideId, sortBy] });
      const previousData = queryClient.getQueryData(['comments', slideId, sortBy]);

      queryClient.setQueryData(['comments', slideId, sortBy], (oldData: any) => {
          if (!oldData) return oldData;
          const newPages = oldData.pages.map((page: any) => {
              const [updatedComments] = recursivelyUpdateComment(page.comments || [], commentId, (comment) => {
                  const isLiked = comment.isLiked;
                  const newLikeCount = (comment._count?.likes ?? 0) + (isLiked ? -1 : 1);
                  return { ...comment, isLiked: !isLiked, _count: { ...comment._count, likes: newLikeCount } };
              });
              return { ...page, comments: updatedComments };
          });
          return { ...oldData, pages: newPages };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['comments', slideId, sortBy], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', slideId, sortBy] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ parentId, text, imageFile }: { parentId: string | null; text: string; imageFile: File | null }) => {
      let imageUrl: string | null = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error('Image upload failed');
        }
        imageUrl = uploadData.imageUrl;
      }

      return fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId, text, parentId, imageUrl }),
      }).then(res => res.json());
    },
    onMutate: async ({ parentId, text, imageFile }) => {
      const optimisticComment: CommentWithRelations = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text,
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
        authorId: user!.id,
        slideId: slideId!,
        parentId: parentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: {
          id: user!.id,
          username: user!.username,
          displayName: user!.displayName || null,
          avatar: user!.avatar || null,
          role: user!.role || 'user',
        },
        isLiked: false,
        _count: { likes: 0, replies: 0 },
        parentAuthorId: replyingTo ? (replyingTo.author?.id || null) : null,
        parentAuthorUsername: replyingTo ? (replyingTo.author?.displayName || replyingTo.author?.username || 'Unknown') : null,
        replies: [],
      };

      if (parentId) {
        await queryClient.cancelQueries({ queryKey: ['comments', slideId, 'replies', parentId] });
        const previousReplies = queryClient.getQueryData(['comments', slideId, 'replies', parentId]);
        queryClient.setQueryData(['comments', slideId, 'replies', parentId], (old: any) => {
            const newPages = old ? [...old.pages] : [{ replies: [], nextCursor: null }];
            if (!newPages[0]) newPages[0] = { replies: [], nextCursor: null };
            const newFirstPageReplies = [optimisticComment, ...(newPages[0].replies || [])];
            newPages[0] = { ...newPages[0], replies: newFirstPageReplies };
            return { ...old, pages: newPages, pageParams: old?.pageParams || [null] };
        });
        queryClient.setQueryData(['comments', slideId, sortBy], (old: any) => {
            if (!old) return old;
            const newPages = old.pages.map((page: any) => {
                const [updatedComments] = recursivelyUpdateComment(page.comments || [], parentId, (comment) => ({
                    ...comment,
                    _count: { ...comment._count, likes: comment._count?.likes ?? 0, replies: (comment._count?.replies ?? 0) + 1 },
                }));
                return { ...page, comments: updatedComments };
            });
            return { ...old, pages: newPages };
        });
        return { previousReplies };
      } else {
        await queryClient.cancelQueries({ queryKey: ['comments', slideId, sortBy] });
        const previousComments = queryClient.getQueryData(['comments', slideId, sortBy]);
        queryClient.setQueryData(['comments', slideId, sortBy], (old: any) => {
          const newPages = old ? [...old.pages] : [];
          if (newPages.length === 0) newPages.push({ comments: [], nextCursor: null });
          const currentComments = newPages[0].comments || [];
          newPages[0] = { ...newPages[0], comments: [optimisticComment, ...currentComments] };
          return { ...old, pages: newPages, pageParams: old?.pageParams || [null] };
        });
        return { previousComments };
      }
    },
    onError: () => {
      addToast(t('commentPostError'), 'error');
      queryClient.invalidateQueries({ queryKey: ['comments', slideId], exact: false });
    },
    onSuccess: (data, variables) => {
      if (variables.parentId) {
          setLastRepliedParentId(variables.parentId);
          setTimeout(() => {
             queryClient.invalidateQueries({ queryKey: ['comments', slideId, 'replies', variables.parentId] });
          }, 1000);
      } else {
        setSortBy('newest');
        queryClient.invalidateQueries({ queryKey: ['comments', slideId, 'newest'] });
        if (sortBy !== 'newest') queryClient.invalidateQueries({ queryKey: ['comments', slideId, sortBy] });
        useStore.getState().incrementCommentCount(slideId!, initialCommentsCount);
      }
      setNewComment('');
      setReplyingTo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => fetch('/api/comments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commentId }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', slideId] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    if ((!trimmedComment && !imageFile) || !user || !slideId) return;
    replyMutation.mutate({ parentId: replyingTo?.id || null, text: trimmedComment, imageFile });
    setImageFile(null);
  };

  const handleStartReply = (comment: CommentWithRelations) => {
    if (!user) {
        setActiveModal('login');
        return;
    }
    setReplyingTo(comment);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setNewComment(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        addToast(t('imageTooLarge'), 'error');
        return;
      }
      setImageFile(file);
    }
  };

  const renderContent = () => {
    if (isLoading && comments.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    if (error) return <div className="flex-1 flex items-center justify-center text-red-500 p-4 h-full">{t('commentsError')}</div>;
    if (comments.length === 0) return <div className="flex-1 flex items-center justify-center text-zinc-400 p-4 h-full text-center">{t('noCommentsYet')}</div>;

    return (
      <div className="pt-2 custom-scrollbar flex-1">
        <div className="space-y-6 pb-20">
          {comments.map((comment) => (
            <MemoizedCommentItem
              key={comment.id}
              slideId={slideId}
              comment={comment}
              onLike={likeMutation.mutate}
              onDelete={async (id) => { await deleteMutation.mutateAsync(id); }}
              onStartReply={handleStartReply}
              onReport={(id) => addToast(t('reportSubmitted'), 'success')}
              onAvatarClick={(userId) => {
                onClose();
                openPatronProfileModal(userId);
              }}
              currentUserId={user?.id}
              lang={lang}
              lastRepliedParentId={lastRepliedParentId}
            />
          ))}
          {hasNextPage && (
            <div className="flex justify-center py-4">
              <Button
                variant="light"
                color="primary"
                onClick={() => fetchNextPage()}
                isLoading={isFetchingNextPage}
                className="font-bold uppercase italic tracking-tighter"
              >
                {t('loadMore')}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="absolute inset-0 bg-black/40 z-50 flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={onClose}>
          <motion.div
            ref={modalRef}
            className="w-full bg-white rounded-t-[2.5rem] flex flex-col overflow-hidden shadow-2xl"
            style={{ height: modalHeight }}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="app-handle" />
            <div className="flex-shrink-0 relative text-center pb-4 pt-1 border-b border-zinc-100">
              <h2 className="text-base font-bold italic tracking-tighter uppercase text-zinc-900">{t('commentsTitle', { count: totalCommentCount.toString() })}</h2>
              <Button isIconOnly variant="light" onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X size={24} />
              </Button>
            </div>

            <div className="flex-shrink-0 px-6 pt-4 pb-2 flex items-center gap-6 text-xs">
                <button onClick={() => setSortBy('top')} className={cn("font-bold uppercase italic tracking-tighter transition-colors", sortBy === 'top' ? 'text-zinc-900 underline underline-offset-4' : 'text-zinc-400')}>{t('top')}</button>
                <button onClick={() => setSortBy('newest')} className={cn("font-bold uppercase italic tracking-tighter transition-colors", sortBy === 'newest' ? 'text-zinc-900 underline underline-offset-4' : 'text-zinc-400')}>{t('newest')}</button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">{renderContent()}</div>

            <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-100 bg-white/80 backdrop-blur-xl pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-20">
              {replyingTo && (
                <div className="bg-zinc-50 px-6 py-2 text-[11px] font-bold text-zinc-500 flex justify-between items-center border-b border-zinc-100">
                  <span className="uppercase italic tracking-tighter">{t('replyingTo', { user: replyingTo.author?.displayName || replyingTo.author?.username || '' })}</span>
                  <button onClick={handleCancelReply} className="p-1 hover:bg-zinc-200 rounded-full transition-colors"><X size={12} /></button>
                </div>
              )}
              {user ? (
                <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
                  <Avatar
                    src={user.avatar || DEFAULT_AVATAR_URL}
                    className={cn("w-10 h-10 border-2", user.role === 'patron' ? 'border-yellow-500' : (user.role === 'author' ? 'border-primary' : 'border-white'))}
                  />
                  <div className="flex-1 relative flex items-end bg-zinc-100 rounded-2xl border border-transparent focus-within:border-primary/20 transition-all">
                    <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={replyingTo ? t('replyTo', { user: replyingTo.author?.displayName || replyingTo.author?.username || '' }) : t('addCommentPlaceholder')}
                      minRows={1}
                      maxRows={4}
                      variant="flat"
                      classNames={{
                        inputWrapper: "bg-transparent shadow-none",
                        input: "text-sm text-zinc-900"
                      }}
                    />
                    <div className="flex items-center gap-1 p-1 pr-2">
                       <Button isIconOnly variant="light" size="sm" onClick={() => imageInputRef.current?.click()} className="text-zinc-400"><ImageIcon size={18} /></Button>
                       <Button isIconOnly variant="light" size="sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-zinc-400"><Smile size={18} /></Button>
                    </div>
                  </div>
                   {showEmojiPicker && (
                      <div className="absolute bottom-20 right-4 z-50 shadow-2xl rounded-2xl overflow-hidden">
                         <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} previewConfig={{ showPreview: false }} />
                      </div>
                   )}
                   <Button
                      isIconOnly
                      type="submit"
                      color="primary"
                      className="min-w-10 h-10 rounded-xl shadow-lg"
                      isLoading={replyMutation.isPending}
                      disabled={(!newComment.trim() && !imageFile)}
                   >
                     <ArrowUp size={20} strokeWidth={3} />
                   </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center h-14 text-center px-4 text-zinc-400 text-xs font-bold uppercase italic tracking-tighter">
                  <button onClick={() => setActiveModal('login')} className="text-primary underline mr-1">Zaloguj się</button>
                   aby skomentować
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentsModal;
