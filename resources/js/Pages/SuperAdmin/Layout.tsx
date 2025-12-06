import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import Breadcrumbs, {
    BreadcrumbItem,
} from '@/Pages/SuperAdmin/components/Breadcrumbs';
import Sidebar from '@/Pages/SuperAdmin/components/Sidebar';
import { Toaster } from 'sonner';
import QuickActions from '@/Pages/SuperAdmin/components/QuickActions';
import { cn } from '@/lib/utils';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import NotificationDropdown from '@/Pages/SuperAdmin/components/NotificationDropdown';

interface SuperAdminLayoutProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
}

export default function SuperAdminLayout({
    title,
    description,
    breadcrumbs,
    actions,
    children,
}: PropsWithChildren<SuperAdminLayoutProps>) {
    const { props: { auth, sidebarNotifications = {} } } = usePage<PageProps<{ sidebarNotifications?: Record<string, number> }>>();
    const user = auth?.user;

    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarOpen');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // State untuk notifikasi real-time
    const [liveNotifications, setLiveNotifications] = useState<Record<string, number>>(sidebarNotifications);

    // Hitung total notifikasi
    const totalNotifications = Object.values(liveNotifications).reduce((sum, count) => sum + count, 0);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Update notifications saat props berubah
    useEffect(() => {
        setLiveNotifications(sidebarNotifications);
    }, [sidebarNotifications]);

    // Setup real-time notification listeners
    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const pendingStatuses = ['Menunggu HR', 'Diajukan', 'Diproses'];
        const lettersBadgeKey = 'super-admin.letters.index';
        const recruitmentBadgeKey = 'super-admin.recruitment';
        const staffBadgeKey = 'super-admin.staff.index';
        const complaintsBadgeKey = 'super-admin.complaints.index';

        // Listen to Letters channel
        const lettersChannel = window.Echo.private('super-admin.letters');
        const handleLetterUpdated = (payload: { letter?: { status?: string; currentRecipient?: string } }) => {
            const letter = payload?.letter;
            if (!letter) return;

            const shouldCount = pendingStatuses.includes(letter.status ?? '') && letter.currentRecipient === 'hr';
            setLiveNotifications((prev) => {
                const current = prev[lettersBadgeKey] ?? 0;
                const next = shouldCount ? current + 1 : Math.max(current - 1, 0);
                return { ...prev, [lettersBadgeKey]: next };
            });
        };

        // Listen to Recruitment channel
        const recruitmentChannel = window.Echo.private('super-admin.recruitment');
        const handleApplicationUpdated = (payload: { application?: { status?: string } }) => {
            const application = payload?.application;
            if (!application) return;

            const shouldCount = ['Applied', 'Screening'].includes(application.status ?? '');
            setLiveNotifications((prev) => {
                const current = prev[recruitmentBadgeKey] ?? 0;
                const next = shouldCount ? current + 1 : Math.max(current - 1, 0);
                return { ...prev, [recruitmentBadgeKey]: next };
            });
        };

        // Listen to Staff Termination channel
        const staffChannel = window.Echo.private('super-admin.staff');
        const handleTerminationUpdated = (payload: { termination?: { status?: string } }) => {
            const termination = payload?.termination;
            if (!termination) return;

            const shouldCount = ['Diajukan', 'Proses'].includes(termination.status ?? '');
            setLiveNotifications((prev) => {
                const current = prev[staffBadgeKey] ?? 0;
                const next = shouldCount ? current + 1 : Math.max(current - 1, 0);
                return { ...prev, [staffBadgeKey]: next };
            });
        };

        // Listen to Complaints channel
        const complaintsChannel = window.Echo.private('super-admin.complaints');
        const handleComplaintUpdated = (payload: { complaint?: { status?: string } }) => {
            const complaint = payload?.complaint;
            if (!complaint) return;

            const shouldCount = complaint.status === 'Baru';
            setLiveNotifications((prev) => {
                const current = prev[complaintsBadgeKey] ?? 0;
                const next = shouldCount ? current + 1 : Math.max(current - 1, 0);
                return { ...prev, [complaintsBadgeKey]: next };
            });
        };

        // Register all event listeners
        lettersChannel.listen('LetterUpdated', handleLetterUpdated);
        recruitmentChannel.listen('ApplicationUpdated', handleApplicationUpdated);
        staffChannel.listen('TerminationUpdated', handleTerminationUpdated);
        complaintsChannel.listen('ComplaintUpdated', handleComplaintUpdated);

        // Cleanup function
        return () => {
            lettersChannel.stopListening('LetterUpdated');
            recruitmentChannel.stopListening('ApplicationUpdated');
            staffChannel.stopListening('TerminationUpdated');
            complaintsChannel.stopListening('ComplaintUpdated');

            window.Echo?.leave('super-admin.letters');
            window.Echo?.leave('super-admin.recruitment');
            window.Echo?.leave('super-admin.staff');
            window.Echo?.leave('super-admin.complaints');
        };
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarOpen;
        setIsSidebarOpen(newState);
        localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={toggleSidebar}
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={closeMobileMenu}
            />

            <div className={cn(
                "flex-1 flex flex-col min-h-screen max-w-full overflow-x-hidden transition-[margin] duration-300 ease-in-out will-change-[margin]",
                "ml-0 md:ml-52",
                !isSidebarOpen && "md:ml-16"
            )}>
                {/* Navbar - Mobile & Desktop */}
                <div className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-white border-b border-slate-200 px-4 py-3 w-full max-w-full">
                    {/* Left side - Mobile menu + Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="md:hidden">
                            <p className="text-xs text-slate-500">PT. Lintas Data Prima</p>
                            <p className="text-sm font-semibold text-blue-900">Super Admin</p>
                        </div>
                    </div>

                    {/* Right side - Notifications & User Menu (Desktop only) */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Notifications */}
                        <NotificationDropdown totalCount={totalNotifications}>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="w-5 h-5" />
                                {totalNotifications > 0 && (
                                    <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                                        {totalNotifications > 99 ? '99+' : totalNotifications}
                                    </Badge>
                                )}
                            </Button>
                        </NotificationDropdown>

                        {/* User Profile Display */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'SA'}
                                </span>
                            </div>
                            <div className="text-left hidden lg:block">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'Super Admin'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 md:p-6 lg:p-10 max-w-full overflow-x-hidden">
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <div className="mb-4">
                            <Breadcrumbs items={breadcrumbs} />
                        </div>
                    )}

                    <div className="mb-4 md:mb-6 flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between w-full">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl md:text-2xl font-semibold text-blue-900 break-words">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-1 text-sm text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>
                        {actions}
                    </div>

                    <div className="space-y-4 md:space-y-6 w-full max-w-full">{children}</div>
                </div>

                {/* Quick actions - hidden on mobile */}
                {!isSidebarOpen && !isMobile && (
                    <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] hidden md:block">
                        <QuickActions />
                    </div>
                )}
            </div>

            <Toaster richColors position="top-right" />
        </div>
    );
}
