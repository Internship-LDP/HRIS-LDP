import { PageProps } from '@/types';

export type StaffMember = {
    id: number;
    name: string;
    email: string;
    position: string;
    join_date: string | null;
};

export type DivisionRecord = {
    id: number;
    name: string;
    description: string | null;
    manager_name: string | null;
    capacity: number;
    current_staff: number;
    available_slots: number;
    is_hiring: boolean;
    job_title: string | null;
    job_description: string | null;
    job_requirements: string[];
    staff: StaffMember[];
};

export type StatsSummary = {
    total_divisions: number;
    total_staff: number;
    active_vacancies: number;
    available_slots: number;
};

export type KelolaDivisiPageProps = PageProps<{
    divisions: DivisionRecord[];
    stats: StatsSummary;
    flash?: {
        success?: string;
        error?: string;
    };
}>;
