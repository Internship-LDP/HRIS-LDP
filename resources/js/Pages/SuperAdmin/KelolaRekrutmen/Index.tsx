// src/Pages/SuperAdmin/Recruitment/KelolaRekrutmenIndex.tsx

import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import ApplicantsTab from './components/ApplicantsTab';
import ApplicantDetailDialog from './components/ApplicantDetailDialog';
import AddApplicantDialog from './components/AddApplicantDialog';
import InterviewsTab from './components/InterviewsTab';
import OnboardingTab from './components/OnboardingTab';
import ScheduleInterviewDialog from './components/ScheduleInterviewDialog';
import {
    ApplicantRecord,
    ApplicantStatus,
    RecruitmentPageProps,
    StatusSummary,
} from './types';
import { Head, router } from '@inertiajs/react';

type ApplicantActionHandler = (applicantId: number, newStatus: ApplicantStatus) => void;
type ApplicantRejectHandler = (applicantId: number, reason: string) => void;

const statusOrder: ApplicantStatus[] = [
    'Applied',
    'Screening',
    'Interview',
    'Hired',
    'Rejected',
];

export default function KelolaRekrutmenIndex({
    auth,
    applications,
    statusOptions,
    interviews,
    onboarding,
}: RecruitmentPageProps) {
    const [activeTab, setActiveTab] = useState('applicants');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [detailOpen, setDetailOpen] = useState(false);
    const [scheduleOpen, setScheduleOpen] = useState(false);

    const [selectedApplicant, setSelectedApplicant] = useState<ApplicantRecord | null>(null);

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [updatingApplicantId, setUpdatingApplicantId] = useState<number | null>(null);

    // FILTER DATA
    const filteredApplications =
        statusFilter === 'all'
            ? applications
            : applications.filter((application) => application.status === statusFilter);

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visibleApplications = normalizedSearch
        ? filteredApplications.filter(
              (application) =>
                  application.name.toLowerCase().includes(normalizedSearch) ||
                  application.position.toLowerCase().includes(normalizedSearch) ||
                  application.email.toLowerCase().includes(normalizedSearch),
          )
        : filteredApplications;

    const statusSummary: StatusSummary = applications.reduce((acc, application) => {
        acc[application.status as ApplicantStatus] =
            (acc[application.status as ApplicantStatus] ?? 0) + 1;
        return acc;
    }, {} as StatusSummary);

    // -----------------------------------------
    // UPDATE STATUS
    // -----------------------------------------
    const handleStatusUpdate: ApplicantActionHandler = (applicantId, newStatus) => {
        if (isUpdatingStatus) return;

        setUpdatingApplicantId(applicantId);
        setIsUpdatingStatus(true);

        router.put(
            route('super-admin.recruitment.update-status', applicantId),
            { status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsUpdatingStatus(false);
                    setUpdatingApplicantId(null);
                },
            }
        );
    };

    // -----------------------------------------
    // REJECT APPLICANT (with reason)
    // -----------------------------------------
    const handleReject: ApplicantRejectHandler = (id, reason) => {
        router.put(
            route('super-admin.recruitment.update-status', id),
            { status: 'Rejected', rejection_reason: reason },
            {
                preserveScroll: true,
            }
        );
    };

    // -----------------------------------------
    // OPEN DETAIL & AUTO-SCREENING
    // -----------------------------------------
    const handleViewDetail = (application: ApplicantRecord) => {
        setSelectedApplicant(application);
        setDetailOpen(true);

        if (application.status === 'Applied' && application.id !== updatingApplicantId) {
            handleStatusUpdate(application.id, 'Screening');
        }
    };

    // -----------------------------------------
    // OPEN SCHEDULE INTERVIEW DIALOG
    // -----------------------------------------
    const handleOpenScheduleDialog = (application: ApplicantRecord) => {
        setSelectedApplicant(application);
        setScheduleOpen(true);
        setDetailOpen(false);
    };

    // -----------------------------------------
    // AFTER SUCCESS SUBMIT SCHEDULE
    // -----------------------------------------
    const handleScheduleSuccess = (applicantId: number) => {
        handleStatusUpdate(applicantId, 'Interview');
        setScheduleOpen(false);
        setSelectedApplicant(null);
    };

    // -----------------------------------------
    // DELETE APPLICATION
    // -----------------------------------------
    const handleDelete = (application: ApplicantRecord) => {
        const confirmed = window.confirm(
            `Hapus lamaran ${application.name} untuk posisi ${application.position}?`,
        );

        if (!confirmed) return;

        router.delete(route('super-admin.recruitment.destroy', application.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedApplicant?.id === application.id) {
                    setDetailOpen(false);
                    setSelectedApplicant(null);
                }
            },
        });
    };

    const isHumanCapitalAdmin =
        auth.user?.role === 'Admin' &&
        typeof auth.user?.division === 'string' &&
        /human\s+(capital|resources)/i.test(auth.user.division ?? '');

    const breadcrumbs = isHumanCapitalAdmin
        ? [
              { label: 'Admin', href: route('admin-staff.dashboard') },
              { label: 'Recruitment & Onboarding' },
          ]
        : [
              { label: 'Super Admin', href: route('super-admin.dashboard') },
              { label: 'Recruitment & Onboarding' },
          ];

    // -----------------------------------------
    // RENDER PAGE
    // -----------------------------------------
    return (
        <>
            <Head title="Kelola Rekrutmen" />
            <SuperAdminLayout
                title="Recruitment & Onboarding"
                description="Kelola pelamar dan proses rekrutmen"
                breadcrumbs={breadcrumbs}
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
                            onDelete={handleDelete}
                            onStatusUpdate={handleStatusUpdate}
                            onReject={handleReject}        
                            isUpdatingStatus={isUpdatingStatus}
                            updatingApplicantId={updatingApplicantId}
                            onScheduleInterview={handleOpenScheduleDialog}
                        />
                    </TabsContent>

                    <TabsContent value="interviews">
                        <InterviewsTab interviews={interviews} />
                    </TabsContent>

                    <TabsContent value="onboarding">
                        <OnboardingTab items={onboarding} />
                    </TabsContent>
                </Tabs>

                <ApplicantDetailDialog
                    open={detailOpen}
                    onOpenChange={setDetailOpen}
                    applicant={selectedApplicant}
                />

                <ScheduleInterviewDialog
                    open={scheduleOpen}
                    onOpenChange={setScheduleOpen}
                    applicant={selectedApplicant}
                    onSuccessSubmit={handleScheduleSuccess}
                />
            </SuperAdminLayout>
        </>
    );
}
