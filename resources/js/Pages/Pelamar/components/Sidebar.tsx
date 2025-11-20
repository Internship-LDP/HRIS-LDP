import { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { FileText, LayoutDashboard, LogOut, User } from 'lucide-react';

interface SidebarNavItem {
    label: string;
    icon: typeof LayoutDashboard;
    routeName: string;
}

const navItems: SidebarNavItem[] = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        routeName: 'pelamar.dashboard',
    },
    {
        label: 'Profil',
        icon: User,
        routeName: 'pelamar.profile',
    },
    {
        label: 'Lamaran Saya',
        icon: FileText,
        routeName: 'pelamar.applications',
    },
];

export default function Sidebar() {
    const {
        props: { auth },
    } = usePage<PageProps>();
    const user = auth?.user;

    return (
        <aside className="fixed inset-y-0 left-0 z-20 w-64 bg-blue-950 text-white shadow-lg">
            <div className="flex h-20 items-center justify-between px-6">
                <div>
                    <p className="text-xs uppercase tracking-widest text-blue-200">
                        PT. Lintas Data Prima
                    </p>
                    <p className="text-xl font-semibold">Portal Pelamar</p>
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
                    const isActive = route().current(item.routeName);

                    return (
                        <Link
                            key={item.routeName}
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
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                    <LogOut className="h-4 w-4" />
                    Keluar
                </button>
            </div>
        </aside>
    );
}
