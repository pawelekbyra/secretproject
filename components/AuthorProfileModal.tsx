'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, Instagram, Grid, Heart, Lock, Loader2, Youtube } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Image from 'next/image';
import { DEFAULT_AVATAR_URL } from '@/lib/constants';
import UserBadge from './UserBadge';
import { fetchAuthorProfile } from '@/lib/queries';
import { AuthorProfile } from '@/types';
import { formatCount, cn } from '@/lib/utils';
import { SafeLock } from './SafeLock';
import { useUser } from '@/context/UserContext';
import { Button, Tabs, Tab, Avatar } from "@heroui/react";

const TiktokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

interface AuthorProfileModalProps {
    authorId: string;
    onClose: () => void;
}

export function AuthorProfileModal({ authorId, onClose }: AuthorProfileModalProps) {
    const { jumpToSlide, openTippingModal } = useStore();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<'videos' | 'liked' | 'private'>('videos');

    const { data: profile, isLoading, isError } = useQuery<AuthorProfile>({
        queryKey: ['author', authorId],
        queryFn: () => fetchAuthorProfile(authorId),
        enabled: !!authorId,
        placeholderData: (previousData) => previousData,
    });

    const isPatron = !!user;

    const stats = useMemo(() => {
        if (!profile) return { followers: 0, likes: 0 };
        const seed = authorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
            followers: 10 + (seed * 123) % 1000,
            likes: 5000 + (seed * 456) % 5000000
        };
    }, [profile, authorId]);

    const handleSlideClick = (slideId: string) => {
        jumpToSlide(slideId);
        onClose();
    };

    const togglePatron = () => {
        if (isPatron) return;
        onClose();
        openTippingModal({ fromLeft: false });
    };

    if (!authorId) return null;

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="absolute inset-0 z-[70] bg-white flex flex-col overflow-hidden"
            style={{ height: '100%', width: '100%' }}
        >
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="app-handle" />

                <div className="flex items-center justify-between px-2 text-zinc-900 border-b border-zinc-100 z-10 relative bg-white/80 backdrop-blur-md"
                    style={{ height: '50px' }}>
                    <div className="flex justify-start w-12">
                        <Button isIconOnly variant="light" onClick={onClose}>
                            <ChevronLeft size={24} />
                        </Button>
                    </div>
                    <div className="flex justify-center flex-1">
                        <span className="font-bold italic tracking-tighter uppercase text-base truncate max-w-[200px]">
                            {profile?.username || '...'}
                        </span>
                    </div>
                    <div className="w-12" />
                </div>

                {isLoading && !profile ? (
                    <div className="flex-1 flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center h-[300px] space-y-4 text-zinc-400">
                        <p>Nie udało się załadować profilu.</p>
                        <Button variant="flat" onClick={onClose}>Zamknij</Button>
                    </div>
                ) : profile ? (
                    <div className="pb-20">
                        <div className="flex flex-col items-center pt-6 px-4">
                            <Avatar
                                src={profile.avatarUrl || DEFAULT_AVATAR_URL}
                                className="w-24 h-24 text-large border-2 border-white shadow-lg mb-3"
                            />

                            <h1 className={cn("text-xl font-bold italic tracking-tighter uppercase mb-1", profile.role === 'patron' ? "text-yellow-600" : "text-zinc-900")}>
                                {profile.username}
                            </h1>

                            <div className="mb-4">
                                <UserBadge role={profile.role} />
                            </div>

                            {profile.bio && (
                                <p className="text-sm text-center text-zinc-600 whitespace-pre-wrap mb-4 px-6 leading-tight max-w-sm">
                                    {profile.bio}
                                </p>
                            )}

                            <div className="flex items-center gap-8 mt-2 mb-6">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-zinc-900 text-lg">{formatCount(profile.slides.length)}</span>
                                    <span className="text-[10px] font-bold italic tracking-tighter uppercase text-zinc-400">Filmiki</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-zinc-900 text-lg">{formatCount(stats.followers)}</span>
                                    <span className="text-[10px] font-bold italic tracking-tighter uppercase text-zinc-400">Patroni</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-zinc-900 text-lg">{formatCount(stats.likes)}</span>
                                    <span className="text-[10px] font-bold italic tracking-tighter uppercase text-zinc-400">Polubienia</span>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full max-w-xs mb-6">
                                <Button
                                    onClick={togglePatron}
                                    disabled={isPatron}
                                    color={isPatron ? "default" : "primary"}
                                    variant={isPatron ? "flat" : "solid"}
                                    className="flex-grow font-bold uppercase italic tracking-tighter"
                                >
                                    {isPatron ? "Jesteś Patronem" : "Zostań Patronem"}
                                </Button>
                            </div>

                            <div className="flex gap-4 mb-8">
                                <Button isIconOnly variant="flat" className="rounded-full bg-zinc-100"><Youtube size={18} /></Button>
                                <Button isIconOnly variant="flat" className="rounded-full bg-zinc-100"><Instagram size={18} /></Button>
                                <Button isIconOnly variant="flat" className="rounded-full bg-zinc-100"><TiktokIcon size={18} /></Button>
                            </div>
                        </div>

                        <div className="w-full">
                            <Tabs
                                variant="underlined"
                                aria-label="Profile tabs"
                                color="primary"
                                fullWidth
                                classNames={{
                                    tabList: "gap-6 w-full relative rounded-none border-b border-zinc-100 px-4",
                                    cursor: "w-full bg-primary",
                                    tab: "max-w-fit px-0 h-12",
                                    tabContent: "group-data-[selected=true]:text-primary font-bold"
                                }}
                                selectedKey={activeTab}
                                onSelectionChange={(key) => setActiveTab(key as any)}
                            >
                                <Tab key="videos" title={<Grid size={20} />} />
                                <Tab key="liked" title={<Heart size={20} />} />
                                <Tab key="private" title={<Lock size={20} />} />
                            </Tabs>

                            <div className="mt-1">
                                {activeTab === 'videos' ? (
                                    <div className="grid grid-cols-3 gap-[1px]">
                                        {profile.slides && profile.slides.length > 0 ? profile.slides.map(slide => (
                                            <div
                                                key={slide.id}
                                                className="aspect-[3/4] bg-zinc-100 relative cursor-pointer overflow-hidden group"
                                                onClick={() => handleSlideClick(slide.id)}
                                            >
                                                <Image
                                                    src={slide.thumbnailUrl || 'https://placehold.co/600x800/eee/999?text=Video'}
                                                    alt={slide.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    sizes="(max-width: 768px) 33vw, 150px"
                                                />
                                                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-white drop-shadow-md">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                    <span className="text-[10px] font-bold">
                                                        {formatCount(Math.floor(Math.random() * 50000))}
                                                    </span>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-3 py-20 flex flex-col items-center text-zinc-400">
                                                <p className="text-sm">Brak filmów.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : activeTab === 'liked' ? (
                                    <div className="flex flex-col items-center justify-center min-h-[200px] text-zinc-400 space-y-2 py-10 px-6 text-center">
                                        <Heart size={32} className="mb-2 opacity-20" />
                                        <h3 className="font-bold text-zinc-900 uppercase italic tracking-tighter">Prywatne</h3>
                                        <p className="text-xs">Polubione filmy są widoczne tylko dla użytkownika.</p>
                                    </div>
                                ) : (
                                    <div className="py-10">
                                        <SafeLock />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </motion.div>
    );
}
