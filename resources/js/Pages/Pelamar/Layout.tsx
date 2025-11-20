import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import Sidebar from '@/Pages/Pelamar/components/Sidebar';
import Breadcrumbs from '@/Pages/Pelamar/components/Breadcrumbs';
import { Toaster } from 'sonner';
import { PageProps } from '@/types';
import ProfileReminderDialog from '@/Pages/Pelamar/components/ProfileReminderDialog';

interface PelamarLayoutProps {
    title: string;
    description?: string;
    breadcrumbs?: string[];
    actions?: ReactNode;
    showProfileReminder?: boolean;
}

export default function PelamarLayout({
    title,
    description,
    breadcrumbs,
    actions,
    showProfileReminder = true,
    children,
}: PropsWithChildren<PelamarLayoutProps>) {
    const {
        props: { auth },
    } = usePage<PageProps>();
    const shouldPrompt = Boolean(
        showProfileReminder && auth?.user?.needs_applicant_profile,
    );
    const [reminderOpen, setReminderOpen] = useState(shouldPrompt);

    useEffect(() => {
        setReminderOpen(shouldPrompt);
    }, [shouldPrompt]);

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
            <ProfileReminderDialog
                open={reminderOpen}
                onOpenChange={setReminderOpen}
                onNavigate={() => router.visit(route('pelamar.profile'))}
            />
            <Toaster richColors position="top-right" />
        </div>
    );
}
