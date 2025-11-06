import { Card } from '@/Components/ui/card';
import { cn } from '@/lib/utils';
import { Archive, Inbox, Mail, Send } from 'lucide-react';

interface StatsCardsProps {
    stats: {
        inbox: number;
        outbox: number;
        pending: number;
        archived: number;
    };
}

const STAT_META = [
    {
        key: 'inbox',
        label: 'Surat Masuk',
        icon: Inbox,
        bg: 'bg-blue-500',
    },
    {
        key: 'outbox',
        label: 'Surat Keluar',
        icon: Send,
        bg: 'bg-green-500',
    },
    {
        key: 'pending',
        label: 'Perlu Diproses',
        icon: Mail,
        bg: 'bg-orange-500',
    },
    {
        key: 'archived',
        label: 'Arsip',
        icon: Archive,
        bg: 'bg-purple-500',
    },
] as const;

export default function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {STAT_META.map((item) => {
                const Icon = item.icon;
                return (
                    <Card key={item.key} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={cn('rounded-lg p-3 text-white', item.bg)}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    {item.label}
                                </p>
                                <p className="text-2xl font-semibold text-blue-900">
                                    {stats[item.key] ?? 0}
                                </p>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
