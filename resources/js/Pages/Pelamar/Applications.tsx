import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import PelamarLayout from '@/Pages/Pelamar/Layout';
import ApplicationForm, {
    ApplicationFormData,
} from '@/Pages/Pelamar/components/applications/ApplicationForm';
import ApplicationHistory, {
    ApplicationHistoryItem,
} from '@/Pages/Pelamar/components/applications/ApplicationHistory';
import { FormEvent, useEffect } from 'react';
import { PageProps } from '@/types';

type ApplicationsPageProps = PageProps<{
    applications: ApplicationHistoryItem[];
    defaultForm: {
        full_name: string;
        email: string;
        phone: string;
    };
    positionOptions: string[];
    flash?: {
        success?: string;
    };
}>;

export default function Applications({
    applications,
    defaultForm,
    positionOptions,
    flash,
}: ApplicationsPageProps) {
    const form = useForm<ApplicationFormData>({
        full_name: defaultForm.full_name ?? '',
        email: defaultForm.email ?? '',
        phone: defaultForm.phone ?? '',
        position: positionOptions[0] ?? '',
        education: '',
        experience: '',
        skills: '',
        cv: null,
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    const handleSetData = <K extends keyof ApplicationFormData>(
        field: K,
        value: ApplicationFormData[K],
    ) => {
        form.setData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(route('pelamar.applications.store'), {
            forceFormData: true,
            onSuccess: () => {
                form.reset('education', 'experience', 'skills', 'cv');
                toast.success('Lamaran berhasil dikirim', {
                    description: 'Tim rekrutmen akan meninjau berkas Anda.',
                });
            },
        });
    };

    return (
        <>
            <Head title="Lamaran Saya" />
            <PelamarLayout
                title="Lamaran Saya"
                description="Kelola lamaran dan dokumen Anda"
                breadcrumbs={['Recruitment', 'Lamaran Saya']}
            >
                <ApplicationForm
                    positions={positionOptions}
                    data={form.data}
                    errors={form.errors}
                    processing={form.processing}
                    setData={handleSetData}
                    onSubmit={handleSubmit}
                />
                <ApplicationHistory items={applications} />
            </PelamarLayout>
        </>
    );
}
