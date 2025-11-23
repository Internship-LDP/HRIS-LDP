// src/Pages/SuperAdmin/Recruitment/types.ts

import { PageProps } from '@/types';

export type ApplicantStatus =
    | 'Applied'
    | 'Screening'
    | 'Interview'
    | 'Hired'
    | 'Rejected';

export type ApplicantActionHandler = (
    applicantId: number,
    newStatus: ApplicantStatus
) => void;

export type ApplicantRejectHandler = (id: number, reason: string) => void;

export interface ApplicantRecord {
    id: number;
    name: string;
    position: string;
    education?: string | null;
    experience?: string | null;
    profile_name?: string | null;
    profile_email?: string | null;
    profile_phone?: string | null;
    profile_address?: string | null;
    profile_city?: string | null;
    profile_province?: string | null;
    profile_gender?: string | null;
    profile_religion?: string | null;
    profile_date_of_birth?: string | null;
    educations?: ApplicantEducation[];
    experiences?: ApplicantExperience[];
    interview_date?: string | null;
    interview_time?: string | null;
    interview_mode?: 'Online' | 'Offline' | null;
    interviewer_name?: string | null;
    meeting_link?: string | null;
    interview_notes?: string | null;
    interview_end_time?: string | null;
    has_interview_schedule?: boolean;
    status: ApplicantStatus;
    date?: string | null;
    email: string;
    phone?: string | null;
    skills?: string | null;
    cv_file?: string | null;
    cv_url?: string | null;
    profile_photo_url?: string | null;
    rejection_reason?: string | null;
}

export interface ApplicantEducation {
    institution?: string | null;
    degree?: string | null;
    field_of_study?: string | null;
    start_year?: string | null;
    end_year?: string | null;
    gpa?: string | null;
}

export interface ApplicantExperience {
    company?: string | null;
    position?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    description?: string | null;
    is_current?: boolean;
}

export interface InterviewSchedule {
    application_id?: number;
    candidate: string;
    position: string;
    date: string;
    date_value?: string | null;
    time: string;
    end_time?: string | null;
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

export const formatApplicationId = (id: number) =>
    `APL${String(id).padStart(3, '0')}`;
