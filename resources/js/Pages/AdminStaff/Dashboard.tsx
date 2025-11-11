import { Card } from '@/Components/ui/card';
import AdminStaffLayout from '@/Pages/AdminStaff/Layout';
import type { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Clock, FileText, Mail, Send } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardPageProps extends Record<string, unknown> {
    stats: {
        inbox: number;
        outbox: number;
        pending: number;
    };
    incomingMails: Array<{
        id: number;
        from: string;
        sender: string;
        subject: string;
        date: string;
        status: string;
        hasAttachment: boolean;
    }>;
    outgoingMails: Array<{
        id: number;
        to: string;
        subject: string;
        date: string;
        status: string;
        hasAttachment: boolean;
    }>;
    announcements: Array<{
        title: string;
        date: string;
    }>;
}

export default function AdminStaffDashboard() {
    const {
        props: { stats, incomingMails, outgoingMails, announcements },
    } = usePage<PageProps<DashboardPageProps>>();

    return (
        <AdminStaffLayout
            title="Dashboard Staff"
            description="Ringkasan aktivitas Anda sebagai staff"
            breadcrumbs={[{ label: 'Dashboard' }]}
        >
            <Head title="Dashboard Staff" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatCard
                    label="Surat Masuk"
                    value={stats.inbox}
                    icon={<Mail className="h-5 w-5 text-blue-900" />}
                    color="bg-blue-50"
                />
                <StatCard
                    label="Surat Keluar"
                    value={stats.outbox}
                    icon={<Send className="h-5 w-5 text-emerald-700" />}
                    color="bg-emerald-50"
                />
                <StatCard
                    label="Perlu Diproses"
                    value={stats.pending}
                    icon={<Clock className="h-5 w-5 text-amber-600" />}
                    color="bg-amber-50"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-blue-900">
                            Surat Masuk
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {incomingMails.length === 0 ? (
                            <EmptyState message="Belum ada surat untuk Anda." />
                        ) : (
                            incomingMails.map((mail) => (
                                <div
                                    key={mail.id}
                                    className={`rounded-lg border p-4 ${
                                        mail.status === 'Diajukan'
                                            ? 'border-blue-200 bg-blue-50'
                                            : 'border-slate-200 bg-white'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {mail.subject}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {mail.from} &bull; {mail.sender}
                                            </p>
                                        </div>
                                        {mail.hasAttachment && (
                                            <Badge variant="secondary">Lampiran</Badge>
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                        <span>{mail.date}</span>
                                        <span>{mail.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-blue-900">
                            Surat Keluar Terbaru
                        </h3>
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                            {stats.outbox} total
                        </Badge>
                    </div>
                    {outgoingMails.length === 0 ? (
                        <EmptyState message="Belum ada surat keluar." />
                    ) : (
                        <div className="space-y-3">
                            {outgoingMails.map((mail) => (
                                <div key={mail.id} className="rounded-lg border border-slate-200 bg-white p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {mail.subject}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Kepada: {mail.to}
                                            </p>
                                        </div>
                                        {mail.hasAttachment && (
                                            <Badge variant="secondary">Lampiran</Badge>
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                        <span>{mail.date}</span>
                                        <span className="font-medium text-blue-900">
                                            {mail.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-blue-900">
                    Pengumuman HRD
                </h3>
                {announcements.length === 0 ? (
                    <EmptyState message="Belum ada pengumuman terbaru." />
                ) : (
                    <div className="space-y-3">
                        {announcements.map((announcement, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 rounded-lg bg-blue-50 p-4"
                            >
                                <FileText className="h-5 w-5 text-blue-900" />
                                <div>
                                    <p className="font-medium text-slate-900">
                                        {announcement.title}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {announcement.date}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </AdminStaffLayout>
    );
}

function StatCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: number;
    icon: ReactNode;
    color: string;
}) {
    return (
        <Card className="p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-lg p-3 ${color}`}>{icon}</div>
            </div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold text-blue-900">
                {Intl.NumberFormat('id-ID').format(value)}
            </p>
        </Card>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
            {message}
        </div>
    );
}
