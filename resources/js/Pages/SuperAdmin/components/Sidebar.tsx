import { PageProps } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    UserMinus,
    MessageSquare,
    UserPlus,
    Mail,
    Building2,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

interface NavItem {
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    routeName: string;
    pattern: string | string[];
    superAdminOnly?: boolean;
}

const defaultNavItems: NavItem[] = [
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
        superAdminOnly: true,
    },
    {
        label: 'Kelola Rekrutmen',
        icon: UserPlus,
        routeName: 'super-admin.recruitment',
        pattern: 'super-admin.recruitment',
    },
    {
        label: 'Kelola Divisi',
        icon: Building2,
        routeName: 'super-admin.divisions.index',
        pattern: 'super-admin.divisions.*',
    },
    {
        label: 'Kelola Surat',
        icon: Mail,
        routeName: 'super-admin.letters.index',
        pattern: 'super-admin.letters.*',
    },
    {
        label: 'Kelola Staff',
        icon: UserMinus,
        routeName: 'super-admin.staff.index',
        pattern: 'super-admin.staff.*',
    },
    {
        label: 'Kelola Pengaduan',
        icon: MessageSquare,
        routeName: 'super-admin.complaints.index',
        pattern: 'super-admin.complaints.*',
    },
];

export default function Sidebar() {
    const {
        props: { auth },
    } = usePage<PageProps>();
    const user = auth?.user;
    const isSuperAdmin = user?.role === 'Super Admin';
    const isHumanCapitalAdmin =
        user?.role === 'Admin' &&
        typeof user?.division === 'string' &&
        /human\s+(capital|resources)/i.test(user.division);
    const navItems: NavItem[] = isHumanCapitalAdmin
        ? [
              {
                  label: 'Dashboard',
                  icon: LayoutDashboard,
                  routeName: 'super-admin.admin-hr.dashboard',
                  pattern: 'super-admin.admin-hr.dashboard',
              },
              ...defaultNavItems.filter((item) => item.routeName !== 'super-admin.dashboard'),
          ]
        : defaultNavItems;
    const panelLabel = isHumanCapitalAdmin ? 'Admin HR' : 'Super Admin';

    return (
        <aside className="fixed inset-y-0 left-0 z-10 w-64 bg-blue-950 text-white shadow-lg">
            <div className="flex h-20 items-center justify-between px-6">
                <div>
                    <p className="text-xs uppercase tracking-widest text-blue-200">
                        PT. Lintas Data Prima
                    </p>
                    <p className="text-xl font-semibold">{panelLabel}</p>
                    <p className="text-xs text-blue-200">HRIS Portal</p>
                </div>
            </div>
            <div className="px-6">
                <p className="text-xs uppercase tracking-wide text-blue-300">
                    Navigasi
                </p>
            </div>
            <nav className="mt-4 flex flex-col gap-1 px-4">
                {navItems
                    .filter((item) => (item.superAdminOnly ? isSuperAdmin : true))
                    .map((item) => {
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
                <button
                    type="button"
                    onClick={() => router.post(route('logout'))}
                    className="mt-4 w-full rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                    Keluar
                </button>
            </div>
        </aside>
    );
}
