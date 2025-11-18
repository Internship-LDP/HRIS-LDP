import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import AccountForm from '@/Pages/SuperAdmin/components/accounts/AccountForm';
import { Head, Link, useForm } from '@inertiajs/react';
import { ReactNode, useEffect } from 'react';

interface EditProps {
    user: {
        id: number;
        employee_code?: string | null;
        name: string;
        email: string;
        role: string;
        division?: string | null;
        religion?: string | null;
        gender?: string | null;
        education_level?: string | null;
        status: string;
        registered_at?: string | null;
        inactive_at?: string | null;
    };
    roleOptions: string[];
    statusOptions: string[];
    divisionOptions: string[];
    religionOptions: string[];
    genderOptions: string[];
    educationLevelOptions: string[];
}

const roleRequiresDivision = (role: string) =>
    ['Admin', 'Staff'].includes(role);

export default function Edit({
    user,
    roleOptions,
    statusOptions,
    divisionOptions,
    religionOptions,
    genderOptions,
    educationLevelOptions,
}: EditProps) {
    const form = useForm({
        employee_code: user.employee_code ?? '',
        name: user.name,
        email: user.email,
        role: user.role,
        division: user.division ?? '',
        religion: user.religion ?? '',
        gender: user.gender ?? '',
        education_level: user.education_level ?? '',
        status: user.status,
        registered_at: user.registered_at ?? '',
        inactive_at: user.inactive_at ?? '',
        password: '',
        password_confirmation: '',
    });

    const showDivision = roleRequiresDivision(form.data.role);

    useEffect(() => {
        if (!roleRequiresDivision(form.data.role)) {
            form.setData('division', '');
        }
    }, [form.data.role]);

    useEffect(() => {
        if (form.data.role === 'Staff') {
            return;
        }

        if (form.data.religion) {
            form.setData('religion', '');
        }
        if (form.data.gender) {
            form.setData('gender', '');
        }
        if (form.data.education_level) {
            form.setData('education_level', '');
        }
    }, [form.data.role, form.data.religion, form.data.gender, form.data.education_level]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(route('super-admin.accounts.update', user.id));
    };

    return (
        <SuperAdminLayout
            title="Edit Akun"
            description={`Perbarui informasi akun ${user.name}`}
            breadcrumbs={[
                { label: 'Super Admin', href: route('super-admin.dashboard') },
                { label: 'Kelola Akun', href: route('super-admin.accounts.index') },
                { label: 'Edit Akun' },
            ]}
        >
            <Head title="Edit Akun" />

            <AccountForm
                data={form.data}
                errors={form.errors}
                processing={form.processing}
                roleOptions={roleOptions}
                divisionOptions={divisionOptions}
                statusOptions={statusOptions}
                religionOptions={religionOptions}
                genderOptions={genderOptions}
                educationLevelOptions={educationLevelOptions}
                setData={(key, value) => form.setData(key, value ?? '')}
                onSubmit={handleSubmit}
                showDivision={showDivision}
                showPasswordFields
                submitLabel="Perbarui Akun"
                secondaryAction={
                    <ButtonLink href={route('super-admin.accounts.index')}>
                        Kembali ke daftar
                    </ButtonLink>
                }
            />
        </SuperAdminLayout>
    );
}

function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link
            href={href}
            className="text-sm text-blue-900 underline-offset-2 hover:underline"
        >
            {children}
        </Link>
    );
}
