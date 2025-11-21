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

interface DashboardStats {
    totalApplications: number;
    latestStatus?: string | null;
}

type DashboardPageProps = PageProps<{
    applicationStatus: {
        progress: number;
        stages: ApplicationStage[];
    };
    applications: ApplicationItem[];
    stats: DashboardStats;
    upcomingInterview?: UpcomingInterview | null;
}>;



export default function Dashboard({
    applicationStatus,
    applications,
    stats,
    upcomingInterview,
}: DashboardPageProps) {
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
                <ApplicationStatusCard
                    progress={applicationStatus.progress}
                    stages={applicationStatus.stages}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
