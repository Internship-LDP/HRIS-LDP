import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import Breadcrumbs, {
    BreadcrumbItem,
} from '@/Pages/SuperAdmin/components/Breadcrumbs';
import Sidebar from '@/Pages/SuperAdmin/components/Sidebar';
import { Toaster } from 'sonner';
import QuickActions from '@/Pages/SuperAdmin/components/QuickActions';
import { cn } from '@/lib/utils';

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

    const toggleSidebar = () => {
        const newState = !isSidebarOpen;
        setIsSidebarOpen(newState);
        localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
            
            <div className={cn(
                "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
                isSidebarOpen ? "ml-64" : "ml-20"
            )}>
                <div className="flex-1 p-6 md:p-10">
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <div className="mb-4">
                            <Breadcrumbs items={breadcrumbs} />
                        </div>
                    )}

                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-blue-900">
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

                {!isSidebarOpen && (
                    <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                        <QuickActions />
                    </div>
                )}
            </div>

            <Toaster richColors position="top-right" />
        </div>
    );
}
