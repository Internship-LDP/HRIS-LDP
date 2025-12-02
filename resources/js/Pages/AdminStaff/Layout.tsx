// === [ AdminStaffLayout.tsx ] ===

import type { PropsWithChildren, ReactNode } from 'react';
import Sidebar from '@/Pages/AdminStaff/components/Sidebar';
import Breadcrumbs, { BreadcrumbItem } from '@/Pages/AdminStaff/components/Breadcrumbs';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { Menu } from 'lucide-react';

interface AdminStaffLayoutProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
}
export default function AdminStaffLayout({
    title,
    description,
    breadcrumbs,
    actions,
    children,
}: PropsWithChildren<AdminStaffLayoutProps>) {
    // ... (state dan fungsi tidak berubah)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleDesktopSidebar = () => setIsSidebarOpen((prev) => !prev);
    const openMobileSidebar = () => setIsMobileOpen(true);
    const closeMobileSidebar = () => setIsMobileOpen(false);

    // KELAS UNTUK MAIN CONTAINER
    const mainContainerClasses = `
        flex-1 p-4 pt-6 md:p-10 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'md:ml-52' : 'md:ml-16'}
    `;

    return (
        <div className="flex min-h-screen bg-slate-100 text-slate-900">
            
            {/* 1. SIDEBAR STAFF BARU */}
            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={toggleDesktopSidebar}
                isMobileOpen={isMobileOpen}
                onMobileClose={closeMobileSidebar}
            />

            {/* 2. DIM BACKDROP MOBILE BARU */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={closeMobileSidebar}
                />
            )}

            {/* 3. MOBILE HEADER BARU (Revisi: Icon kiri, Teks di samping kiri) */}
            <div className="flex items-center bg-white p-4 text-blue-900 md:hidden fixed top-0 left-0 right-0 z-30 shadow-lg">
                <button onClick={openMobileSidebar} className="mr-3"> {/* Tombol Menu */}
                    <Menu className="h-6 w-6" />
                </button>
                <div className="flex flex-col"> {/* Teks Portal Staff */}
                    <p className="text-[10px] uppercase tracking-widest text-blue-800">
                        PT. Lintas Data Prima
                    </p>
                    <p className="text-lg font-semibold">Staff Portal</p>
                </div>
            </div>

            {/* MAIN CONTAINER */}
            <div className={mainContainerClasses}>
                {/* Tambahkan padding atas di mobile agar konten tidak tertutup header fixed */}
                <div className='md:hidden h-[4.5rem] shrink-0' /> 
                
                {/* ... (sisa layout tidak berubah) ... */}
                
                {breadcrumbs && (
                    <div className="mb-4 overflow-x-auto">
                        <Breadcrumbs items={breadcrumbs} />
                    </div>
                )}

                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-blue-900 md:text-2xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1 text-sm text-slate-500">{description}</p>
                        )}
                    </div>
                    {actions && <div className="shrink-0">{actions}</div>}
                </div>

                <div className="space-y-6">{children}</div>
            </div>

            <Toaster richColors position="top-right" />
        </div>
    );
}