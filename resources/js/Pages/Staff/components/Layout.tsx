import type { PropsWithChildren, ReactNode } from 'react';
import { Toaster } from 'sonner';
import Sidebar from './Sidebar';
import Breadcrumbs, { type BreadcrumbItem } from './Breadcrumbs';

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
