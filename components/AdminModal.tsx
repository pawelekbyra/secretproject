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
import { Button, Input, Tabs, Tab } from "@heroui/react";

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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50">
                    <h2 className="text-xl font-bold italic tracking-tighter uppercase text-zinc-900">Panel Administratora</h2>
                    <Button isIconOnly variant="light" onClick={closeAdminModal} className="text-zinc-400">
                        <X size={20} />
                    </Button>
                </div>

                <div className="px-6 pt-4">
                    <Tabs
                        selectedKey={activeTab}
                        onSelectionChange={(key) => setActiveTab(key as any)}
                        variant="underlined"
                        color="primary"
                        classNames={{
                            tabList: "gap-6",
                            tabContent: "font-bold uppercase italic tracking-tighter text-sm"
                        }}
                    >
                        <Tab key="users" title={<div className="flex items-center gap-2"><Users size={16} />Użytkownicy</div>} />
                        <Tab key="slides" title={<div className="flex items-center gap-2"><Film size={16} />Slajdy</div>} />
                    </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'users' && (
                        <div className="space-y-8">
                            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                <h3 className="text-sm font-bold italic tracking-tighter uppercase text-zinc-900 mb-4">Dodaj nowego użytkownika</h3>
                                <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
                                    <Input
                                        type="email"
                                        value={email}
                                        onValueChange={setEmail}
                                        placeholder="user@example.com"
                                        label="Adres Email"
                                        labelPlacement="outside"
                                        variant="flat"
                                        startContent={<Mail size={18} className="text-zinc-400" />}
                                        required
                                        classNames={{
                                            inputWrapper: "bg-white border-zinc-200",
                                            label: "text-zinc-500 font-bold uppercase italic tracking-tighter text-[10px]"
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isLoading={isSubmitting}
                                        disabled={!email}
                                        className="w-full font-bold uppercase italic tracking-tighter"
                                    >
                                        Utwórz użytkownika
                                    </Button>
                                </form>
                                <div className="mt-4 flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-medium">
                                    <Info size={16} className="shrink-0 mt-0.5" />
                                    <p>System automatycznie utworzy konto i wyśle link do ustawienia hasła.</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-zinc-100">
                                <h3 className="text-sm font-bold italic tracking-tighter uppercase text-zinc-900 mb-4">Zarządzaj Użytkownikami</h3>
                                <UserManagementTable />
                            </div>
                        </div>
                    )}
                    {activeTab === 'slides' && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4 py-20">
                            <Film size={48} strokeWidth={1} className="opacity-20" />
                            <p className="font-bold uppercase italic tracking-tighter">W przygotowaniu</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
