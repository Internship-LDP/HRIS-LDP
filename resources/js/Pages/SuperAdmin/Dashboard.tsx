import { Badge } from '@/Components/ui/badge';
import { Card } from '@/Components/ui/card';
import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import { Head } from '@inertiajs/react';
import {
    Activity,
    GraduationCap,
    Settings,
    Shield,
    TrendingDown,
    TrendingUp,
    UserCheck,
    UserPlus,
    Users,
    UserX,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

interface DashboardProps {
    stats: Record<'totalUsers' | 'superAdmins' | 'admins' | 'staff' | 'pelamar', number>;
    statChanges: Record<'totalUsers' | 'superAdmins' | 'admins' | 'staff' | 'pelamar', number>;
    activityData: { month: string; registrations: number; applications: number }[];
    staffStats: { total: number; active: number; inactive: number };
    religionData: { name: string; value: number; color: string }[];
    genderData: { name: string; value: number; percentage: number; color: string }[];
    educationData: { level: string; value: number }[];
    divisionApplicants: Array<{
        id: string;
        name: string;
        count: number;
        new: number;
    }>;
}

export default function Dashboard({
    stats,
    statChanges,
    activityData,
    staffStats,
    religionData,
    genderData,
    educationData,
    divisionApplicants,
}: DashboardProps) {
    type StatKey = keyof DashboardProps['stats'];
    const formatNumber = (value: number) =>
        Intl.NumberFormat('id-ID').format(value ?? 0);
    const maleRatio = genderData.find((item) =>
        item.name.toLowerCase().includes('laki'),
    );
    const femaleRatio = genderData.find((item) =>
        item.name.toLowerCase().includes('perempuan'),
    );
    const genderRatioText =
        maleRatio && femaleRatio
            ? `Laki-laki : Perempuan = ${maleRatio.percentage}% : ${femaleRatio.percentage}%`
            : 'Data gender belum tersedia';

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

            <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900">Total Pendaftar per Divisi</h3>
                        <p className="text-sm text-slate-500">Monitoring jumlah pelamar berdasarkan divisi</p>
                    </div>
                </div>

                {divisionApplicants.length > 0 ? (
                    <Tabs defaultValue={divisionApplicants[0].id} className="w-full">
                        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-2 border border-slate-200 bg-white p-1">
                            {divisionApplicants.map((div) => (
                                <TabsTrigger
                                    key={div.id}
                                    value={div.id}
                                    className="px-4 py-2 data-[state=active]:bg-blue-900 data-[state=active]:text-white rounded-md transition-all"
                                >
                                    {div.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {divisionApplicants.map((div) => {
                            const week1 = Math.max(0, Math.floor(div.count * 0.2));
                            const week2 = Math.max(0, Math.floor(div.count * 0.25));
                            const week3 = Math.max(0, Math.floor(div.count * 0.3));
                            const remaining = Math.max(0, div.count - (week1 + week2 + week3));
                            const chartData = [
                                { name: 'Minggu 1', value: week1 },
                                { name: 'Minggu 2', value: week2 },
                                { name: 'Minggu 3', value: week3 },
                                { name: 'Minggu 4', value: remaining },
                            ];

                            return (
                                <TabsContent key={div.id} value={div.id} className="mt-0">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                        <Card className="md:col-span-1 border-l-4 border-blue-500 p-6 shadow-sm">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Total Pelamar</p>
                                                    <h2 className="mt-2 text-4xl font-bold text-blue-900">{formatNumber(div.count)}</h2>
                                                </div>
                                                <div className="rounded-lg bg-blue-50 p-3">
                                                    <Users className="h-6 w-6 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center text-sm">
                                                <div className="mr-2 rounded-full bg-green-100 p-1">
                                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                                </div>
                                                <span className="mr-1 text-base font-bold text-green-600">+{formatNumber(div.new)}</span>
                                                <span className="text-slate-500">pelamar baru bulan ini</span>
                                            </div>
                                        </Card>

                                        <Card className="md:col-span-2 flex flex-col justify-center p-6 shadow-sm">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h4 className="font-medium text-blue-900">Tren Pendaftaran - {div.name}</h4>
                                                <Badge variant="outline" className="border-blue-200 text-blue-600">
                                                    30 Hari Terakhir ({new Date().toLocaleDateString('id-ID', { month: 'long' })})
                                                </Badge>
                                            </div>
                                            <div className="h-[180px] w-full">
                                                <ResponsiveContainer width="100%" height="100%" debounce={300}>
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                        <Tooltip
                                                            cursor={{ fill: '#f3f4f6' }}
                                                            contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card>
                                    </div>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                ) : (
                    <p className="text-sm text-slate-500">Belum ada data pendaftar per divisi.</p>
                )}
            </section>

            <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-blue-900">
                            Statistik Staff
                        </h3>
                        <p className="text-sm text-slate-500">
                            Demografi dan distribusi staff PT. Lintas Data Prima
                        </p>
                    </div>
                    <Badge className="bg-blue-900 text-white">
                        <UserCheck className="h-3 w-3" />
                        <span className="text-xs font-medium">
                            {formatNumber(staffStats.total)} Total Staff
                        </span>
                    </Badge>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-green-500 p-3">
                                <UserCheck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Staff Aktif</p>
                                <p className="text-2xl font-semibold text-blue-900">
                                    {formatNumber(staffStats.active)}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-blue-500 p-3">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Staff</p>
                                <p className="text-2xl font-semibold text-blue-900">
                                    {formatNumber(staffStats.total)}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-red-500 p-3">
                                <UserX className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Staff Tidak Aktif</p>
                                <p className="text-2xl font-semibold text-blue-900">
                                    {formatNumber(staffStats.inactive)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="p-6">
                        <h3 className="mb-4 text-blue-900">Berdasarkan Agama</h3>
                        {religionData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200} debounce={300}>
                                    <PieChart>
                                        <Pie
                                            data={religionData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={70}
                                            dataKey="value"
                                        >
                                            {religionData.map((entry, index) => (
                                                <Cell
                                                    key={entry.name + index}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2 text-sm">
                                    {religionData.map((item, index) => (
                                        <div
                                            key={`${item.name}-${index}`}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="text-slate-700">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="font-medium text-slate-900">
                                                {formatNumber(item.value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Belum ada data agama staff yang tersedia.
                            </p>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-4 text-blue-900">Berdasarkan Jenis Kelamin</h3>
                        {genderData.length > 0 ? (
                            <>
                                <div className="space-y-6">
                                    {genderData.map((item, index) => (
                                        <div key={`${item.name}-${index}`}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-4 w-4 rounded"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="text-slate-900">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-900">
                                                        {formatNumber(item.value)}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs text-slate-600"
                                                    >
                                                        {item.percentage}%
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="h-3 w-full rounded-full bg-slate-200">
                                                <div
                                                    className="h-3 rounded-full transition-all"
                                                    style={{
                                                        width: `${item.percentage}%`,
                                                        backgroundColor: item.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                                    <p className="text-blue-900">Rasio Gender</p>
                                    <p className="mt-1 text-slate-600">
                                        {genderRatioText}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Belum ada data gender staff yang tersedia.
                            </p>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-4 text-blue-900">Berdasarkan Pendidikan</h3>
                        {educationData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200} debounce={300}>
                                    <BarChart data={educationData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="level" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#1e3a8a" />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="mt-4 space-y-2">
                                    {educationData.map((item, index) => (
                                        <div
                                            key={`${item.level}-${index}`}
                                            className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-blue-900" />
                                                <span className="text-slate-900">
                                                    {item.level}
                                                </span>
                                            </div>
                                            <Badge variant="outline">
                                                {formatNumber(item.value)} orang
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Belum ada data pendidikan staff yang tersedia.
                            </p>
                        )}
                    </Card>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-blue-900">
                        Tren Registrasi & Lamaran
                    </h3>
                    <ResponsiveContainer width="100%" height={280} debounce={300}>
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
