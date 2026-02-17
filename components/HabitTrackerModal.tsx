"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronLeft, ChevronRight, Trash2, Trophy, Flame, Target, Info } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, isAfter } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface Habit {
    id: string;
    name: string;
    icon: string;
    type: 'good' | 'bad';
    logs: HabitLog[];
}

interface HabitLog {
    id: string;
    date: string;
    isSuccess: boolean;
}

const PREDEFINED_HABITS = [
    { name: 'Wóda', icon: '🍺', type: 'bad' as const },
    { name: 'Trawa', icon: '🌿', type: 'bad' as const },
    { name: 'Papierixy', icon: '🚬', type: 'bad' as const },
    { name: 'Walenie', icon: '✊', type: 'bad' as const },
    { name: 'Bieganie 5 km', icon: '🏃', type: 'good' as const },
    { name: 'Gimnastyka', icon: '🧘', type: 'good' as const },
];

const HabitTrackerModal = ({ onClose }: { onClose: () => void }) => {
    const { t, lang } = useTranslation();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isAddingHabit, setIsAddingHabit] = useState(false);
    const [customHabitName, setCustomHabitName] = useState('');

    const dateLocale = lang === 'pl' ? pl : enUS;

    const { data: habits, isLoading } = useQuery({
        queryKey: ['habits'],
        queryFn: async () => {
            const res = await fetch('/api/habits');
            const json = await res.json();
            return json.data as Habit[];
        }
    });

    const addHabitMutation = useMutation({
        mutationFn: async (habit: Partial<Habit>) => {
            const res = await fetch('/api/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(habit),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            setIsAddingHabit(false);
            setCustomHabitName('');
            addToast(lang === 'pl' ? 'Nawyk dodany!' : 'Habit added!', 'success');
        }
    });

    const deleteHabitMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/habits/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            if (selectedHabitId) setSelectedHabitId(null);
            addToast(lang === 'pl' ? 'Nawyk usunięty' : 'Habit deleted', 'success');
        }
    });

    const logMutation = useMutation({
        mutationFn: async ({ habitId, date, isSuccess }: { habitId: string, date: Date, isSuccess: boolean | null }) => {
            const res = await fetch(`/api/habits/${habitId}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, isSuccess }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        }
    });

    const selectedHabit = useMemo(() => habits?.find(h => h.id === selectedHabitId), [habits, selectedHabitId]);

    const daysInMonth = useMemo(() => {
        return eachDayOfInterval({
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth),
        });
    }, [currentMonth]);

    const handleToggleDay = (date: Date) => {
        if (isAfter(date, new Date()) && !isSameDay(date, new Date())) return;
        if (!selectedHabitId) return;

        const existingLog = selectedHabit?.logs.find(l => isSameDay(new Date(l.date), date));
        let nextStatus: boolean | null = null;

        if (!existingLog) nextStatus = true; // First click: Success
        else if (existingLog.isSuccess) nextStatus = false; // Second click: Failure
        else nextStatus = null; // Third click: Clear

        logMutation.mutate({ habitId: selectedHabitId, date, isSuccess: nextStatus });
    };

    const calculateStreak = (habit: Habit) => {
        let streak = 0;
        const today = new Date();
        today.setHours(0,0,0,0);

        // Sort logs descending
        const sortedLogs = [...habit.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let currentDate = today;
        // If no log for today, check yesterday
        const hasToday = sortedLogs.find(l => isSameDay(new Date(l.date), today));
        if (!hasToday) {
            currentDate = subMonths(today, 0); // Still today
            // Actually let's just start from the most recent success
        }

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const log = habit.logs.find(l => isSameDay(new Date(l.date), checkDate));
            if (log && log.isSuccess) {
                streak++;
            } else if (isSameDay(checkDate, today)) {
                // Ignore today if not logged yet
                continue;
            } else {
                break;
            }
        }
        return streak;
    };

    const renderCalendar = () => {
        if (!selectedHabit) return null;

        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-full">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="text-lg font-bold capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
                    </h3>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-full">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {[t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')].map(d => (
                        <div key={d} className="text-center text-[10px] uppercase text-white/40 font-bold">{d}</div>
                    ))}
                    {/* Add empty slots for the first day of the month */}
                    {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {daysInMonth.map(day => {
                        const log = selectedHabit.logs.find(l => isSameDay(new Date(l.date), day));
                        const isFuture = isAfter(day, new Date()) && !isSameDay(day, new Date());

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => handleToggleDay(day)}
                                disabled={isFuture}
                                className={cn(
                                    "aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all relative",
                                    isToday(day) && "border-2 border-blue-500",
                                    !log && "bg-white/5 text-white/40",
                                    log?.isSuccess && "bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]",
                                    log?.isSuccess === false && "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                                    isFuture && "opacity-20 cursor-not-allowed"
                                )}
                            >
                                {format(day, 'd')}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                            <Flame size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Aktualny Streak</div>
                            <div className="text-xl font-bold">{calculateStreak(selectedHabit)} dni</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex flex-col font-sans"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-14 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    {selectedHabitId && (
                        <button onClick={() => setSelectedHabitId(null)} className="w-10 h-10 flex items-center justify-center -ml-2 hover:bg-white/5 rounded-full transition-all active:scale-90">
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <h1 className="text-2xl font-display font-black tracking-tighter uppercase italic text-white">
                        {selectedHabitId ? selectedHabit?.name : (lang === 'pl' ? 'Twoje Nawyki' : 'Your Habits')}
                    </h1>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all active:scale-90">
                    <X size={28} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {!selectedHabitId ? (
                    <div className="flex flex-col gap-6">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-primary to-purple-800 rounded-[2rem] p-7 text-white shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h2 className="text-xl font-display font-black mb-1 uppercase tracking-tighter italic">Cześć Wojowniku! 🚀</h2>
                                <p className="text-xs font-medium opacity-80 mb-6">Dzisiaj jest świetny dzień, aby stać się lepszą wersją siebie.</p>
                                <div className="flex gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Aktywne</span>
                                        <span className="text-3xl font-display font-black">{habits?.length || 0}</span>
                                    </div>
                                    <div className="w-[1px] bg-white/20" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Sukcesy</span>
                                        <span className="text-3xl font-display font-black text-green-300">
                                            {habits?.reduce((acc, h) => acc + h.logs.filter(l => l.isSuccess).length, 0) || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Trophy className="absolute right-[-20px] bottom-[-20px] w-40 h-40 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        {/* Habits List */}
                        <div className="grid grid-cols-1 gap-4">
                            {isLoading ? (
                                <div className="text-center py-10 text-white/40 font-display font-black uppercase tracking-widest text-[10px]">{t('loading')}</div>
                            ) : habits?.length === 0 ? (
                                <div className="text-center py-20 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                        <Target size={32} />
                                    </div>
                                    <p className="text-white/40 italic font-medium">Brak nawyków. Dodaj swój pierwszy!</p>
                                </div>
                            ) : (
                                habits?.map(habit => (
                                    <motion.div
                                        key={habit.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedHabitId(habit.id)}
                                        className="bg-white/[0.03] border border-white/5 p-5 rounded-3xl flex items-center justify-between group hover:bg-white/[0.06] transition-all cursor-pointer active:bg-white/[0.08]"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                                {habit.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">{habit.name}</h3>
                                                <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-black">
                                                    {habit.type === 'good' ? 'Dobry nawyk' : 'Zły nawyk'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1.5 text-primary font-display font-black text-xl italic">
                                                    <Flame size={18} className="fill-primary" />
                                                    <span>{calculateStreak(habit)}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-white/20 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Add Habit Button */}
                        <button
                            onClick={() => setIsAddingHabit(true)}
                            className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2 font-bold"
                        >
                            <Plus size={20} />
                            Dodaj nowy nawyk
                        </button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {renderCalendar()}

                        <div className="mt-8 flex justify-between items-center px-2">
                             <div className="flex items-center gap-2 text-white/20 text-xs">
                                 <Info size={14} />
                                 <span>Klikaj dni, aby zmieniać status</span>
                             </div>
                             <button
                                onClick={() => deleteHabitMutation.mutate(selectedHabitId!)}
                                className="text-red-500/50 hover:text-red-500 p-2 transition-colors"
                             >
                                <Trash2 size={20} />
                             </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Add Habit Modal Overlay */}
            <AnimatePresence>
                {isAddingHabit && (
                    <motion.div
                        className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAddingHabit(false)}
                    >
                        <motion.div
                            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-6">Co chcesz śledzić?</h2>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {PREDEFINED_HABITS.map(ph => (
                                    <button
                                        key={ph.name}
                                        onClick={() => addHabitMutation.mutate(ph)}
                                        className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-colors"
                                    >
                                        <span className="text-3xl">{ph.icon}</span>
                                        <span className="text-xs font-bold">{ph.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="text-[10px] uppercase text-white/40 font-bold mb-2 ml-2">Lub wpisz własny</div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customHabitName}
                                        onChange={(e) => setCustomHabitName(e.target.value)}
                                        placeholder="Nazwa nawyku..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                                    />
                                    <button
                                        onClick={() => addHabitMutation.mutate({ name: customHabitName, icon: '🎯', type: 'good' })}
                                        disabled={!customHabitName}
                                        className="bg-indigo-600 disabled:opacity-50 p-3 rounded-xl text-white"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HabitTrackerModal;
