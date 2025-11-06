import { Card } from '@/Components/ui/card';
import { AlertCircle, CheckCircle2, ClipboardList, RefreshCw } from 'lucide-react';

interface ComplaintStatsProps {
    stats: {
        total: number;
        new: number;
        in_progress: number;
        resolved: number;
    };
}

export default function ComplaintStats({ stats }: ComplaintStatsProps) {
    const items = [
        {
            label: 'Pengaduan Baru',
            value: stats.new,
            icon: AlertCircle,
            accent: 'bg-blue-500',
        },
        {
            label: 'Sedang Ditangani',
            value: stats.in_progress,
            icon: RefreshCw,
            accent: 'bg-amber-500',
        },
        {
            label: 'Selesai Bulan Ini',
            value: stats.resolved,
            icon: CheckCircle2,
            accent: 'bg-emerald-500',
        },
        {
            label: 'Total Pengaduan',
            value: stats.total,
            icon: ClipboardList,
            accent: 'bg-indigo-500',
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <Card key={item.label} className="p-6">
                        <div className="flex items-center gap-4">
                            <span
                                className={`inline-flex h-12 w-12 items-center justify-center rounded-lg text-white ${item.accent}`}
                            >
                                <Icon className="h-6 w-6" />
                            </span>
                            <div>
                                <p className="text-sm text-slate-500">{item.label}</p>
                                <p className="text-2xl font-semibold text-blue-900">
                                    {Intl.NumberFormat('id-ID').format(item.value)}
                                </p>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

