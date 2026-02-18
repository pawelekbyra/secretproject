"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Film, Mail, Loader2 } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { useStore } from '@/store/useStore';
import { createUserByAdmin } from '@/lib/admin-actions';
import { cn } from '@/lib/utils';
import UserManagementTable from './UserManagementTable';

export default function AdminModal() {
    const { isAdminModalOpen, closeAdminModal } = useStore();
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'users' | 'slides'>('users');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isAdminModalOpen) return null;

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await createUserByAdmin(email);
            if (result.success) {
                addToast(result.message || 'Użytkownik utworzony pomyślnie. Email wysłany.', 'success');
                setEmail('');
            } else {
                addToast(result.message || 'Wystąpił błąd.', 'error');
            }
        } catch (error: any) {
            addToast(error.message || 'Wystąpił błąd.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="absolute inset-0 z-[10300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-2xl bg-[#1C1C1E]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-1 shrink-0" />
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-4 border-b border-white/5">
                    <h2 className="text-xl font-black italic tracking-tighter text-white">Panel Admina</h2>
                    <button
                        onClick={closeAdminModal}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 py-4 gap-4 border-b border-white/5">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all uppercase",
                            activeTab === 'users'
                                ? "bg-gradient-to-r from-[#FE2C55] to-[#FF5E7D] text-white shadow-lg shadow-pink-500/20"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Users size={16} />
                        Użytkownicy
                    </button>
                    <button
                        onClick={() => setActiveTab('slides')}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all uppercase",
                            activeTab === 'slides'
                                ? "bg-gradient-to-r from-[#FE2C55] to-[#FF5E7D] text-white shadow-lg shadow-pink-500/20"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Film size={16} />
                        Slajdy
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeTab === 'users' && (
                        <div className="space-y-10">
                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-inner">
                                <h3 className="text-lg font-bold text-white mb-2">Dodaj nowego użytkownika</h3>
                                <p className="text-sm text-white/40 mb-8">
                                    System utworzy konto z tymczasowym hasłem i wyśle instrukcje na podany adres email.
                                </p>
                                <form onSubmit={handleCreateUser} className="space-y-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Adres Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-500 transition-colors" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="user@example.com"
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-pink-500 focus:bg-black/60 transition-all font-medium shadow-inner"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !email}
                                        className="w-full py-4 bg-gradient-to-r from-[#FE2C55] to-[#FF5E7D] text-white rounded-2xl font-bold shadow-lg shadow-pink-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Przetwarzanie...
                                            </>
                                        ) : (
                                            "Utwórz użytkownika"
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* User Management List */}
                            <div className="pt-4 border-t border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4">Zarządzaj Użytkownikami</h3>
                                <UserManagementTable />
                            </div>
                        </div>
                    )}

                    {activeTab === 'slides' && (
                        <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-4">
                            <Film size={48} strokeWidth={1} className="opacity-50" />
                            <p>Zarządzanie slajdami - w przygotowaniu</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
