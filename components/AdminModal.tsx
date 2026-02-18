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
        <div className="absolute inset-0 z-[10300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={closeAdminModal}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-2xl glass-modal rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-col items-center pb-4 shrink-0">
                    <div className="modal-handle" />
                    <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">Panel Administratora</h2>
                    <button
                        onClick={closeAdminModal}
                        className="absolute right-5 top-6 p-2 text-white/40 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/[0.03] border-y border-white/5">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 py-5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'users' ? 'text-pink-500' : 'text-white/30 hover:text-white/60'}`}
                    >
                        <Users size={14} />
                        Użytkownicy
                        {activeTab === 'users' && <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('slides')}
                        className={`flex-1 py-5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'slides' ? 'text-pink-500' : 'text-white/30 hover:text-white/60'}`}
                    >
                        <Film size={14} />
                        Slajdy
                        {activeTab === 'slides' && <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#18181b]">
                    {activeTab === 'users' && (
                        <div className="space-y-8">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-4">Dodaj nowego użytkownika</h3>
                                <p className="text-sm text-white/50 mb-6">
                                    System utworzy konto z tymczasowym hasłem i wyśle instrukcje na podany adres email.
                                </p>
                                <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-white/70 uppercase">Adres Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="user@example.com"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !email}
                                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
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
