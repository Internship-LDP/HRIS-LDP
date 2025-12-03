import type { PropsWithChildren, ReactNode } from "react";
import { Toaster, toast } from "sonner";
import Sidebar from "./Sidebar";
import Breadcrumbs, { type BreadcrumbItem } from "./Breadcrumbs";

import { useEffect } from "react";
import { usePage, router } from "@inertiajs/react";

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
    // Ambil user login
    const user = usePage().props.auth?.user;

    useEffect(() => {
        console.log("StaffLayout useEffect DIPANGGIL");
        console.log("User:", user);
        console.log("Echo:", window.Echo);

        if (!user || !window.Echo) {
            console.warn("User atau Echo belum siap, listener TIDAK aktif");
            return;
        }

        const channelName = `user.${user.id}`;
        console.log("Subscribe ke:", channelName);

        const channel = window.Echo.private(channelName);

        channel
            .subscribed(() =>
                console.log("✔ SUBSCRIBED ke channel:", channelName)
            )
            .error((e: any) => console.error("❌ GAGAL SUBSCRIBE:", e));

        channel.listen(".AccountDeactivated", (event: any) => {
            console.log("🔥 EVENT DITERIMA:", event);

            toast.error(event.message || "Akun Anda telah dinonaktifkan.");

            // Tunda sedikit supaya notifikasi sempat tampil sebelum logout
            const logoutRoute = route("logout");
            setTimeout(() => router.post(logoutRoute), 1200);
        });

        return () => {
            console.log("LEAVE channel:", channelName);
            window.Echo.leave(channelName);
        };
    }, [user]);

    return (
        <div className="flex min-h-screen bg-slate-100 text-slate-900">
            <Sidebar />

            <div className="ml-64 flex-1 p-6 md:p-10">
                {breadcrumbs && (
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

            <Toaster richColors position="top-right" />
        </div>
    );
}
