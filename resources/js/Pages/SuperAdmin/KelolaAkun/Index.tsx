import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import AccountDetailDialog from '@/Pages/SuperAdmin/components/accounts/AccountDetailDialog';
import AccountFilters from '@/Pages/SuperAdmin/components/accounts/AccountFilters';
import AccountStats from '@/Pages/SuperAdmin/components/accounts/AccountStats';
import AccountTable from '@/Pages/SuperAdmin/components/accounts/AccountTable';
import {
    AccountRecord,
    PaginatedAccounts,
} from '@/Pages/SuperAdmin/components/accounts/types';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type IndexPageProps = PageProps<{
    users: PaginatedAccounts;
    filters: {
        search?: string | null;
        role?: string | null;
        status?: string | null;
    };
    stats: {
        total: number;
        super_admin: number;
        admin: number;
        staff: number;
        pelamar: number;
    };
    roleOptions: string[];
    statusOptions: string[];
    divisionOptions: string[];
    flash?: {
        success?: string;
    };
}>;



interface UserLoggedInPayload {
    id: number;
    last_login_at: string | null;
}

export default function Index(props: IndexPageProps) {
    const {
        users,
        filters,
        stats,
        roleOptions,
        statusOptions,
        flash,
    } = props;

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [allUsers, setAllUsers] = useState(users.data);
    const [paginationLinks, setPaginationLinks] = useState(users.links);
    const [selectedUser, setSelectedUser] = useState<AccountRecord | null>(
        null,
    );
    const [detailOpen, setDetailOpen] = useState(false);
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    // Client-side filtering - no server request, no URL change
    const accountRows = useMemo(() => {
        let filtered = allUsers;

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.id.toString().includes(searchLower) ||
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower),
            );
        }

        // Filter by role
        if (roleFilter !== 'all') {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter((user) => user.status === statusFilter);
        }

        return filtered;
    }, [allUsers, search, roleFilter, statusFilter]);

    useEffect(() => {
        setAllUsers(users.data);
        setPaginationLinks(users.links);
    }, [users.data, users.links]);

    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const channel = window.Echo.private('super-admin.accounts');

        const handleUserLoggedIn = (payload: UserLoggedInPayload) => {
            setAllUsers((current) =>
                current.map((account) =>
                    account.id === payload.id
                        ? { ...account, last_login_at: payload.last_login_at }
                        : account,
                ),
            );

            setSelectedUser((current) =>
                current && current.id === payload.id
                    ? { ...current, last_login_at: payload.last_login_at }
                    : current,
            );
        };

        channel.listen('UserLoggedIn', handleUserLoggedIn);

        return () => {
            channel.stopListening('UserLoggedIn');
            window.Echo?.leave('super-admin.accounts');
        };
    }, []);

    useEffect(() => {
        if (!selectedUser) {
            return;
        }

        const latestSelected = allUsers.find(
            (account) => account.id === selectedUser.id,
        );

        if (
            latestSelected &&
            latestSelected.last_login_at !== selectedUser.last_login_at
        ) {
            setSelectedUser(latestSelected);
        }
    }, [accountRows, selectedUser]);

    const openDetail = (user: AccountRecord) => {
        setSelectedUser(user);
        setDetailOpen(true);
    };

    const handleToggleStatus = (user: AccountRecord) => {
        router.post(
            route('super-admin.accounts.toggle-status', user.id),
            {},
            { preserveScroll: true },
        );
    };


    const handleDelete = (user: AccountRecord) => {
        router.delete(route('super-admin.accounts.destroy', user.id), {
            preserveScroll: true,
        });
    };

    return (
        <SuperAdminLayout
            title="Account Management"
            description="Kelola akun pengguna sistem LDP HRIS"
            breadcrumbs={[
                { label: 'Super Admin', href: route('super-admin.dashboard') },
                { label: 'Kelola Akun' },
            ]}
            actions={
                <Link
                    href={route('super-admin.accounts.create')}
                    className="inline-flex h-10 md:h-11 items-center justify-center rounded-lg bg-blue-900 px-4 md:px-5 text-xs md:text-sm font-semibold text-white transition hover:bg-blue-800 w-full md:w-auto"
                >
                    Tambah Akun
                </Link>
            }
        >
            <Head title="Kelola Akun" />

            <AccountStats stats={stats} />

            <div className="rounded-xl md:rounded-2xl border bg-white p-3 md:p-6 shadow-sm">
                <div className="mb-3 md:mb-6">
                    <h3 className="text-sm md:text-xl font-semibold text-blue-900">
                        Daftar Akun Pengguna
                    </h3>
                    <p className="text-[10px] md:text-sm text-slate-500">
                        Pantau status akun, role, dan divisi pengguna sistem
                    </p>
                </div>
                <div className="space-y-3 md:space-y-6">
                    <AccountFilters
                        search={search}
                        role={roleFilter}
                        status={statusFilter}
                        onSearchChange={setSearch}
                        onRoleChange={setRoleFilter}
                        onStatusChange={setStatusFilter}
                        roleOptions={roleOptions}
                        statusOptions={statusOptions}
                    />

                    <AccountTable
                        users={accountRows}
                        links={paginationLinks}
                        onView={openDetail}
                        onEdit={(user) =>
                            router.visit(
                                route('super-admin.accounts.edit', user.id),
                            )
                        }
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <AccountDetailDialog
                user={selectedUser}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onToggleStatus={handleToggleStatus}
            />
        </SuperAdminLayout>
    );
}
