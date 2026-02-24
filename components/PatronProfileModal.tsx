'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { DEFAULT_AVATAR_URL } from '@/lib/constants';
import UserBadge from './UserBadge';
import { useQuery } from '@tanstack/react-query';
import { fetchAuthorProfile } from '@/lib/queries';

interface PatronProfileModalProps {
    patronId: string;
    onClose: () => void;
}

export function PatronProfileModal({ patronId, onClose }: PatronProfileModalProps) {
    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ['author', patronId],
        queryFn: () => fetchAuthorProfile(patronId),
        enabled: !!patronId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[10100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                className="relative flex flex-col w-full max-w-sm bg-white text-foreground rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-black/5 mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                    <header className="relative flex items-center justify-center p-6 border-b border-black/5 shrink-0 bg-secondary/50">
                        <h2 className="text-lg font-black italic tracking-tight uppercase">Profil Użytkownika</h2>
                        <button onClick={onClose} className="absolute p-2 right-4 top-1/2 -translate-y-1/2 rounded-full hover:bg-black/5 text-foreground/20 hover:text-foreground transition-all">
                            <X size={22} />
                        </button>
                    </header>

                    <main className="p-8">
                        {isLoading ? (
                            <PatronProfileSkeleton />
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <p>Nie udało się załadować profilu.</p>
                            </div>
                        ) : profile ? (
                            <div className="flex flex-col items-center text-center">
                                <div className="relative w-24 h-24 mb-4 rounded-full">
                                    <Image
                                      src={profile.avatarUrl || DEFAULT_AVATAR_URL}
                                      alt={profile.username}
                                      layout="fill"
                                      objectFit="cover"
                                      className="rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                    />
                                </div>
                                <h3 className="text-3xl font-black italic tracking-tighter text-foreground mb-1">{profile.username}</h3>
                                <UserBadge role={profile.role} className="mb-4" />
                                {profile.bio ? (
                                    <p className="text-foreground/60 text-sm leading-relaxed mt-2 font-medium">{profile.bio}</p>
                                ) : (
                                    <p className="text-foreground/20 text-sm italic font-bold">Brak opisu.</p>
                                )}
                            </div>
                        ) : null}
                    </main>
                </motion.div>
        </motion.div>
    );
}

const PatronProfileSkeleton = () => (
    <div className="flex flex-col items-center">
        <Skeleton className="w-24 h-24 rounded-full mb-4" />
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-60" />
    </div>
)
