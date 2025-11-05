import { useEffect } from 'react';
import { AccountRecord } from './types';

interface AccountDetailDialogProps {
    user: AccountRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onToggleStatus: (user: AccountRecord) => void;
}

export default function AccountDetailDialog({
    user,
    open,
    onOpenChange,
    onToggleStatus,
}: AccountDetailDialogProps) {
    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!open || !user) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-blue-900">
                        Account Details
                    </h2>
                    <p className="text-sm text-slate-500">
                        Informasi lengkap akun pengguna
                    </p>
                </div>
                <div className="space-y-4 py-2 text-sm">
                    <InfoRow label="User ID" value={user.employee_code} />
                    <InfoRow label="Nama" value={user.name} />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow
                        label="Role"
                        value={
                            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                                {user.role}
                            </span>
                        }
                    />
                    {user.division && (
                        <InfoRow label="Divisi" value={user.division} />
                    )}
                    <InfoRow
                        label="Status"
                        value={
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    user.status === 'Active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-slate-200 text-slate-700'
                                }`}
                            >
                                {user.status}
                            </span>
                        }
                    />
                    <InfoRow
                        label="Terdaftar"
                        value={user.registered_at ?? '-'}
                    />
                    <InfoRow
                        label="Login Terakhir"
                        value={user.last_login_at ?? '-'}
                    />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() => onToggleStatus(user)}
                    >
                        {user.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                        className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                        onClick={() => onOpenChange(false)}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-3 gap-2">
            <span className="text-slate-500">{label}</span>
            <span className="col-span-2 font-medium text-slate-900">
                {value ?? '-'}
            </span>
        </div>
    );
}
