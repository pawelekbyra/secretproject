"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Trash2,
    MoreVertical,
    User as UserIcon,
    Loader2,
    BadgeCheck,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { getUsers, deleteUser, updateUserRole } from '@/lib/admin-actions';
import { cn } from '@/lib/utils';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
    Chip,
    Pagination
} from "@heroui/react";

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

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, roleFilter]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-users', page, debouncedSearch, roleFilter],
        queryFn: async () => {
            const res = await getUsers(page, 10, debouncedSearch, roleFilter);
            if (!res.success) throw new Error(res.message);
            return res;
        }
    });

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
        onError: (err: any) => addToast(err.message, 'error')
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
        onError: (err: any) => addToast(err.message, 'error')
    });

    const handleDelete = async (userId: string) => {
        if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
            deleteMutation.mutate(userId);
        }
    };

    const handleRoleChange = (userId: string, newRole: string) => {
        roleMutation.mutate({ userId, role: newRole });
    };

    const roles = [
        { value: 'all', label: 'Wszystkie' },
        { value: 'user', label: 'User' },
        { value: 'patron', label: 'Patron' },
        { value: 'author', label: 'Twórca' },
        { value: 'admin', label: 'Admin' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <Input
                    placeholder="Szukaj..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    variant="flat"
                    className="max-w-xs"
                    startContent={<Search className="text-zinc-400" size={18} />}
                    classNames={{
                        inputWrapper: "bg-white border-zinc-200"
                    }}
                />
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                    {roles.map((r) => (
                        <Button
                            key={r.value}
                            onClick={() => setRoleFilter(r.value)}
                            variant={roleFilter === r.value ? "solid" : "flat"}
                            color={roleFilter === r.value ? "primary" : "default"}
                            size="sm"
                            className="font-bold uppercase italic tracking-tighter text-[10px]"
                        >
                            {r.label}
                        </Button>
                    ))}
                </div>
            </div>

            <Table
                aria-label="User management table"
                classNames={{
                    wrapper: "bg-white border border-zinc-100 shadow-sm rounded-2xl",
                    th: "bg-zinc-50 text-zinc-500 font-bold uppercase italic tracking-tighter text-[10px] h-12",
                    td: "py-3"
                }}
            >
                <TableHeader>
                    <TableColumn>Użytkownik</TableColumn>
                    <TableColumn>Rola</TableColumn>
                    <TableColumn>Dołączył</TableColumn>
                    <TableColumn align="end">Akcje</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={isLoading}
                    loadingContent={<Loader2 className="animate-spin text-primary" />}
                    emptyContent={isError ? "Błąd pobierania danych" : "Brak wyników"}
                >
                    {(data?.users || []).map((user: any) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={user.avatar}
                                        name={user.username}
                                        className="w-10 h-10 border-2 border-white shadow-sm"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-zinc-900">{user.displayName || user.username}</span>
                                        <span className="text-xs text-zinc-500">{user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    color={
                                        user.role === 'admin' ? "danger" :
                                        user.role === 'author' ? "warning" :
                                        user.role === 'patron' ? "secondary" : "primary"
                                    }
                                    className="font-bold uppercase italic tracking-tighter text-[10px]"
                                    startContent={user.role === 'author' && <BadgeCheck size={12} />}
                                >
                                    {user.role}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs text-zinc-500 font-medium">
                                    {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Dropdown placement="bottom-end">
                                    <DropdownTrigger>
                                        <Button isIconOnly variant="light" size="sm">
                                            <MoreVertical size={16} className="text-zinc-400" />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="User actions"
                                        classNames={{
                                            base: "bg-white",
                                            list: "font-bold uppercase italic tracking-tighter text-xs"
                                        }}
                                    >
                                        <DropdownItem key="user" onClick={() => handleRoleChange(user.id, 'user')}>Rola: User</DropdownItem>
                                        <DropdownItem key="patron" onClick={() => handleRoleChange(user.id, 'patron')}>Rola: Patron</DropdownItem>
                                        <DropdownItem key="author" onClick={() => handleRoleChange(user.id, 'author')}>Rola: Twórca</DropdownItem>
                                        <DropdownItem key="admin" color="danger" onClick={() => handleRoleChange(user.id, 'admin')}>Rola: Admin</DropdownItem>
                                        <DropdownItem
                                            key="delete"
                                            color="danger"
                                            className="text-danger"
                                            startContent={<Trash2 size={14} />}
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Usuń konto
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {data && data.pages !== undefined && data.pages > 1 && (
                <div className="flex justify-center pt-4">
                    <Pagination
                        total={data.pages}
                        page={page}
                        onChange={setPage}
                        color="primary"
                        variant="flat"
                        size="sm"
                    />
                </div>
            )}
        </div>
    );
}
