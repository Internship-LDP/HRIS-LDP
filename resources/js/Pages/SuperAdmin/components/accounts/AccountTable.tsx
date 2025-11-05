import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';
import { Edit, Eye, KeyRound, ToggleLeft, Trash2 } from 'lucide-react';
import { AccountRecord, PaginationLink } from './types';

interface AccountTableProps {
    users: AccountRecord[];
    links: PaginationLink[];
    onView: (user: AccountRecord) => void;
    onEdit: (user: AccountRecord) => void;
    onResetPassword: (user: AccountRecord) => void;
    onToggleStatus: (user: AccountRecord) => void;
    onDelete: (user: AccountRecord) => void;
}

export default function AccountTable({
    users,
    links,
    onView,
    onEdit,
    onResetPassword,
    onToggleStatus,
    onDelete,
}: AccountTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                        <th className="px-4 py-3">User ID</th>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Divisi</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Login Terakhir</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.length === 0 && (
                        <tr>
                            <td
                                colSpan={8}
                                className="px-4 py-10 text-center text-slate-500"
                            >
                                Tidak ada data pengguna.
                            </td>
                        </tr>
                    )}
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/60">
                            <td className="px-4 py-3 font-medium">
                                {user.employee_code ?? '-'}
                            </td>
                            <td className="px-4 py-3">{user.name}</td>
                            <td className="px-4 py-3">{user.email}</td>
                            <td className="px-4 py-3">
                                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-4 py-3">{user.division ?? '-'}</td>
                            <td className="px-4 py-3">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        user.status === 'Active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-200 text-slate-600'
                                    }`}
                                >
                                    {user.status}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                {user.last_login_at ?? '-'}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                    <IconButton
                                        label="Detail"
                                        onClick={() => onView(user)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </IconButton>
                                    <IconButton
                                        label="Edit"
                                        onClick={() => onEdit(user)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </IconButton>
                                    <IconButton
                                        label="Reset Password"
                                        onClick={() => onResetPassword(user)}
                                    >
                                        <KeyRound className="h-4 w-4" />
                                    </IconButton>
                                    <IconButton
                                        label="Ubah Status"
                                        onClick={() => onToggleStatus(user)}
                                    >
                                        <ToggleLeft className="h-4 w-4" />
                                    </IconButton>
                                    <IconButton
                                        label="Hapus"
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    `Hapus akun ${user.name}?`,
                                                )
                                            ) {
                                                onDelete(user);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </IconButton>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {links.length > 1 && (
                <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
                    <span className="text-slate-500">
                        Menampilkan {users.length} pengguna
                    </span>
                    <div className="flex gap-2">
                        {links.map((link, index) => (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url ?? '#'}
                                aria-disabled={!link.url}
                                onClick={(event) => {
                                    if (!link.url) {
                                        event.preventDefault();
                                    }
                                }}
                                className={`rounded px-3 py-1 ${
                                    link.active
                                        ? 'bg-blue-900 text-white'
                                        : link.url
                                          ? 'text-blue-900 hover:bg-blue-50'
                                          : 'text-slate-400'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function IconButton({
    children,
    onClick,
    label,
}: {
    children: ReactNode;
    onClick: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-900"
        >
            {children}
        </button>
    );
}
