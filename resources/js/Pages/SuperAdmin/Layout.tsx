import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import Breadcrumbs, {
    BreadcrumbItem,
} from '@/Pages/SuperAdmin/components/Breadcrumbs';
import Sidebar from '@/Pages/SuperAdmin/components/Sidebar';
import { Toaster } from 'sonner';
import QuickActions from '@/Pages/SuperAdmin/components/QuickActions';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarOpen');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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
                "flex-1 flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out will-change-[margin]",
                "ml-0 md:ml-52",
                !isSidebarOpen && "md:ml-16"
            )}>
                {/* Mobile header */}
                <div className="sticky top-0 z-30 flex items-center gap-4 bg-white border-b border-slate-200 px-4 py-3 md:hidden">
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                        <Menu size={24} />
                    </button>
                    <div>
                        <p className="text-xs text-slate-500">PT. Lintas Data Prima</p>
                        <p className="text-sm font-semibold text-blue-900">Super Admin</p>
                    </div>
                </div>

                <div className="flex-1 p-4 md:p-6 lg:p-10">
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <div className="mb-4">
                            <Breadcrumbs items={breadcrumbs} />
                        </div>
                    )}

                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-xl md:text-2xl font-semibold text-blue-900">
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

                    <div className="space-y-6">{children}</div>
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
