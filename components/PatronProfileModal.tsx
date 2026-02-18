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
            className="absolute inset-0 z-[10100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative flex flex-col w-full max-w-sm bg-[#1C1C1E]/90 backdrop-blur-2xl text-white rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-1 shrink-0" />
                    <header className="relative flex items-center justify-center p-4 border-b border-white/5 shrink-0">
                        <h2 className="text-base font-bold tracking-tight">Profil Użytkownika</h2>
                        <button onClick={onClose} className="absolute p-2 right-4 top-2 rounded-full text-white/40 hover:text-white transition-colors">
                            <X size={24} />
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
                                <div className="relative w-28 h-28 mb-6 group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                                    <Image
                                      src={profile.avatarUrl || DEFAULT_AVATAR_URL}
                                      alt={profile.username}
                                      layout="fill"
                                      objectFit="cover"
                                      className="relative rounded-full border-2 border-white shadow-2xl transition-transform group-active:scale-95"
                                    />
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter mb-1">{profile.username}</h3>
                                <UserBadge role={profile.role} className="mb-2" />
                                {profile.bio ? (
                                    <p className="text-neutral-400 text-sm leading-relaxed mt-2">{profile.bio}</p>
                                ) : (
                                    <p className="text-neutral-600 text-sm italic">Brak opisu.</p>
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
