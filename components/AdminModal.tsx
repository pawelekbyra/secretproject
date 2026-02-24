"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
        <div className="absolute inset-0 z-[10300] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-black/5 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between p-8 border-b border-black/5 bg-secondary/50">
                    <h2 className="text-2xl font-black text-foreground italic tracking-tighter uppercase">Panel Administratora</h2>
                    <button onClick={closeAdminModal} className="p-2 text-foreground/20 hover:text-foreground hover:bg-black/5 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex p-4 gap-4 border-b border-black/5 bg-white">
                    <Button variant={activeTab === 'users' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('users')} className="flex items-center gap-2">
                        <Users size={16} />
                        Użytkownicy
                    </Button>
                    <Button variant={activeTab === 'slides' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('slides')} className="flex items-center gap-2">
                        <Film size={16} />
                        Slajdy
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-secondary/20">
                    {activeTab === 'users' && (
                        <div className="space-y-12">
                            <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm">
                                <h3 className="text-lg font-black italic text-foreground mb-6 uppercase tracking-tighter">Dodaj nowego użytkownika</h3>
                                <form onSubmit={handleCreateUser} className="space-y-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-foreground/40 ml-2">Adres Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 z-10" size={18} />
                                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="pl-12" required />
                                        </div>
                                    </div>
                                    <Button type="submit" variant="default" size="lg" disabled={isSubmitting || !email} className="w-full">
                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Utwórz użytkownika"}
                                    </Button>
                                </form>
                                <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700/70 text-xs font-medium leading-relaxed">
                                    <Info size={18} className="shrink-0 mt-0.5 text-blue-500" />
                                    <p>System automatycznie utworzy konto i wyśle link do ustawienia hasła. Jeśli użytkownik już istnieje, zostanie mu przypisana rola &apos;user&apos; (jeśli nie jest adminem).</p>
                                </div>
                            </div>
                            <div className="pt-8 border-t border-black/5">
                                <h3 className="text-lg font-black italic text-foreground mb-6 uppercase tracking-tighter">Zarządzaj Użytkownikami</h3>
                                <UserManagementTable />
                            </div>
                        </div>
                    )}
                    {activeTab === 'slides' && (
                        <div className="flex flex-col items-center justify-center h-full text-foreground/20 space-y-4 py-20">
                            <Film size={64} strokeWidth={1} className="opacity-20" />
                            <p className="font-bold italic">Zarządzanie slajdami - w przygotowaniu</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
