import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    LayoutDashboard,
    Settings,
    Shield,
    Users,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

interface NavItem {
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    routeName: string;
    pattern: string | string[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        routeName: 'super-admin.dashboard',
        pattern: 'super-admin.dashboard',
    },
    {
        label: 'Kelola Akun',
        icon: Users,
        routeName: 'super-admin.accounts.index',
        pattern: 'super-admin.accounts.*',
    },
    {
        label: 'Keamanan',
        icon: Shield,
        routeName: 'super-admin.dashboard',
        pattern: [],
    },
    {
        label: 'Aktivitas',
        icon: Activity,
        routeName: 'super-admin.dashboard',
        pattern: [],
    },
    {
        label: 'Pengaturan',
        icon: Settings,
        routeName: 'super-admin.dashboard',
        pattern: [],
    },
];

export default function Sidebar() {
    const {
        props: { auth },
    } = usePage<PageProps>();
    const user = auth?.user;

    return (
        <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-blue-950 text-white shadow-lg">
            <div className="flex h-20 items-center justify-between px-6">
                <div>
                    <p className="text-xs uppercase tracking-widest text-blue-200">
                        PT. Lintas Data Prima
                    </p>
                    <p className="text-xl font-semibold">HRIS</p>
                </div>
            </div>
            <div className="px-6">
                <p className="text-xs uppercase tracking-wide text-blue-300">
                    Navigasi
                </p>
            </div>
            <nav className="mt-4 flex flex-col gap-1 px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = Array.isArray(item.pattern)
                        ? item.pattern.some((pattern) => route().current(pattern))
                        : item.pattern
                          ? route().current(item.pattern)
                          : false;

                    return (
                        <Link
                            key={item.label}
                            href={route(item.routeName)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-blue-100 hover:bg-white/5'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-0 w-full border-t border-blue-900 px-6 py-5">
                <p className="text-xs uppercase tracking-wide text-blue-300">
                    Logged in as
                </p>
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-blue-200">{user?.email}</p>
            </div>
        </aside>
    );
}
