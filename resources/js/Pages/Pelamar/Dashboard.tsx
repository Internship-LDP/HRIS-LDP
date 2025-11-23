import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import PelamarLayout from '@/Pages/Pelamar/Layout';
import ApplicationStatusCard, {
    ApplicationStage,
} from '@/Pages/Pelamar/components/dashboard/ApplicationStatusCard';
import UpcomingInterviewCard, {
    UpcomingInterview,
} from '@/Pages/Pelamar/components/dashboard/UpcomingInterviewCard';
import DocumentsCard, {
    ApplicationItem,
} from '@/Pages/Pelamar/components/dashboard/DocumentsCard';
import InfoHighlights from '@/Pages/Pelamar/components/dashboard/InfoHighlights';
import QuickActions from '@/Pages/Pelamar/components/dashboard/QuickActions';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { useState } from 'react';
import { Card } from '@/Components/ui/card';

interface DashboardStats {
    totalApplications: number;
    latestStatus?: string | null;
}

interface ApplicationStatus {
    id: number;
    position: string;
    division: string;
    status: string;
    progress: number;
    stages: ApplicationStage[];
    rejection_reason?: string | null;
}

type DashboardPageProps = PageProps<{
    applicationsStatus: ApplicationStatus[];
    applications: ApplicationItem[];
    stats: DashboardStats;
    upcomingInterview?: UpcomingInterview | null;
}>;

export default function Dashboard({
    applicationsStatus,
    applications,
    stats,
    upcomingInterview,
}: DashboardPageProps) {
    const [selectedAppId, setSelectedAppId] = useState<string>(
        applicationsStatus.length > 0 ? String(applicationsStatus[0].id) : ''
    );

    const selectedStatus = applicationsStatus.find(
        (app) => String(app.id) === selectedAppId
    );

    const navigateToApplications = () =>
        router.visit(route('pelamar.applications'));

    return (
        <>
            <Head title="Dashboard Pelamar" />
            <PelamarLayout
                title="Dashboard Pelamar"
                description="Selamat datang di portal rekrutmen PT. Lintas Data Prima"
                breadcrumbs={['Dashboard']}
            >
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Status Lamaran
                    </h2>
                    {applicationsStatus.length > 0 && (
                        <Select
                            value={selectedAppId}
                            onValueChange={setSelectedAppId}
                        >
                            <SelectTrigger className="w-full sm:w-[300px]">
                                <SelectValue placeholder="Pilih Lamaran" />
                            </SelectTrigger>
                            <SelectContent>
                                {applicationsStatus.map((app) => (
                                    <SelectItem key={app.id} value={String(app.id)}>
                                        <span className="font-medium">{app.position}</span>
                                        <span className="ml-2 text-xs text-slate-500">
                                            ({app.division})
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {selectedStatus ? (
                    <ApplicationStatusCard
                        progress={selectedStatus.progress}
                        stages={selectedStatus.stages}
                        rejectionReason={selectedStatus.rejection_reason}
                    />
                ) : (
                    <Card className="p-6 text-center text-slate-500">
                        Belum ada lamaran yang diajukan.
                    </Card>
                )}

                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <UpcomingInterviewCard interview={upcomingInterview} />
                    <DocumentsCard
                        applications={applications}
                        onNewApplication={navigateToApplications}
                    />
                </div>

                <InfoHighlights
                    highlights={[
                        {
                            tone: 'warning',
                            message:
                                stats.totalApplications === 0
                                    ? 'Ajukan lamaran pertama Anda untuk memulai proses rekrutmen.'
                                    : 'Pantau perkembangan lamaran Anda secara berkala.',
                        },
                        {
                            tone: 'info',
                            message:
                                'Periksa email secara rutin agar tidak melewatkan undangan atau pembaruan proses seleksi.',
                        },
                        {
                            tone: 'success',
                            message:
                                stats.latestStatus
                                    ? `Status lamaran terbaru Anda: ${stats.latestStatus}.`
                                    : 'Setelah mengirim lamaran, status terbaru akan ditampilkan di sini.',
                        },
                    ]}
                />

                <QuickActions
                    actions={[
                        { label: 'Lihat Lamaran', onClick: navigateToApplications },
                        { label: 'Upload Dokumen', onClick: navigateToApplications },
                        {
                            label: 'Update Profile',
                            onClick: () => router.visit(route('pelamar.profile')),
                        },
                    ]}
                />
            </PelamarLayout>
        </>
    );
}
