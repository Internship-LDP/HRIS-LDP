// src/Pages/SuperAdmin/Recruitment/types.ts

import { PageProps } from '@/types';

export type ApplicantStatus =
    | 'Applied'
    | 'Screening'
    | 'Interview'
    | 'Hired'
    | 'Rejected';

// HANDLER: Perubahan status biasa
export type ApplicantActionHandler = (
    applicantId: number,
    newStatus: ApplicantStatus
) => void;

// HANDLER: Khusus Rejected 
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
    status: ApplicantStatus;
    date?: string | null;
    email: string;
    phone?: string | null;
    skills?: string | null;
<<<<<<< HEAD
    cv_file?: string | null;
    cv_url?: string | null;
    profile_photo_url?: string | null;
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
=======

    // CV
    cv_file?: string | null; 
    cv_url?: string | null;  

    // REJECTED
    rejection_reason?: string | null;
>>>>>>> f746606485b0c9e4eb6ef7169795345a5c84f7b8
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

<<<<<<< HEAD
export const formatApplicationId = (id: number) => `APL${String(id).padStart(3, '0')}`;
=======
export const formatApplicationId = (id: number) =>
    `APL${String(id).padStart(3, '0')}`;

>>>>>>> f746606485b0c9e4eb6ef7169795345a5c84f7b8
