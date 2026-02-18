"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plus, ChevronLeft, ChevronRight, Trash2, Trophy,
    Flame, Target, Info, CheckCircle2, AlertCircle,
    TrendingUp, TrendingDown, Star, Zap
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, isAfter } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { ModalHeader } from './ui/ModalHeader';

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
    { name: 'Bieganie', icon: '🏃', type: 'good' as const },
    { name: 'Medytacja', icon: '🧘', type: 'good' as const },
    { name: 'Siłownia', icon: '💪', type: 'good' as const },
    { name: 'Czytanie', icon: '📚', type: 'good' as const },
    { name: 'Woda 2L', icon: '💧', type: 'good' as const },
    { name: 'Zdrowe jedzenie', icon: '🥗', type: 'good' as const },
    { name: 'Alkohol', icon: '🍺', type: 'bad' as const },
    { name: 'Słodycze', icon: '🍩', type: 'bad' as const },
    { name: 'Palenie', icon: '🚬', type: 'bad' as const },
    { name: 'Social Media', icon: '📱', type: 'bad' as const },
    { name: 'Hazard', icon: '🎰', type: 'bad' as const },
    { name: 'Pornografia', icon: '🔞', type: 'bad' as const },
];

const toISODateString = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
};

const HabitTrackerModal = ({ onClose }: { onClose: () => void }) => {
    const { t, lang } = useTranslation();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isAddingHabit, setIsAddingHabit] = useState(false);
    const [customHabitName, setCustomHabitName] = useState('');
    const [newHabitType, setNewHabitType] = useState<'good' | 'bad'>('good');

    const dateLocale = lang === 'pl' ? pl : enUS;

    const { data: habits, isLoading } = useQuery({
        queryKey: ['habits'],
        queryFn: async () => {
            const res = await fetch('/api/habits');
            if (!res.ok) throw new Error('Failed to fetch habits');
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
            if (!res.ok) throw new Error('Failed to add habit');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            setIsAddingHabit(false);
            setCustomHabitName('');
            addToast(lang === 'pl' ? 'Nawyk dodany! Do dzieła!' : 'Habit added! Let\'s go!', 'success');
        },
        onError: () => {
            addToast(lang === 'pl' ? 'Błąd podczas dodawania nawyku' : 'Error adding habit', 'error');
        }
    });

    const deleteHabitMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete habit');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            if (selectedHabitId) setSelectedHabitId(null);
            addToast(lang === 'pl' ? 'Nawyk usunięty' : 'Habit deleted', 'success');
        }
    });

    const logMutation = useMutation({
        mutationFn: async ({ habitId, date, isSuccess }: { habitId: string, date: Date, isSuccess: boolean | null }) => {
            const dateStr = toISODateString(date);
            const res = await fetch(`/api/habits/${habitId}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateStr, isSuccess }),
            });
            if (!res.ok) throw new Error('Failed to log habit');
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

        const dateStr = toISODateString(date);
        const existingLog = selectedHabit?.logs.find(l => l.date.startsWith(dateStr));
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

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = toISODateString(checkDate);
            const log = habit.logs.find(l => l.date.startsWith(dateStr));

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

    const goodHabits = useMemo(() => habits?.filter(h => h.type === 'good') || [], [habits]);
    const badHabits = useMemo(() => habits?.filter(h => h.type === 'bad') || [], [habits]);

    const renderHabitCard = (habit: Habit) => (
        <motion.div
            key={habit.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedHabitId(habit.id)}
            className={cn(
                "relative overflow-hidden bg-zinc-900/40 border p-4 rounded-2xl flex items-center justify-between group transition-all cursor-pointer",
                habit.type === 'good' ? "border-emerald-500/10 hover:border-emerald-500/30" : "border-rose-500/10 hover:border-rose-500/30"
            )}
        >
            <div className="flex items-center gap-4 z-10">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner",
                    habit.type === 'good' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                    {habit.icon}
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">{habit.name}</h3>
                    <div className="flex items-center gap-1.5">
                        {habit.type === 'good' ? (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                        ) : (
                            <AlertCircle size={12} className="text-rose-500" />
                        )}
                        <p className={cn(
                            "text-[10px] tracking-widest font-bold",
                            habit.type === 'good' ? "text-emerald-500/60" : "text-rose-500/60"
                        )}>
                            {habit.type === 'good' ? 'Pozytywne' : 'Wyzwanie'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 z-10">
                <div className="flex flex-col items-end">
                    <div className={cn(
                        "flex items-center gap-1 font-black italic text-lg",
                        habit.type === 'good' ? "text-emerald-400" : "text-rose-400"
                    )}>
                        <Flame size={16} className={calculateStreak(habit) > 0 ? "fill-current" : ""} />
                        <span>{calculateStreak(habit)}</span>
                    </div>
                </div>
                <ChevronRight className="text-white/10 group-hover:text-white transition-colors" />
            </div>

            {/* Background Decorative Element */}
            <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none",
                habit.type === 'good' ? "text-emerald-500" : "text-rose-500"
            )}>
                {habit.type === 'good' ? <TrendingUp size={96} /> : <TrendingDown size={96} />}
            </div>
        </motion.div>
    );

    const renderCalendar = () => {
        if (!selectedHabit) return null;

        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <h3 className="text-xl font-black capitalize tracking-tighter italic">
                        {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
                    </h3>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="bg-zinc-900/30 p-4 rounded-3xl border border-white/5">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (
                            <div key={d} className="text-center text-[10px] text-white/20 font-black tracking-widest">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {/* Add empty slots for the first day of the month */}
                        {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}
                        {daysInMonth.map(day => {
                            const dateStr = toISODateString(day);
                            const log = selectedHabit.logs.find(l => l.date.startsWith(dateStr));
                            const isFuture = isAfter(day, new Date()) && !isSameDay(day, new Date());

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => handleToggleDay(day)}
                                    disabled={isFuture}
                                    className={cn(
                                        "aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all relative overflow-hidden group/day",
                                        isToday(day) && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-black",
                                        !log && "bg-white/5 text-white/30 hover:bg-white/10",
                                        log?.isSuccess && (selectedHabit.type === 'good'
                                            ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                            : "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"), // Avoided bad habit = success (green)
                                        log?.isSuccess === false && "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]",
                                        isFuture && "opacity-10 cursor-not-allowed"
                                    )}
                                >
                                    <span className="relative z-10">{format(day, 'd')}</span>
                                    {log?.isSuccess && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute inset-0 bg-white/20 blur-xl rounded-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-orange-500">
                            <Flame size={16} className="fill-current" />
                            <span className="text-[10px] font-black tracking-widest">Seria</span>
                        </div>
                        <div className="text-2xl font-black italic">{calculateStreak(selectedHabit)} dni</div>
                    </div>
                    <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-indigo-500">
                            <Zap size={16} className="fill-current" />
                            <span className="text-[10px] font-black tracking-widest">Skuteczność</span>
                        </div>
                        <div className="text-2xl font-black italic">
                            {selectedHabit.logs.length > 0
                                ? Math.round((selectedHabit.logs.filter(l => l.isSuccess).length / selectedHabit.logs.length) * 100)
                                : 0}%
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex flex-col"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        >
            <ModalHeader
                title={selectedHabitId ? selectedHabit?.name || '' : (lang === 'pl' ? 'Nawyki' : 'Habits')}
                subtitle={selectedHabit ? (selectedHabit.type === 'good' ? (lang === 'pl' ? 'Dobry nawyk' : 'Good habit') : (lang === 'pl' ? 'Zły nawyk' : 'Bad habit')) : undefined}
                onClose={onClose}
                showBack={!!selectedHabitId}
                onBack={() => setSelectedHabitId(null)}
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {!selectedHabitId ? (
                    <div className="flex flex-col gap-8 pb-10">
                        {/* Summary Dashboard */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star size={16} className="fill-yellow-300 text-yellow-300" />
                                        <h2 className="text-sm font-black tracking-widest opacity-80">Twój postęp</h2>
                                    </div>
                                    <h3 className="text-2xl font-black italic mb-6">Wykuj swą potęgę! 🔥</h3>

                                    <div className="flex gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black opacity-60 tracking-wider mb-1">Dobre</span>
                                            <span className="text-3xl font-black">{goodHabits.length}</span>
                                        </div>
                                        <div className="w-[1px] bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black opacity-60 tracking-wider mb-1">Wyzwania</span>
                                            <span className="text-3xl font-black">{badHabits.length}</span>
                                        </div>
                                        <div className="w-[1px] bg-white/10" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black opacity-60 tracking-wider mb-1">Sukcesy</span>
                                            <span className="text-3xl font-black text-emerald-300">
                                                {habits?.reduce((acc, h) => acc + h.logs.filter(l => l.isSuccess).length, 0) || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Trophy className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 rotate-12" />
                            </div>
                        </div>

                        {/* Good Habits Section */}
                        {goodHabits.length > 0 && (
                            <section className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="h-[2px] flex-1 bg-emerald-500/20" />
                                    <h2 className="text-xs font-black tracking-[0.3em] text-emerald-500/50">Zalety</h2>
                                    <div className="h-[2px] flex-1 bg-emerald-500/20" />
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {goodHabits.map(habit => renderHabitCard(habit))}
                                </div>
                            </section>
                        )}

                        {/* Bad Habits Section */}
                        {badHabits.length > 0 && (
                            <section className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="h-[2px] flex-1 bg-rose-500/20" />
                                    <h2 className="text-xs font-black tracking-[0.3em] text-rose-500/50">Wyzwania</h2>
                                    <div className="h-[2px] flex-1 bg-rose-500/20" />
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {badHabits.map(habit => renderHabitCard(habit))}
                                </div>
                            </section>
                        )}

                        {isLoading && <div className="text-center py-10 font-black italic text-white/20 animate-pulse">ŁADOWANIE...</div>}

                        {!isLoading && habits?.length === 0 && (
                            <div className="text-center py-20 flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10 border border-white/5">
                                    <Target size={40} />
                                </div>
                                <p className="text-white/30 italic font-medium">Brak nawyków. Czas coś zmienić!</p>
                            </div>
                        )}

                        {/* Add Habit Button */}
                        <button
                            onClick={() => setIsAddingHabit(true)}
                            className="w-full py-6 rounded-3xl border-2 border-dashed border-white/5 text-white/20 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-3 font-black tracking-widest text-sm hover:bg-white/[0.02]"
                        >
                            <Plus size={24} />
                            Dodaj nowy cel
                        </button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="pb-10"
                    >
                        {renderCalendar()}

                        <div className="mt-12 flex justify-between items-center px-4 py-6 bg-zinc-900/40 rounded-[2rem] border border-white/5">
                             <div className="flex items-center gap-3 text-white/30 text-xs font-medium">
                                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                    <Info size={16} />
                                 </div>
                                 <span>Klikaj dni, aby zmieniać status</span>
                             </div>
                             <button
                                onClick={() => {
                                    if(confirm(lang === 'pl' ? 'Na pewno usunąć ten nawyk i wszystkie dane?' : 'Delete this habit and all logs?')) {
                                        deleteHabitMutation.mutate(selectedHabitId!);
                                    }
                                }}
                                className="w-12 h-12 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all"
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
                        className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAddingHabit(false)}
                    >
                        <motion.div
                            className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-black italic mb-8 tracking-tighter">Nowy cel</h2>

                            {/* Type Toggle */}
                            <div className="flex p-1 bg-black rounded-2xl mb-8 border border-white/5">
                                <button
                                    onClick={() => setNewHabitType('good')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all",
                                        newHabitType === 'good' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    Pozytywny
                                </button>
                                <button
                                    onClick={() => setNewHabitType('bad')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all",
                                        newHabitType === 'bad' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    Wyzwanie
                                </button>
                            </div>

                            {/* Predefined Habits Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {PREDEFINED_HABITS.filter(h => h.type === newHabitType).slice(0, 6).map(ph => (
                                    <button
                                        key={ph.name}
                                        onClick={() => addHabitMutation.mutate(ph)}
                                        className="aspect-square bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all group"
                                    >
                                        <span className="text-3xl group-hover:scale-125 transition-transform">{ph.icon}</span>
                                        <span className="text-[10px] font-black tracking-tighter opacity-60">{ph.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <div className="text-[10px] text-white/20 font-black mb-3 ml-2 tracking-widest">Własna nazwa</div>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={customHabitName}
                                        onChange={(e) => setCustomHabitName(e.target.value)}
                                        placeholder="Np. Zimny prysznic..."
                                        className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-colors font-medium"
                                    />
                                    <button
                                        onClick={() => addHabitMutation.mutate({ name: customHabitName, icon: newHabitType === 'good' ? '✨' : '🚫', type: newHabitType })}
                                        disabled={!customHabitName || addHabitMutation.isPending}
                                        className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all shadow-xl",
                                            newHabitType === 'good' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20",
                                            (!customHabitName || addHabitMutation.isPending) && "opacity-50 grayscale"
                                        )}
                                    >
                                        <Plus size={32} strokeWidth={3} />
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
