import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import AdminStaffLayout from '@/Pages/AdminStaff/Layout';
import type { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { CheckCircle, Clock, FileText, Mail } from 'lucide-react';
import type { ReactNode } from 'react';

interface DashboardPageProps extends Record<string, unknown> {
    stats: {
        inbox: number;
        activeTasks: number;
        completedTasks: number;
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
    recentTasks: Array<{
        task: string;
        deadline: string;
        status: 'pending' | 'in-progress' | 'done';
    }>;
    announcements: Array<{
        title: string;
        date: string;
    }>;
}

const statusLabel = {
    pending: {
        label: 'Pending',
        style: 'border-orange-500 text-orange-500',
    },
    'in-progress': {
        label: 'In Progress',
        style: 'border-blue-500 text-blue-500',
    },
    done: {
        label: 'Selesai',
        style: 'border-green-500 text-green-500',
    },
} as const;

export default function AdminStaffDashboard() {
    const {
        props: { stats, incomingMails, recentTasks, announcements },
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
                    label="Tugas Aktif"
                    value={stats.activeTasks}
                    icon={<Clock className="h-5 w-5 text-orange-600" />}
                    color="bg-orange-50"
                />
                <StatCard
                    label="Tugas Selesai"
                    value={stats.completedTasks}
                    icon={<CheckCircle className="h-5 w-5 text-green-600" />}
                    color="bg-green-50"
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
                    <h3 className="mb-4 text-lg font-semibold text-blue-900">
                        Tugas & Aktivitas
                    </h3>
                    <div className="space-y-3">
                        {recentTasks.length === 0 ? (
                            <EmptyState message="Belum ada tugas terbaru." />
                        ) : (
                            recentTasks.map((task, index) => (
                                <div key={index} className="rounded-lg bg-slate-50 p-4">
                                    <div className="flex items-start justify-between">
                                        <p className="font-medium text-slate-900">
                                            {task.task}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className={statusLabel[task.status].style}
                                        >
                                            {statusLabel[task.status].label}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                        <Clock className="h-4 w-4" />
                                        <span>Deadline: {task.deadline}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
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
