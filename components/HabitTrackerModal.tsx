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
import { Button, Input, Progress, Chip, Card, CardBody, Tabs, Tab } from "@heroui/react";

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
            addToast(lang === 'pl' ? 'Nawyk dodany!' : 'Habit added!', 'success');
        },
        onError: () => addToast(lang === 'pl' ? 'Błąd' : 'Error', 'error')
    });

    const deleteHabitMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete habit');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            if (selectedHabitId) setSelectedHabitId(null);
            addToast(lang === 'pl' ? 'Usunięto' : 'Deleted', 'success');
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
            if (!res.ok) throw new Error('Failed to log');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] })
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

        if (!existingLog) nextStatus = true;
        else if (existingLog.isSuccess) nextStatus = false;
        else nextStatus = null;

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
            if (log && log.isSuccess) streak++;
            else if (isSameDay(checkDate, today)) continue;
            else break;
        }
        return streak;
    };

    const goodHabits = useMemo(() => habits?.filter(h => h.type === 'good') || [], [habits]);
    const badHabits = useMemo(() => habits?.filter(h => h.type === 'bad') || [], [habits]);

    const renderHabitCard = (habit: Habit) => (
        <Card
            key={habit.id}
            isPressable
            onPress={() => setSelectedHabitId(habit.id)}
            className="border border-zinc-100 shadow-sm rounded-[2rem] bg-white hover:bg-zinc-50 transition-colors"
        >
            <CardBody className="p-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl",
                        habit.type === 'good' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                    )}>
                        {habit.icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 text-base italic uppercase tracking-tighter">{habit.name}</h3>
                        <div className="flex items-center gap-1.5">
                            <Chip
                                size="sm"
                                variant="flat"
                                color={habit.type === 'good' ? "success" : "danger"}
                                className="font-bold uppercase italic tracking-tighter text-[8px] h-4"
                            >
                                {habit.type === 'good' ? 'Zaleta' : 'Wyzwanie'}
                            </Chip>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "flex items-center gap-1 font-black italic text-lg",
                        habit.type === 'good' ? "text-emerald-500" : "text-rose-500"
                    )}>
                        <Flame size={18} className={calculateStreak(habit) > 0 ? "fill-current" : ""} />
                        <span>{calculateStreak(habit)}</span>
                    </div>
                    <ChevronRight size={18} className="text-zinc-300" />
                </div>
            </CardBody>
        </Card>
    );

    const renderCalendar = () => {
        if (!selectedHabit) return null;
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <Button isIconOnly variant="light" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft size={24} />
                    </Button>
                    <h3 className="text-lg font-bold capitalize tracking-tighter italic uppercase text-zinc-900">
                        {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
                    </h3>
                    <Button isIconOnly variant="light" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight size={24} />
                    </Button>
                </div>

                <div className="bg-zinc-50 p-5 rounded-[2.5rem] border border-zinc-100 shadow-inner">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (
                            <div key={d} className="text-center text-[10px] text-zinc-400 font-bold uppercase italic tracking-tighter">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
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
                                        "aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative",
                                        isToday(day) && "ring-2 ring-blue-500 ring-offset-2 bg-white",
                                        !log && "bg-white text-zinc-300 hover:bg-zinc-100",
                                        log?.isSuccess && "bg-emerald-500 text-white shadow-lg",
                                        log?.isSuccess === false && "bg-rose-500 text-white shadow-lg",
                                        isFuture && "opacity-20 cursor-not-allowed"
                                    )}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-orange-500">
                            <Flame size={16} className="fill-current" />
                            <span className="text-[10px] font-bold uppercase italic tracking-tighter">Seria</span>
                        </div>
                        <div className="text-xl font-bold italic uppercase tracking-tighter">{calculateStreak(selectedHabit)} dni</div>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-blue-500">
                            <Zap size={16} className="fill-current" />
                            <span className="text-[10px] font-bold uppercase italic tracking-tighter">Wynik</span>
                        </div>
                        <div className="text-xl font-bold italic uppercase tracking-tighter">
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
            className="fixed inset-0 z-[100] bg-white flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        >
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-12 pb-6 border-b border-zinc-100 bg-zinc-50">
                <div className="flex items-center gap-4">
                    {selectedHabitId && (
                        <Button isIconOnly variant="flat" onClick={() => setSelectedHabitId(null)} className="rounded-xl">
                            <ChevronLeft size={24} />
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tighter italic uppercase text-zinc-900 leading-none">
                            {selectedHabitId ? selectedHabit?.name : (lang === 'pl' ? 'Nawyki' : 'Habits')}
                        </h1>
                    </div>
                </div>
                <Button isIconOnly variant="flat" onClick={onClose} className="rounded-xl">
                    <X size={24} />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {!selectedHabitId ? (
                    <div className="flex flex-col gap-8 pb-10">
                        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold italic uppercase tracking-tighter mb-6">Twój postęp 🔥</h3>
                                <div className="flex gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold opacity-70 uppercase italic tracking-tighter mb-1">Dobre</span>
                                        <span className="text-3xl font-bold">{goodHabits.length}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold opacity-70 uppercase italic tracking-tighter mb-1">Złe</span>
                                        <span className="text-3xl font-bold">{badHabits.length}</span>
                                    </div>
                                </div>
                            </div>
                            <Trophy className="absolute right-[-20px] bottom-[-20px] w-40 h-40 opacity-10 rotate-12" />
                        </div>

                        {goodHabits.length > 0 && (
                            <section className="flex flex-col gap-4">
                                <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase italic px-2">Zalety</h2>
                                <div className="flex flex-col gap-3">
                                    {goodHabits.map(habit => renderHabitCard(habit))}
                                </div>
                            </section>
                        )}

                        {badHabits.length > 0 && (
                            <section className="flex flex-col gap-4">
                                <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase italic px-2">Wyzwania</h2>
                                <div className="flex flex-col gap-3">
                                    {badHabits.map(habit => renderHabitCard(habit))}
                                </div>
                            </section>
                        )}

                        <Button
                            onClick={() => setIsAddingHabit(true)}
                            variant="flat"
                            className="w-full py-10 rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 font-bold uppercase italic tracking-tighter hover:bg-zinc-100"
                            startContent={<Plus size={24} />}
                        >
                            Dodaj nowy cel
                        </Button>
                    </div>
                ) : (
                    <div className="pb-10">
                        {renderCalendar()}
                        <div className="mt-8 flex justify-between items-center p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                             <div className="flex items-center gap-3 text-zinc-400 text-xs font-bold uppercase italic tracking-tighter">
                                 <Info size={18} />
                                 <span>Klikaj dni, aby zmieniać status</span>
                             </div>
                             <Button
                                isIconOnly
                                color="danger"
                                variant="flat"
                                onClick={() => {
                                    if(confirm('Usunąć?')) deleteHabitMutation.mutate(selectedHabitId!);
                                }}
                                className="rounded-xl"
                             >
                                <Trash2 size={20} />
                             </Button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isAddingHabit && (
                    <motion.div
                        className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-end justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAddingHabit(false)}
                    >
                        <motion.div
                            className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="app-handle !mt-0 !mb-6" />
                            <h2 className="text-xl font-bold italic uppercase tracking-tighter text-zinc-900 mb-8 text-center">Nowy cel</h2>

                            <Tabs
                                fullWidth
                                color="primary"
                                variant="solid"
                                selectedKey={newHabitType}
                                onSelectionChange={(key) => setNewHabitType(key as any)}
                                classNames={{
                                    tabList: "bg-zinc-100 rounded-2xl",
                                    tabContent: "font-bold uppercase italic tracking-tighter text-xs"
                                }}
                            >
                                <Tab key="good" title="Zaleta" />
                                <Tab key="bad" title="Wyzwanie" />
                            </Tabs>

                            <div className="grid grid-cols-3 gap-3 my-8">
                                {PREDEFINED_HABITS.filter(h => h.type === newHabitType).slice(0, 6).map(ph => (
                                    <button
                                        key={ph.name}
                                        onClick={() => addHabitMutation.mutate(ph)}
                                        className="aspect-square bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-100 transition-all group"
                                    >
                                        <span className="text-3xl group-hover:scale-125 transition-transform">{ph.icon}</span>
                                        <span className="text-[10px] font-bold italic tracking-tighter uppercase text-zinc-400">{ph.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    value={customHabitName}
                                    onValueChange={setCustomHabitName}
                                    placeholder="Własna nazwa..."
                                    variant="flat"
                                    classNames={{
                                        inputWrapper: "bg-zinc-100 rounded-2xl h-14"
                                    }}
                                />
                                <Button
                                    isIconOnly
                                    color="primary"
                                    onClick={() => addHabitMutation.mutate({ name: customHabitName, icon: newHabitType === 'good' ? '✨' : '🚫', type: newHabitType })}
                                    disabled={!customHabitName}
                                    className="w-14 h-14 rounded-2xl"
                                >
                                    <Plus size={28} strokeWidth={3} />
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HabitTrackerModal;
