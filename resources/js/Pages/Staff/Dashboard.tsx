import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, Briefcase, FileText, MessageSquare } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import StaffLayout from '@/Pages/Staff/components/Layout';
import StatsCard from '@/Pages/Staff/components/StatsCard';
import type { PageProps } from '@/types';

interface DashboardStats {
    label: string;
    value: number;
    icon: 'alert' | 'message' | 'file' | 'briefcase';
}

interface ComplaintRecord {
    id: number;
    subject: string;
    status: string;
    priority: string;
    date: string;
}

interface RegulationRecord {
    id: number;
    title: string;
    category: string;
    date: string;
    attachmentUrl?: string | null;
}

interface TerminationSummary {
    reference: string;
    status: string;
    progress: number | null;
    requestDate: string;
    effectiveDate: string;
}

interface DashboardPageProps extends Record<string, unknown> {
    stats: DashboardStats[];
    recentComplaints: ComplaintRecord[];
    regulations: RegulationRecord[];
    termination: {
        active: TerminationSummary | null;
        history: TerminationSummary[];
    };
}

const iconMap: Record<DashboardStats['icon'], JSX.Element> = {
    alert: <AlertCircle className="h-4 w-4 text-blue-900" />,
    message: <MessageSquare className="h-4 w-4 text-blue-900" />,
    file: <FileText className="h-4 w-4 text-blue-900" />,
    briefcase: <Briefcase className="h-4 w-4 text-blue-900" />,
};

export default function StaffDashboard() {
    const {
        props: { stats, recentComplaints, regulations, termination },
    } = usePage<PageProps<DashboardPageProps>>();

    return (
        <>
            <Head title="Dashboard Staff" />
            <StaffLayout
                title="Dashboard Staff"
                description="Pantau status keluhan, dokumen terbaru, dan proses resign Anda."
            >
                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((item) => (
                        <StatsCard
                            key={item.label}
                            label={item.label}
                            value={item.value}
                            icon={iconMap[item.icon]}
                        />
                    ))}
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-blue-900">
                                    Keluhan Terbaru
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Update status pengaduan yang Anda kirim
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            {recentComplaints.length === 0 && (
                                <p className="text-sm text-slate-500">
                                    Belum ada keluhan yang diajukan.
                                </p>
                            )}
                            {recentComplaints.map((complaint) => (
                                <div
                                    key={complaint.id}
                                    className="flex items-start justify-between rounded-lg border border-slate-200 p-3"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {complaint.subject}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {complaint.date}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1 text-right">
                                        <StatusBadge status={complaint.status} />
                                        <PriorityBadge priority={complaint.priority} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-blue-900">
                            Regulasi dan Dokumen
                        </h2>
                        <p className="text-sm text-slate-500">
                            Dokumen terbaru yang dibagikan ke divisi Anda
                        </p>
                        <div className="mt-4 space-y-3">
                            {regulations.length === 0 && (
                                <p className="text-sm text-slate-500">
                                    Belum ada regulasi terbaru.
                                </p>
                            )}
                            {regulations.map((item) => (
                                <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                                    <p className="font-semibold text-slate-900">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {item.category} • {item.date}
                                    </p>
                                    {item.attachmentUrl && (
                                        <a
                                            href={item.attachmentUrl}
                                            className="mt-2 inline-flex text-xs font-semibold text-blue-900 hover:underline"
                                        >
                                            Lihat Dokumen
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>

                <Card className="p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-blue-900">
                                Status Pengajuan Resign
                            </h2>
                            <p className="text-sm text-slate-500">
                                Lihat progres pengajuan resign dan riwayat Anda
                            </p>
                        </div>
                    </div>

                    {termination.active ? (
                        <div className="mt-4 rounded-lg border border-slate-200 p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Referensi
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {termination.active.reference}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Status
                                    </p>
                                    <StatusBadge status={termination.active.status} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Progress
                                    </p>
                                    <Progress
                                        value={termination.active.progress ?? 0}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Efektif
                                    </p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {termination.active.effectiveDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-slate-500">
                            Belum ada pengajuan resign aktif.
                        </p>
                    )}

                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-slate-700">
                            Riwayat Pengajuan
                        </h3>
                        <div className="mt-3 space-y-2">
                            {termination.history.length === 0 && (
                                <p className="text-sm text-slate-500">
                                    Belum ada riwayat pengajuan.
                                </p>
                            )}
                            {termination.history.map((item) => (
                                <div
                                    key={`${item.reference}-${item.requestDate}`}
                                    className="flex flex-wrap items-center justify-between rounded-lg border border-slate-200 p-3 text-sm"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {item.reference}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Diajukan: {item.requestDate}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={item.status} />
                                        <p className="text-xs text-slate-500">
                                            Efektif: {item.effectiveDate}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </StaffLayout>
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();

    if (normalized.includes('selesai')) {
        return (
            <Badge variant="outline" className="border-green-500 text-green-600">
                {status}
            </Badge>
        );
    }

    if (normalized.includes('proses') || normalized.includes('menunggu')) {
        return (
            <Badge variant="outline" className="border-amber-500 text-amber-600">
                {status}
            </Badge>
        );
    }

    return <Badge variant="outline">{status}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
    const normalized = priority.toLowerCase();

    if (normalized.includes('tinggi') || normalized === 'high') {
        return <Badge className="bg-red-500 text-white">Prioritas Tinggi</Badge>;
    }

    if (normalized.includes('sedang') || normalized === 'medium') {
        return (
            <Badge className="bg-orange-500 text-white">Prioritas Sedang</Badge>
        );
    }

    return <Badge className="bg-blue-500 text-white">Prioritas Rendah</Badge>;
}
