import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import AccountForm from '@/Pages/SuperAdmin/components/accounts/AccountForm';
import { Head, Link, useForm } from '@inertiajs/react';
import { ReactNode, useEffect } from 'react';

interface CreateProps {
    roleOptions: string[];
    statusOptions: string[];
    divisionOptions: string[];
    religionOptions: string[];
    genderOptions: string[];
    educationLevelOptions: string[];
}

const today = new Date().toISOString().split('T')[0];

const roleRequiresDivision = (role: string) =>
    ['Admin', 'Staff'].includes(role);

export default function Create({
    roleOptions,
    statusOptions,
    divisionOptions,
    religionOptions,
    genderOptions,
    educationLevelOptions,
}: CreateProps) {
    const defaultRole = '';

    const form = useForm({
        name: '',
        email: '',
        role: defaultRole,
        division: '',
        religion: '',
        gender: '',
        education_level: '',
        status: statusOptions[0] ?? 'Active',
        registered_at: today,
        inactive_at: '',
        password: '',
        password_confirmation: '',
    });

    const showDivision = roleRequiresDivision(form.data.role);

    useEffect(() => {
        if (!roleRequiresDivision(form.data.role) && form.data.division) {
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
        form.post(route('super-admin.accounts.store'));
    };

    return (
        <SuperAdminLayout
            title="Tambah Akun"
            description="Buat akun baru untuk pengguna sistem"
            breadcrumbs={[
                { label: 'Super Admin', href: route('super-admin.dashboard') },
                { label: 'Kelola Akun', href: route('super-admin.accounts.index') },
                { label: 'Tambah Akun' },
            ]}
        >
            <Head title="Tambah Akun" />

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
                setData={(key, value) =>
                    form.setData(key, value ?? '')
                }
                onSubmit={handleSubmit}
                showDivision={showDivision}
                showPasswordFields
                submitLabel="Simpan Akun"
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
