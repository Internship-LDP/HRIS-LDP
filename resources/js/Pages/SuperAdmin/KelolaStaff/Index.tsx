import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import StatsCards from '@/Pages/SuperAdmin/KelolaStaff/components/StatsCards';
import TerminationDialog from '@/Pages/SuperAdmin/KelolaStaff/components/TerminationDialog';
import ActiveTerminationsTable from '@/Pages/SuperAdmin/KelolaStaff/components/ActiveTerminationsTable';
import InactiveEmployeesCard from '@/Pages/SuperAdmin/KelolaStaff/components/InactiveEmployeesCard';
import type { KelolaStaffPageProps } from '@/Pages/SuperAdmin/KelolaStaff/types';

export default function KelolaStaffIndex() {
    const {
        props: { auth, stats, terminations, inactiveEmployees, checklistTemplate },
    } = usePage<KelolaStaffPageProps>();
    const isHumanCapitalAdmin =
        auth.user?.role === 'Admin' &&
        typeof auth.user?.division === 'string' &&
        /human\s+(capital|resources)/i.test(auth.user.division ?? '');
    const breadcrumbs = isHumanCapitalAdmin
        ? [
              { label: 'Admin', href: route('admin-staff.dashboard') },
              { label: 'Kelola Staff' },
          ]
        : [
              { label: 'Super Admin', href: route('super-admin.dashboard') },
              { label: 'Kelola Staff' },
          ];

    const archiveEmployees = terminations.archive.map((item) => ({
        id: item.id,
        name: item.employeeName,
        employeeCode: item.employeeCode,
        division: item.division,
        position: item.position,
        joinDate: item.requestDate,
        exitDate: item.effectiveDate,
        exitReason: item.reason,
        type: item.type,
    }));

    return (
        <SuperAdminLayout
            title='Termination & Offboarding'
            description='Kelola proses resign, PHK, dan offboarding karyawan'
            breadcrumbs={breadcrumbs}
            actions={<TerminationDialog />}
        >
            <Head title='Kelola Staff' />

            <StatsCards stats={stats} />

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                <Card className='p-6 lg:col-span-2'>
                    <div className='mb-4 flex items-center justify-between'>
                        <div>
                            <h3 className='text-lg font-semibold text-blue-900'>
                                Proses Offboarding Aktif
                            </h3>
                            <p className='text-sm text-slate-500'>
                                Pantau pengajuan termination yang sedang berjalan
                            </p>
                        </div>
                        <Badge variant='outline' className='text-blue-700'>
                            {terminations.active.length} records
                        </Badge>
                    </div>
                    <ActiveTerminationsTable
                        terminations={terminations.active}
                        checklistTemplate={checklistTemplate}
                    />
                </Card>

                <Card className='space-y-4 p-6'>
                    <h3 className='text-lg font-semibold text-blue-900'>
                        Informasi Penting
                    </h3>
                    <InfoCard
                        icon={<Calendar className='h-4 w-4 text-blue-600' />}
                        text='Masa pemberitahuan minimal 30 hari sebelum tanggal efektif resign.'
                        variant='info'
                    />
                    <InfoCard
                        icon={<AlertCircle className='h-4 w-4 text-yellow-600' />}
                        text='Pastikan serah terima pekerjaan dan inventaris selesai sebelum exit.'
                        variant='warning'
                    />
                    <InfoCard
                        icon={<CheckCircle className='h-4 w-4 text-green-600' />}
                        text='Exit interview dijadwalkan otomatis setelah pengajuan disetujui.'
                        variant='success'
                    />
                </Card>
            </div>

            <InactiveEmployeesCard
                employees={archiveEmployees.length ? archiveEmployees : inactiveEmployees}
            />
        </SuperAdminLayout>
    );
}

function InfoCard({
    icon,
    text,
    variant,
}: {
    icon: ReactNode;
    text: string;
    variant: 'info' | 'warning' | 'success';
}) {
    const colors =
        variant === 'info'
            ? 'bg-blue-50 border-blue-200'
            : variant === 'warning'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200';

    return (
        <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${colors}`}>
            <div>{icon}</div>
            <p className='text-slate-700'>{text}</p>
        </div>
    );
}
