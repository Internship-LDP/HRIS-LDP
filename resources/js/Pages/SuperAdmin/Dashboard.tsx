import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import { Head } from '@inertiajs/react';
import {
    Activity,
    Settings,
    Shield,
    TrendingDown,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell,
} from 'recharts';

interface DashboardProps {
    stats: Record<'totalUsers' | 'superAdmins' | 'admins' | 'staff' | 'pelamar', number>;
    statChanges: Record<'totalUsers' | 'superAdmins' | 'admins' | 'staff' | 'pelamar', number>;
    userDistribution: { name: string; value: number; color: string }[];
    activityData: { month: string; registrations: number; applications: number }[];
}

export default function Dashboard({ stats, statChanges, userDistribution, activityData }: DashboardProps) {
    type StatKey = keyof DashboardProps['stats'];

    const statConfig: Array<{
        key: StatKey;
        label: string;
        icon: typeof Users;
        color: string;
    }> = [
        {
            key: 'totalUsers',
            label: 'Total Users',
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            key: 'superAdmins',
            label: 'Super Admin',
            icon: Shield,
            color: 'bg-purple-500',
        },
        {
            key: 'admins',
            label: 'Admin Accounts',
            icon: Settings,
            color: 'bg-indigo-500',
        },
        {
            key: 'staff',
            label: 'Staff',
            icon: Activity,
            color: 'bg-emerald-500',
        },
        {
            key: 'pelamar',
            label: 'Pelamar',
            icon: UserPlus,
            color: 'bg-orange-500',
        },
    ];

    const statCards = statConfig.map((config) => {
        const value = stats?.[config.key] ?? 0;
        const changeValue = statChanges?.[config.key] ?? 0;
        const trend = changeValue >= 0 ? 'up' : 'down';

        return {
            ...config,
            value: value.toString(),
            change: `${changeValue >= 0 ? '+' : ''}${changeValue}`,
            trend,
        };
    });

    return (
        <SuperAdminLayout
            title="Super Admin Dashboard"
            description="Full system control and monitoring - PT. Lintas Data Prima HRIS"
            breadcrumbs={[
                { label: 'Super Admin', href: route('super-admin.dashboard') },
                { label: 'Dashboard' },
            ]}
        >
            <Head title="Super Admin Dashboard" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`${stat.color} rounded-xl p-3`}>
                                <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            {stat.trend === 'up' ? (
                                <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-red-500" />
                            )}
                        </div>
                        <p className="mt-4 text-sm text-slate-500">
                            {stat.label}
                        </p>
                        <div className="mt-2 flex items-end gap-2">
                            <span className="text-2xl font-semibold text-blue-900">
                                {stat.value}
                            </span>
                            <span
                                className={`text-sm ${
                                    stat.trend === 'up'
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}
                            >
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-blue-900">
                        Distribusi Pengguna
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={userDistribution}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label={({ name, value }) =>
                                    `${name}: ${value}`
                                }
                            >
                                {userDistribution.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-blue-900">
                        Tren Registrasi & Lamaran
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="registrations"
                                stroke="#0ea5e9"
                                name="Registrasi"
                            />
                            <Line
                                type="monotone"
                                dataKey="applications"
                                stroke="#6366f1"
                                name="Lamaran"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </SuperAdminLayout>
    );
}
