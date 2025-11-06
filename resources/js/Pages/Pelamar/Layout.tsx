import { PropsWithChildren, ReactNode } from 'react';
import Sidebar from '@/Pages/Pelamar/components/Sidebar';
import Breadcrumbs from '@/Pages/Pelamar/components/Breadcrumbs';
import { Toaster } from 'sonner';

interface PelamarLayoutProps {
    title: string;
    description?: string;
    breadcrumbs?: string[];
    actions?: ReactNode;
}

export default function PelamarLayout({
    title,
    description,
    breadcrumbs,
    actions,
    children,
}: PropsWithChildren<PelamarLayoutProps>) {
    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            <Sidebar />
            <div className="ml-64 flex-1 p-6 md:p-10">
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
            <Toaster richColors position="top-right" />
        </div>
    );
}
