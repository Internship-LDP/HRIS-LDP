interface AccountStatsProps {
    stats: {
        total: number;
        super_admin: number;
        admin: number;
        staff: number;
        karyawan: number;
        pelamar: number;
    };
}

const labels: { key: keyof AccountStatsProps['stats']; label: string }[] = [
    { key: 'total', label: 'Total Accounts' },
    { key: 'super_admin', label: 'Super Admin' },
    { key: 'admin', label: 'Admin' },
    { key: 'staff', label: 'Staff' },
    { key: 'karyawan', label: 'Karyawan' },
    { key: 'pelamar', label: 'Pelamar' },
];

export default function AccountStats({ stats }: AccountStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {labels.map((item) => (
                <div key={item.key} className="rounded-lg border bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-blue-900">{stats[item.key]}</p>
                </div>
            ))}
        </div>
    );
}
