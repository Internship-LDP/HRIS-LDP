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
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    routeName: string;
    pattern: string | string[];
    superAdminOnly?: boolean;
    badgeKey?: string;
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
        badgeKey: 'super-admin.recruitment',
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
        badgeKey: 'super-admin.letters.index',
    },
    {
        label: 'Kelola Staff',
        icon: UserMinus,
        routeName: 'super-admin.staff.index',
        pattern: 'super-admin.staff.*',
        badgeKey: 'super-admin.staff.index',
    },
    {
        label: 'Kelola Pengaduan',
        icon: MessageSquare,
        routeName: 'super-admin.complaints.index',
        pattern: 'super-admin.complaints.*',
        badgeKey: 'super-admin.complaints.index',
    },
];

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function Sidebar({ isOpen, onToggle, isMobileOpen = false, onMobileClose }: SidebarProps) {
    const {
        props: { auth, sidebarNotifications = {} },
    } = usePage<PageProps<{ sidebarNotifications?: Record<string, number> }>>();
    const [liveBadges, setLiveBadges] = useState<Record<string, number>>(
        sidebarNotifications,
    );
    const pendingStatuses = ['Menunggu HR', 'Diajukan', 'Diproses'];
    const lettersBadgeKey = 'super-admin.letters.index';

    useEffect(() => {
        setLiveBadges(sidebarNotifications);
    }, [sidebarNotifications]);

    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const channel = window.Echo.private('super-admin.letters');
        const handleLetterUpdated = (payload: { letter?: { status?: string; currentRecipient?: string } }) => {
            const letter = payload?.letter;
            if (!letter) {
                return;
            }

            const shouldCount =
                pendingStatuses.includes(letter.status ?? '') &&
                letter.currentRecipient === 'hr';

            setLiveBadges((prev) => {
                const current = prev[lettersBadgeKey] ?? 0;
                const next = shouldCount ? current + 1 : Math.max(current - 1, 0);
                return { ...prev, [lettersBadgeKey]: next };
            });
        };

        channel.listen('LetterUpdated', handleLetterUpdated).listen('.LetterUpdated', handleLetterUpdated);

        return () => {
            channel.stopListening('LetterUpdated');
            window.Echo?.leave('super-admin.letters');
        };
    }, []);

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

    const handleNavClick = () => {
        if (onMobileClose) {
            onMobileClose();
        }
    };

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 bg-blue-950 text-white shadow-lg transition-all duration-300 ease-in-out flex flex-col h-screen",
                isOpen ? "w-64" : "w-20",
                "max-md:-translate-x-full max-md:w-64",
                isMobileOpen && "max-md:translate-x-0"
            )}
        >
            {/* Header - Fixed */}
            <div className={cn("flex items-center px-4 h-16 md:h-20 shrink-0", isOpen ? "justify-between" : "justify-center", "max-md:justify-between")}>
                {(isOpen || isMobileOpen) && (
                    <div className="overflow-hidden whitespace-nowrap">
                        <p className="text-[10px] md:text-xs uppercase tracking-widest text-blue-200">
                            PT. Lintas Data Prima
                        </p>
                        <p className="text-lg md:text-xl font-semibold">{panelLabel}</p>
                        <p className="text-[10px] md:text-xs text-blue-200">HRIS Portal</p>
                    </div>
                )}
                {/* Desktop toggle button */}
                <button
                    onClick={onToggle}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition-colors hidden md:block"
                >
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
                {/* Mobile close button */}
                <button
                    onClick={onMobileClose}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition-colors md:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation Label */}
            {(isOpen || isMobileOpen) && (
                <div className="px-4 md:px-6 mb-2 shrink-0">
                    <p className="text-[10px] md:text-xs uppercase tracking-wide text-blue-300">
                        Navigasi
                    </p>
                </div>
            )}

            {/* Nav Items - Scrollable */}
            <nav className="flex-1 flex flex-col gap-1 px-2 md:px-3 overflow-y-auto py-2 min-h-0">
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
                            title={!isOpen ? item.label : undefined}
                            onClick={handleNavClick}
                            className={cn(
                                "flex items-center rounded-lg transition-all duration-200 group relative",
                                isOpen || isMobileOpen ? "gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2" : "justify-center p-3",
                                isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-blue-100 hover:bg-white/5'
                            )}
                        >
                            <Icon className={cn("shrink-0", isOpen || isMobileOpen ? "h-3.5 w-3.5 md:h-4 md:w-4" : "h-5 w-5")} />
                            
                            {(isOpen || isMobileOpen) && (
                                <span className="flex flex-1 items-center justify-between overflow-hidden text-xs md:text-sm">
                                    <span className="truncate">{item.label}</span>
                                    {(() => {
                                        const rawCount = item.badgeKey
                                            ? liveBadges[item.badgeKey] ?? 0
                                            : 0;
                                        if (!rawCount || rawCount <= 0) {
                                            return null;
                                        }
                                        const displayCount = rawCount > 99 ? '99+' : rawCount;
                                        return (
                                            <span className="ml-2 inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                                                {displayCount}
                                            </span>
                                        );
                                    })()}
                                </span>
                            )}

                            {/* Badge for collapsed state (desktop only) */}
                            {!isOpen && !isMobileOpen && item.badgeKey && (liveBadges[item.badgeKey] ?? 0) > 0 && (
                                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-blue-950 hidden md:block" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer - Fixed at bottom */}
            <div className="border-t border-blue-900 p-3 md:p-4 shrink-0">
                {(isOpen || isMobileOpen) ? (
                    <div className="space-y-2 md:space-y-4">
                        <div>
                            <p className="text-[10px] md:text-xs uppercase tracking-wide text-blue-300">
                                Logged in as
                            </p>
                            <p className="text-xs md:text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-[10px] md:text-xs text-blue-200 truncate">{user?.email}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.post(route('logout'))}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                            <LogOut size={14} className="md:w-4 md:h-4" />
                            <span>Keluar</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                         <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold text-white cursor-help" title={user?.name}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <button
                            type="button"
                            onClick={() => router.post(route('logout'))}
                            className="p-2 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition-colors"
                            title="Keluar"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
