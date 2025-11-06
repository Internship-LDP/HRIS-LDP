import { Card } from '@/Components/ui/card';
import { CheckCircle, Clock, FileText, UserMinus } from 'lucide-react';

interface StatsCardsProps {
    stats: {
        newRequests: number;
        inProcess: number;
        completedThisMonth: number;
        archived: number;
    };
}

const items = [
    {
        key: 'newRequests',
        label: 'Pengajuan Baru',
        icon: UserMinus,
        color: 'bg-blue-500',
    },
    {
        key: 'inProcess',
        label: 'Dalam Proses',
        icon: Clock,
        color: 'bg-orange-500',
    },
    {
        key: 'completedThisMonth',
        label: 'Selesai (Bulan Ini)',
        icon: CheckCircle,
        color: 'bg-green-500',
    },
    {
        key: 'archived',
        label: 'Arsip Nonaktif',
        icon: FileText,
        color: 'bg-purple-500',
    },
] as const;

export default function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => {
                const Icon = item.icon;
                const value = stats[item.key] ?? 0;
                return (
                    <Card key={item.key} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`rounded-lg p-3 text-white ${item.color}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{item.label}</p>
                                <p className="text-2xl font-semibold text-blue-900">
                                    {value}
                                </p>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
