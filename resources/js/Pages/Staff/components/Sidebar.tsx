import { Link, router, usePage } from '@inertiajs/react';
import { FileText, LayoutDashboard, MessageSquare } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import type { PageProps } from '@/types';

interface NavItem {
    label: string;
    route: string;
    patterns: string | string[];
    icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        route: 'staff.dashboard',
        patterns: 'staff.dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Keluhan & Saran',
        route: 'staff.complaints.index',
        patterns: ['staff.complaints.index', 'staff.complaints.*'],
        icon: MessageSquare,
    },
    {
        label: 'Pengajuan Resign',
        route: 'staff.resignation.index',
        patterns: 'staff.resignation.*',
        icon: FileText,
    },
];

export default function StaffSidebar() {
    const {
        props: { auth },
    } = usePage<PageProps>();
    const user = auth.user;

    const isActive = (patterns: string | string[]) => {
        if (Array.isArray(patterns)) {
            return patterns.some((pattern) => route().current(pattern));
        }

        return route().current(patterns);
    };

    return (
        <aside className="fixed inset-y-0 left-0 z-20 w-64 bg-blue-900 text-white shadow-lg">
            <div className="px-6 py-6">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200">
                    Staff Portal
                </p>
                <p className="text-2xl font-semibold">LDP HRIS</p>
                <p className="text-xs text-blue-200">Empowering People</p>
            </div>

            <nav className="mt-4 flex flex-col gap-1 px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.patterns);

                    return (
                        <Link
                            key={item.label}
                            href={route(item.route)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                active
                                    ? 'bg-white/15 text-white'
                                    : 'text-blue-100 hover:bg-white/10'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-0 w-full border-t border-blue-800 px-6 py-5">
                <p className="text-xs uppercase tracking-wide text-blue-200">
                    Logged in as
                </p>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                {user.division && (
                    <p className="text-xs text-blue-200">{user.division}</p>
                )}
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
