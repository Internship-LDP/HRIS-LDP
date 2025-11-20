// src/Pages/SuperAdmin/Recruitment/types.ts

import { PageProps } from '@/types';

export type ApplicantStatus =
    | 'Applied'
    | 'Screening'
    | 'Interview'
    | 'Hired'
    | 'Rejected';

// DEFINISI TIPE: Untuk handler aksi perubahan status
export type ApplicantActionHandler = (applicantId: number, newStatus: ApplicantStatus) => void;

export interface ApplicantRecord {
    id: number;
    name: string;
    position: string;
    education?: string | null;
    experience?: string | null;
    status: ApplicantStatus;
    date?: string | null;
    email: string;
    phone?: string | null;
    skills?: string | null;
    cv_file?: string | null;
    cv_url?: string | null;
    profile_photo_url?: string | null;
}

export interface InterviewSchedule {
    candidate: string;
    position: string;
    date: string;
    time: string;
    mode: 'Online' | 'Offline';
    interviewer: string;
}

export interface OnboardingItem {
    name: string;
    position: string;
    startedAt: string;
    status: 'Selesai' | 'In Progress';
    steps: Array<{
        label: string;
        complete: boolean;
        pending?: boolean;
    }>;
}

export type RecruitmentPageProps = PageProps<{
    applications: ApplicantRecord[];
    statusOptions: string[];
    interviews: InterviewSchedule[];
    onboarding: OnboardingItem[];
}>;

export type StatusSummary = Partial<Record<ApplicantStatus, number>>;

export const formatApplicationId = (id: number) => `APL${String(id).padStart(3, '0')}`;