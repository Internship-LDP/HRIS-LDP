import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import { useState } from 'react';
import {
    Search,
    Filter,
    UserPlus,
    Calendar as CalendarIcon,
    FileText,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { PageProps } from '@/types';

type ApplicantStatus =
    | 'Applied'
    | 'Screening'
    | 'Interview'
    | 'Hired'
    | 'Rejected';

interface ApplicantRecord {
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
}

interface InterviewSchedule {
    candidate: string;
    position: string;
    date: string;
    time: string;
    mode: 'Online' | 'Offline';
    interviewer: string;
}

interface OnboardingItem {
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
type RecruitmentPageProps = PageProps<{
    applications: ApplicantRecord[];
    statusOptions: string[];
}>;

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
const statusBadge = (status: ApplicantStatus) => {
    switch (status) {
        case 'Applied':
            return (
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                    Applied
                </Badge>
            );
        case 'Screening':
            return (
                <Badge
                    variant="outline"
                    className="border-orange-500 text-orange-500"
                >
                    Screening
                </Badge>
            );
        case 'Interview':
            return (
                <Badge
                    variant="outline"
                    className="border-purple-500 text-purple-500"
                >
                    Interview
                </Badge>
            );
        case 'Hired':
            return (
                <Badge
                    variant="outline"
                    className="border-green-500 text-green-500"
                >
                    Hired
                </Badge>
            );
        case 'Rejected':
            return (
                <Badge variant="outline" className="border-red-500 text-red-500">
                    Rejected
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const formatApplicationId = (id: number) =>
    `APL${String(id).padStart(3, '0')}`;
export default function RecruitmentIndex({
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
    const statusOrder: ApplicantStatus[] = [
        'Applied',
        'Screening',
        'Interview',
        'Hired',
        'Rejected',
    ];
    const statusSummary = applications.reduce(
        (acc, application) => {
            acc[application.status] = (acc[application.status] ?? 0) + 1;
            return acc;
        },
        {} as Partial<Record<ApplicantStatus, number>>,
    );
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
            actions={
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800">
                            <UserPlus className="h-4 w-4" />
                            Tambah Pelamar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Tambah Pelamar Baru</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nama Lengkap</Label>
                                <Input placeholder="Nama pelamar" />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input type="email" placeholder="email@example.com" />
                            </div>
                            <div>
                                <Label>Posisi</Label>
                                <Input placeholder="Software Engineer" />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="applied">Applied</SelectItem>
                                        <SelectItem value="screening">Screening</SelectItem>
                                        <SelectItem value="interview">Interview</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Label>Catatan</Label>
                                <Textarea placeholder="Tambahkan catatan singkat" />
                            </div>
                            <div className="col-span-2">
                                <Button className="bg-blue-900 hover:bg-blue-800">
                                    Simpan
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            }
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                    <TabsTrigger value="applicants">Daftar Pelamar</TabsTrigger>
                    <TabsTrigger value="interviews">Jadwal Interview</TabsTrigger>
                    <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
                </TabsList>

                <TabsContent value="applicants">
                    <Card className="space-y-6 p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-2 shadow-sm md:w-auto">
                                <Search className="h-4 w-4 text-slate-500" />
                                <Input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Cari pelamar, posisi, atau email"
                                    className="border-none p-0 shadow-none focus-visible:ring-0"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Filter className="h-4 w-4 text-slate-500" />
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Semua status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-5">
                            {statusOrder.map((status) => (
                                <div
                                    key={status}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        {status}
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold text-blue-900">
                                        {statusSummary[status] ?? 0}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>ID Lamaran</TableHead>
                                        <TableHead>Pelamar</TableHead>
                                        <TableHead>Posisi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleApplications.map((application) => (
                                        <TableRow key={application.id}>
                                            <TableCell className="font-semibold text-blue-900">
                                                {formatApplicationId(application.id)}
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium text-slate-900">
                                                    {application.name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {application.email}
                                                </p>
                                            </TableCell>
                                            <TableCell>{application.position}</TableCell>
                                            <TableCell>{statusBadge(application.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewDetail(application)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon">
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon">
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {visibleApplications.length === 0 ? (
                                <div className="p-6 text-center text-sm text-slate-500">
                                    Tidak ada pelamar yang sesuai dengan filter.
                                </div>
                            ) : null}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="interviews">
                    <Card className="space-y-6 p-6">
                        <div className="grid gap-4">
                            {interviewsSeed.map((interview) => (
                                <div
                                    key={`${interview.candidate}-${interview.position}-${interview.time}`}
                                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">
                                                {interview.position}
                                            </p>
                                            <p className="text-lg font-semibold text-blue-900">
                                                {interview.candidate}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                                                <span className="inline-flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    {interview.date} • {interview.time}
                                                </span>
                                                <span className="inline-flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {interview.mode}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm text-slate-500">
                                                Interviewer
                                                <p className="font-medium text-slate-900">
                                                    {interview.interviewer}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Eye className="h-4 w-4" />
                                                Detail
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="onboarding">
                    <Card className="space-y-6 p-6">
                        <div className="grid gap-4">
                            {onboardingSeed.map((item) => (
                                <div
                                    key={`${item.name}-${item.position}`}
                                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {item.name} - {item.position}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                Mulai: {item.startedAt}
                                            </p>
                                        </div>
                                        <Badge
                                            className={
                                                item.status === 'Selesai'
                                                    ? 'bg-green-500'
                                                    : 'bg-orange-500'
                                            }
                                        >
                                            {item.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {item.steps.map((step) => (
                                            <div
                                                key={step.label}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                {step.complete ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : step.pending ? (
                                                    <Clock className="h-4 w-4 text-orange-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-slate-300" />
                                                )}
                                                <span
                                                    className={
                                                        step.complete
                                                            ? 'text-slate-700'
                                                            : step.pending
                                                                ? 'text-slate-400'
                                                                : 'text-slate-600'
                                                    }
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detail Pelamar</DialogTitle>
                    </DialogHeader>
                    {selectedApplicant ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <Detail
                                label="ID Lamaran"
                                value={formatApplicationId(selectedApplicant.id)}
                            />
                            <Detail label="Nama" value={selectedApplicant.name} />
                            <Detail label="Posisi" value={selectedApplicant.position} />
                            <Detail label="Email" value={selectedApplicant.email} />
                            <Detail label="Telepon" value={selectedApplicant.phone} />
                            <Detail
                                label="Pendidikan"
                                value={selectedApplicant.education}
                            />
                            <Detail
                                label="Pengalaman"
                                value={selectedApplicant.experience}
                            />
                            <Detail label="Status" value={selectedApplicant.status} />
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Pilih pelamar untuk melihat detail.
                        </p>
                    )}
                </DialogContent>
            </Dialog>
        </SuperAdminLayout>
    );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="font-medium text-slate-900">{value ?? '-'}</p>
        </div>
    );
}
