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
import { useEffect, useRef, useState } from 'react';
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
        karyawan: number;
        external: number;
    };
    roleOptions: string[];
    statusOptions: string[];
    divisionOptions: string[];
    flash?: {
        success?: string;
        generated_password?: string;
    };
}>;

const defaultFilterValue = (value?: string | null) =>
    value && value.length > 0 ? value : 'all';

export default function Index(props: IndexPageProps) {
    const {
        users,
        filters,
        stats,
        roleOptions,
        statusOptions,
        flash,
    } = props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(
        defaultFilterValue(filters.role),
    );
    const [statusFilter, setStatusFilter] = useState(
        defaultFilterValue(filters.status),
    );
    const [selectedUser, setSelectedUser] = useState<AccountRecord | null>(
        null,
    );
    const [detailOpen, setDetailOpen] = useState(false);
    const filterTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const firstRender = useRef(true);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.generated_password) {
            toast.info(`Password baru: ${flash.generated_password}`);
        }
    }, [flash?.success, flash?.generated_password]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (filterTimeout.current) {
            clearTimeout(filterTimeout.current);
        }

        filterTimeout.current = setTimeout(() => {
            router.get(
                route('super-admin.accounts.index'),
                {
                    search: search || undefined,
                    role: roleFilter !== 'all' ? roleFilter : undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                },
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        }, 400);

        return () => {
            if (filterTimeout.current) {
                clearTimeout(filterTimeout.current);
            }
        };
    }, [search, roleFilter, statusFilter]);

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

    const handleResetPassword = (user: AccountRecord) => {
        router.post(
            route('super-admin.accounts.reset-password', user.id),
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
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-900 px-5 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                    Tambah Akun
                </Link>
            }
        >
            <Head title="Kelola Akun" />

            <AccountStats stats={stats} />

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-blue-900">
                        Daftar Akun Pengguna
                    </h3>
                    <p className="text-sm text-slate-500">
                        Pantau status akun, role, dan divisi pengguna sistem
                    </p>
                </div>
                <div className="space-y-6">
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
                        users={users.data}
                        links={users.links}
                        onView={openDetail}
                        onEdit={(user) =>
                            router.visit(
                                route('super-admin.accounts.edit', user.id),
                            )
                        }
                        onResetPassword={handleResetPassword}
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
