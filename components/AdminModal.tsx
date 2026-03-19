"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TRANSITION_SPRING_MODAL,
    MODAL_VARIANTS_SCALE,
    TAP_SCALE
} from '@/lib/animations';
import { X, Users, Film, Mail, Loader2, Info } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { useStore } from '@/store/useStore';
import { createUserByAdmin } from '@/lib/admin-actions';
import { cn } from '@/lib/utils';
import UserManagementTable from './UserManagementTable';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
        <div className="absolute inset-0 z-[10300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
                variants={MODAL_VARIANTS_SCALE}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={TRANSITION_SPRING_MODAL}
                className="w-full max-w-2xl app-modal-glass rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
                    <h2 className="text-xl font-bold text-white tracking-tight">Panel Administratora</h2>
                    <button onClick={closeAdminModal} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex p-4 gap-4 border-b border-white/10">
                    <Button variant={activeTab === 'users' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('users')} className="flex items-center gap-2">
                        <Users size={16} />
                        Użytkownicy
                    </Button>
                    <Button variant={activeTab === 'slides' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('slides')} className="flex items-center gap-2">
                        <Film size={16} />
                        Slajdy
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-black/10">
                    {activeTab === 'users' && (
                        <div className="space-y-8">
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-4">Dodaj nowego użytkownika</h3>
                                <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-white/70 uppercase">Adres Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10" size={18} />
                                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="pl-12" required />
                                        </div>
                                    </div>
                                    <Button type="submit" variant="default" size="lg" disabled={isSubmitting || !email} className="w-full">
                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Utwórz użytkownika"}
                                    </Button>
                                </form>
                                <div className="mt-4 flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200 text-xs">
                                    <Info size={16} className="shrink-0 mt-0.5" />
                                    <p>System automatycznie utworzy konto i wyśle link do ustawienia hasła. Jeśli użytkownik już istnieje, zostanie mu przypisana rola &apos;user&apos; (jeśli nie jest adminem).</p>
                                </div>
                            </div>
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
