import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import { Head, Link } from '@inertiajs/react';
import { ReactNode } from 'react';
import {
    Activity,
    AlertCircle,
    Database,
    Settings,
    Shield,
    TrendingDown,
    TrendingUp,
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
    stats: {
        totalUsers: number;
        admins: number;
        superAdmins: number;
        staff: number;
        activeSessions: number;
        pendingIssues: number;
        systemModules: number;
    };
    userDistribution: { name: string; value: number; color: string }[];
    activityData: { month: string; logins: number; actions: number }[];
    recentSystemActivities: {
        title: string;
        desc: string;
        time: string;
        type: 'success' | 'warning' | 'info' | 'danger';
    }[];
    systemHealth: { name: string; status: string; value: number }[];
}

export default function Dashboard({
    stats,
    userDistribution,
    activityData,
    recentSystemActivities,
    systemHealth,
}: DashboardProps) {
    const statCards = [
        {
            label: 'Total Users',
            value: stats.totalUsers.toString(),
            change: '+18',
            icon: Users,
            color: 'bg-blue-500',
            trend: 'up',
        },
        {
            label: 'Admin Accounts',
            value: stats.admins.toString(),
            change: '+2',
            icon: Shield,
            color: 'bg-purple-500',
            trend: 'up',
        },
        {
            label: 'System Modules',
            value: stats.systemModules.toString(),
            change: '0',
            icon: Database,
            color: 'bg-green-500',
            trend: 'up',
        },
        {
            label: 'Active Sessions',
            value: stats.activeSessions.toString(),
            change: '+23',
            icon: Activity,
            color: 'bg-orange-500',
            trend: 'up',
        },
        {
            label: 'Pending Issues',
            value: stats.pendingIssues.toString(),
            change: '-5',
            icon: AlertCircle,
            color: 'bg-red-500',
            trend: 'down',
        },
    ];

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
                        Aktivitas Sistem
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
                                dataKey="logins"
                                stroke="#3b82f6"
                                name="Logins"
                            />
                            <Line
                                type="monotone"
                                dataKey="actions"
                                stroke="#1e3a8a"
                                name="Actions"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-blue-900">
                        System Health
                    </h3>
                    <div className="space-y-4">
                        {systemHealth.map((item) => (
                            <div key={item.name}>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-medium text-slate-700">
                                        {item.name}
                                    </span>
                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                            item.status === 'Excellent'
                                                ? 'border-green-500 text-green-600'
                                                : item.status === 'Good'
                                                  ? 'border-blue-500 text-blue-600'
                                                  : 'border-orange-500 text-orange-500'
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-200">
                                    <div
                                        className={`h-2 rounded-full ${
                                            item.value >= 95
                                                ? 'bg-green-500'
                                                : item.value >= 85
                                                  ? 'bg-blue-500'
                                                  : 'bg-orange-500'
                                        }`}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-blue-900">
                        Aktivitas Sistem Terbaru
                    </h3>
                    <div className="space-y-4">
                        {recentSystemActivities.map((activity) => (
                            <div
                                key={activity.title + activity.time}
                                className="flex items-center gap-4 border-b pb-3 last:border-b-0"
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        activity.type === 'success'
                                            ? 'bg-green-500'
                                            : activity.type === 'warning'
                                              ? 'bg-orange-500'
                                              : activity.type === 'info'
                                                ? 'bg-blue-500'
                                                : 'bg-red-500'
                                    }`}
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900">
                                        {activity.title}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {activity.desc}
                                    </p>
                                </div>
                                <span className="text-xs text-slate-400">
                                    {activity.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="mb-4 text-lg font-semibold text-blue-900">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                    <LinkButton
                        href={route('super-admin.accounts.index')}
                        className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                        Manage Users
                    </LinkButton>
                    <ActionButton>Recruitment</ActionButton>
                    <ActionButton>Organization</ActionButton>
                    <ActionButton>Correspondence</ActionButton>
                    <ActionButton>Industrial Rel.</ActionButton>
                    <ActionButton className="bg-gray-600 hover:bg-gray-700">
                        System Settings
                    </ActionButton>
                </div>
            </div>
        </SuperAdminLayout>
    );
}

function ActionButton({
    children,
    className = 'bg-blue-900 hover:bg-blue-800',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <button
            type="button"
            className={`h-12 w-full rounded-xl text-sm font-semibold text-white transition ${className}`}
        >
            {children}
        </button>
    );
}

function LinkButton({
    href,
    children,
    className = 'bg-blue-900 hover:bg-blue-800',
}: {
    href: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={`flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition ${className}`}
        >
            {children}
        </Link>
    );
}
