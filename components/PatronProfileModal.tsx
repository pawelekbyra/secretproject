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
            className="absolute inset-0 z-[10100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative flex flex-col w-full max-w-sm glass-modal text-white rounded-[2rem] shadow-2xl mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                    <header className="relative flex flex-col items-center pb-4 shrink-0">
                        <div className="modal-handle" />
                        <h2 className="text-xl font-black italic tracking-tighter">Profil Użytkownika</h2>
                        <button onClick={onClose} className="absolute p-2 right-4 top-6 text-white/40 hover:text-white transition-colors">
                            <X size={22} />
                        </button>
                    </header>

                    <main className="p-8 pt-4 border-t border-white/5">
                        {isLoading ? (
                            <PatronProfileSkeleton />
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <p className="text-white/50 italic">Nie udało się załadować profilu.</p>
                            </div>
                        ) : profile ? (
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-white/10 rounded-full blur-xl opacity-50" />
                                    <div className="relative w-28 h-28 rounded-full z-10">
                                        <Image
                                          src={profile.avatarUrl || DEFAULT_AVATAR_URL}
                                          alt={profile.username}
                                          layout="fill"
                                          objectFit="cover"
                                          className="rounded-full border-2 border-white shadow-2xl"
                                        />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black italic tracking-tighter mb-1">@{profile.username}</h3>
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
