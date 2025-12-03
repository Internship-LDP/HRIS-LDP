import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import Sidebar from "./Sidebar";
import Breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs";
import { usePage, router } from "@inertiajs/react";
import type { PageProps } from "@/types";

interface StaffLayoutProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
}

export default function StaffLayout({
    title,
    description,
    breadcrumbs,
    actions,
    children,
}: PropsWithChildren<StaffLayoutProps>) {
    const page = usePage<PageProps>();
    const user = page.props.auth?.user;

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    /* REALTIME ACCOUNT DEACTIVATION */
    useEffect(() => {
        if (!user || !window.Echo) return;

        const channelName = `user.${user.id}`;
        const channel = window.Echo.private(channelName);

        channel.listen(".AccountDeactivated", (event: any) => {
            toast.error(event.message || "Akun Anda telah dinonaktifkan.");
            setTimeout(() => router.post(route("logout")), 1200);
        });

        return () => {
            window.Echo.leave(channelName);
        };
    }, [user]);

    /* AUTO CLOSE SIDEBAR AFTER ROUTE CHANGE */
    useEffect(() => {
        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
    }, [page.url]);

    return (
        <div className="flex min-h-screen bg-slate-100 text-slate-900 overflow-x-hidden">
            {/* MOBILE OVERLAY */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* DESKTOP SIDEBAR */}
            <div className="hidden md:block fixed inset-y-0 left-0 w-64 z-40">
                <Sidebar />
            </div>

            {/* MOBILE SIDEBAR */}
            <div
                className={`fixed inset-y-0 left-0 w-64 bg-blue-900 z-40 transform transition-transform duration-300 md:hidden ${
                    isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <Sidebar
                    isMobile
                    onClose={() => setIsMobileSidebarOpen(false)}
                />
            </div>

            {/* MAIN CONTENT */}
            <main className="flex-1 min-w-0 w-full md:ml-64 p-3 sm:p-5 md:p-10 transition-all">
                {/* MOBILE MENU BUTTON */}
                <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="md:hidden mb-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    <svg
                        width="22"
                        height="22"
                        fill="none"
                        stroke="currentColor"
                    >
                        <path
                            d="M4 7h14M4 11h14M4 15h14"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                    Menu
                </button>

                {/* BREADCRUMBS */}
                {breadcrumbs && (
                    <div className="mb-2">
                        <Breadcrumbs items={breadcrumbs} />
                    </div>
                )}

                {/* Divider */}
                <div className="h-px bg-slate-200/60 mb-6"></div>

                {/* PAGE HEADER */}
                <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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
                    {actions && <div className="flex-shrink-0">{actions}</div>}
                </div>

                {/* PAGE CONTENT */}
                <div className="space-y-6">{children}</div>
            </main>

            <Toaster richColors position="top-right" />
        </div>
    );
}
