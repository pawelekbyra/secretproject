"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Trash2,
    MoreVertical,
    Shield,
    User as UserIcon,
    Loader2,
    ChevronLeft,
    ChevronRight,
    BadgeCheck,
    AlertCircle
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getUsers, deleteUser, updateUserRole } from '@/lib/admin-actions';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

// Helper for debouncing
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function UserManagementTable() {
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const debouncedSearch = useDebounce(searchTerm, 500);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, roleFilter]);

    // Data Fetching
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-users', page, debouncedSearch, roleFilter],
        queryFn: async () => {
            const res = await getUsers(page, 10, debouncedSearch, roleFilter);
            if (!res.success) throw new Error(res.message);
            return res;
        }
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: (res) => {
            if (res.success) {
                addToast(res.message || 'Użytkownik usunięty', 'success');
                queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            } else {
                addToast(res.message || 'Błąd', 'error');
            }
        },
        onError: (err: any) => {
            addToast(err.message, 'error');
        }
    });

    const roleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: string }) => updateUserRole(userId, role),
        onSuccess: (res) => {
            if (res.success) {
                addToast(res.message || 'Rola zmieniona', 'success');
                queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            } else {
                addToast(res.message || 'Błąd', 'error');
            }
        },
        onError: (err: any) => {
            addToast(err.message, 'error');
        }
    });

    const handleDelete = async (userId: string) => {
        if (confirm('Czy na pewno chcesz usunąć tego użytkownika? Tej operacji nie można cofnąć.')) {
            deleteMutation.mutate(userId);
        }
    };

    const handleRoleChange = (userId: string, newRole: string) => {
        roleMutation.mutate({ userId, role: newRole });
    };

    const roles = [
        { value: 'all', label: 'Wszystkie role' },
        { value: 'user', label: 'Użytkownik' },
        { value: 'patron', label: 'Patron' },
        { value: 'author', label: 'Twórca' },
        { value: 'admin', label: 'Admin' },
    ];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-5 rounded-[2rem] border border-black/5 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                    <input
                        type="text"
                        placeholder="Szukaj po emailu, nazwie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary border border-black/5 rounded-2xl pl-12 pr-4 py-3 text-foreground font-medium placeholder:text-foreground/20 focus:outline-none focus:border-primary/30 focus:bg-white transition-all shadow-inner focus:shadow-xl"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                    {roles.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => setRoleFilter(r.value)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                                roleFilter === r.value
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-secondary border-black/5 text-foreground/30 hover:text-foreground hover:bg-black/5"
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-black/5 overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-24 flex flex-col items-center justify-center text-foreground/20">
                        <Loader2 size={40} className="animate-spin mb-4 text-primary" />
                        <p className="font-bold italic">Ładowanie użytkowników...</p>
                    </div>
                ) : isError ? (
                    <div className="p-24 flex flex-col items-center justify-center text-rose-500">
                        <AlertCircle size={40} className="mb-4" />
                        <p className="font-bold italic">Wystąpił błąd podczas pobierania danych.</p>
                    </div>
                ) : (data?.users || []).length === 0 ? (
                    <div className="p-24 text-center text-foreground/20 font-bold italic">
                        Brak użytkowników spełniających kryteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/50 text-[10px] uppercase text-foreground/30 font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Użytkownik</th>
                                    <th className="px-8 py-5">Rola</th>
                                    <th className="px-8 py-5">Dołączył</th>
                                    <th className="px-8 py-5 text-right">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {(data?.users || []).map((user: any) => (
                                    <tr key={user.id} className="hover:bg-secondary/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden relative border-2 border-white shadow-md flex-shrink-0 group-hover:scale-110 transition-transform">
                                                    {user.avatar ? (
                                                        <Image
                                                            src={user.avatar}
                                                            alt={user.username}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full h-full text-white/30">
                                                            <UserIcon size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-foreground italic tracking-tight">{user.displayName || user.username}</div>
                                                    <div className="text-xs font-bold text-foreground/30">{user.email}</div>
                                                    <div className="text-[9px] text-foreground/10 font-mono mt-1 uppercase">{user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                                user.role === 'admin' ? "bg-rose-50 text-rose-500 border-rose-100" :
                                                user.role === 'author' ? "bg-primary/5 text-primary border-primary/20" :
                                                user.role === 'patron' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-secondary text-foreground/40 border-black/5"
                                            )}>
                                                {user.role}
                                                {user.role === 'author' && <BadgeCheck size={12} className="ml-1" />}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-black text-foreground/40 italic">
                                            {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 text-foreground/20 hover:text-foreground hover:bg-black/5 rounded-xl transition-all">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white border-black/5 text-foreground min-w-[180px] rounded-2xl shadow-2xl p-1">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-3 py-2">Zarządzaj</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-black/5" />
                                                    <DropdownMenuItem
                                                        onClick={() => handleRoleChange(user.id, 'user')}
                                                        className="hover:bg-secondary cursor-pointer text-xs font-bold rounded-xl px-3 py-2"
                                                    >
                                                        Ustaw jako: User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleRoleChange(user.id, 'patron')}
                                                        className="hover:bg-secondary cursor-pointer text-xs font-bold rounded-xl px-3 py-2"
                                                    >
                                                        Ustaw jako: Patron
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleRoleChange(user.id, 'author')}
                                                        className="hover:bg-secondary cursor-pointer text-xs font-bold rounded-xl px-3 py-2"
                                                    >
                                                        Ustaw jako: Twórca
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleRoleChange(user.id, 'admin')}
                                                        className="text-rose-500 hover:bg-rose-50 cursor-pointer text-xs font-black rounded-xl px-3 py-2"
                                                    >
                                                        Ustaw jako: Admin
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-black/5" />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-rose-600 font-black hover:bg-rose-50 cursor-pointer rounded-xl px-3 py-2"
                                                    >
                                                        <Trash2 size={14} className="mr-2" />
                                                        Usuń konto
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {data && (data.pages || 0) > 1 && (
                <div className="flex items-center justify-center gap-6 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-black/5 hover:bg-secondary text-foreground disabled:opacity-30 transition-all shadow-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest text-foreground/40">
                        Strona {page} / {data.pages || 1}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(data.pages || 1, p + 1))}
                        disabled={page === (data.pages || 1)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-black/5 hover:bg-secondary text-foreground disabled:opacity-30 transition-all shadow-sm"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}
