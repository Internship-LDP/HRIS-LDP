import { Link, usePage, router } from '@inertiajs/react';
import { Mail, LayoutDashboard, Users } from 'lucide-react';
import type { PageProps } from '@/types';

const nav = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        route: 'admin-staff.dashboard',
        pattern: 'admin-staff.dashboard',
    },
    {
        label: 'Kelola Surat',
        icon: Mail,
        route: 'admin-staff.letters',
        pattern: 'admin-staff.letters',
    },
    {
        label: 'Rekrutmen Baru',
        icon: Users,
        route: 'admin-staff.recruitment',
        pattern: 'admin-staff.recruitment',
    },
];

export default function Sidebar() {
    const {
        props: { auth },
    } = usePage<PageProps>();
    const user = auth.user;

    return (
        <aside className="fixed inset-y-0 left-0 w-60 bg-blue-900 text-white shadow-lg">
            <div className="px-5 py-6">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-200">
                    PT. Lintas Data Prima
                </p>
                <p className="text-xl font-semibold">Staff Portal</p>
            </div>

            <nav className="mt-4 flex flex-col gap-1 px-3">
                {nav.map((item) => {
                    const Icon = item.icon;
                    const active = route().current(item.pattern);

                    return (
                        <Link
                            key={item.label}
                            href={route(item.route)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                active ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-0 w-full border-t border-blue-800 px-5 py-4 text-sm">
                <p className="text-xs text-blue-200">Masuk sebagai</p>
                <p className="font-semibold text-white">{user.name}</p>
                {user.division && <p className="text-xs text-blue-200">{user.division}</p>}
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
