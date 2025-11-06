import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import ApplicantsTab from './components/ApplicantsTab';
import ApplicantDetailDialog from './components/ApplicantDetailDialog';
import AddApplicantDialog from './components/AddApplicantDialog';
import InterviewsTab from './components/InterviewsTab';
import OnboardingTab from './components/OnboardingTab';
import {
    ApplicantRecord,
    ApplicantStatus,
    InterviewSchedule,
    OnboardingItem,
    RecruitmentPageProps,
    StatusSummary,
} from './types';

const interviewsSeed: InterviewSchedule[] = [
    {
        candidate: 'Ahmad Fauzi',
        position: 'Software Engineer',
        date: '23 Okt 2025',
        time: '10:00',
        mode: 'Online',
        interviewer: 'Bapak Ahmad - Manager IT',
    },
    {
        candidate: 'Siti Nurhaliza',
        position: 'Marketing Manager',
        date: '23 Okt 2025',
        time: '13:00',
        mode: 'Offline',
        interviewer: 'Ibu Sarah - Manager Marketing',
    },
    {
        candidate: 'Budi Santoso',
        position: 'Accountant',
        date: '24 Okt 2025',
        time: '15:00',
        mode: 'Online',
        interviewer: 'Bapak Joko - Manager Finance',
    },
];

const onboardingSeed: OnboardingItem[] = [
    {
        name: 'Rina Kartika',
        position: 'HR Specialist',
        startedAt: '20 Okt 2025',
        status: 'Selesai',
        steps: [
            { label: 'Kontrak ditandatangani', complete: true },
            { label: 'Serah terima inventaris', complete: true },
            { label: 'Training & orientasi', complete: true },
        ],
    },
    {
        name: 'Ahmad Fauzi',
        position: 'Software Engineer',
        startedAt: '23 Okt 2025 (Terjadwal)',
        status: 'In Progress',
        steps: [
            { label: 'Menunggu kontrak ditandatangani', complete: false },
            { label: 'Serah terima inventaris', complete: false, pending: true },
            { label: 'Training & orientasi', complete: false, pending: true },
        ],
    },
];

const statusOrder: ApplicantStatus[] = [
    'Applied',
    'Screening',
    'Interview',
    'Hired',
    'Rejected',
];

export default function KelolaRekrutmenIndex({
    applications,
    statusOptions,
}: RecruitmentPageProps) {
    const [activeTab, setActiveTab] = useState('applicants');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<ApplicantRecord | null>(null);

    const filteredApplications =
        statusFilter === 'all'
            ? applications
            : applications.filter((application) => application.status === statusFilter);

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visibleApplications = normalizedSearch.length
        ? filteredApplications.filter(
              (application) =>
                  application.name.toLowerCase().includes(normalizedSearch) ||
                  application.position.toLowerCase().includes(normalizedSearch) ||
                  application.email.toLowerCase().includes(normalizedSearch),
          )
        : filteredApplications;

    const statusSummary: StatusSummary = applications.reduce((acc, application) => {
        acc[application.status] = (acc[application.status] ?? 0) + 1;
        return acc;
    }, {} as StatusSummary);

    const handleViewDetail = (application: ApplicantRecord) => {
        setSelectedApplicant(application);
        setDetailOpen(true);
    };

    return (
        <SuperAdminLayout
            title="Recruitment & Onboarding"
            description="Kelola pelamar dan proses rekrutmen"
            breadcrumbs={[
                { label: 'Super Admin', href: route('super-admin.dashboard') },
                { label: 'Recruitment & Onboarding' },
            ]}
            actions={<AddApplicantDialog />}
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                    <TabsTrigger value="applicants">Daftar Pelamar</TabsTrigger>
                    <TabsTrigger value="interviews">Jadwal Interview</TabsTrigger>
                    <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                </TabsList>

                <TabsContent value="applicants">
                    <ApplicantsTab
                        statusOptions={statusOptions}
                        searchTerm={searchTerm}
                        onSearchTermChange={setSearchTerm}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        statusOrder={statusOrder}
                        statusSummary={statusSummary}
                        visibleApplications={visibleApplications}
                        onViewDetail={handleViewDetail}
                    />
                </TabsContent>

                <TabsContent value="interviews">
                    <InterviewsTab interviews={interviewsSeed} />
                </TabsContent>

                <TabsContent value="onboarding">
                    <OnboardingTab items={onboardingSeed} />
                </TabsContent>
            </Tabs>

            <ApplicantDetailDialog
                open={detailOpen}
                onOpenChange={setDetailOpen}
                applicant={selectedApplicant}
            />
        </SuperAdminLayout>
    );
}
