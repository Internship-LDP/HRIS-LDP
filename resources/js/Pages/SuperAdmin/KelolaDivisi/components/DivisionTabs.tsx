import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import { DivisionRecord, StaffMember } from '../types';
import {
    AlertCircle,
    Briefcase,
    Building2,
    CheckCircle2,
    Edit,
    Settings,
    XCircle,
} from 'lucide-react';

type DivisionTabsProps = {
    divisions: DivisionRecord[];
    activeDivisionId: string;
    onTabChange: (value: string) => void;
    onEditDivision: (division: DivisionRecord) => void;
    onOpenJobDialog: (division: DivisionRecord) => void;
    onCloseJob: (division: DivisionRecord) => void;
};

export function DivisionTabs({
    divisions,
    activeDivisionId,
    onTabChange,
    onEditDivision,
    onOpenJobDialog,
    onCloseJob,
}: DivisionTabsProps) {
    return (
        <Tabs value={activeDivisionId} onValueChange={onTabChange}>
            <TabsList className="w-full justify-start overflow-auto">
                {divisions.map((division) => (
                    <TabsTrigger
                        key={division.id}
                        value={division.id.toString()}
                        className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-900 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
                    >
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-800" />
                            <span
                                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                    division.is_hiring
                                        ? 'bg-green-100 text-green-700'
                                        : 'text-slate-700'
                                }`}
                            >
                                {division.name}
                            </span>
                        </div>
                    </TabsTrigger>
                ))}
            </TabsList>

            {divisions.map((division) => (
                <TabsContent key={division.id} value={division.id.toString()} className="space-y-6 pt-6">
                    <DivisionHeader division={division} onEdit={() => onEditDivision(division)} />
                    <DivisionOverview division={division} />
                    <DivisionStaffTable staff={division.staff} />
                    <DivisionVacancySection
                        division={division}
                        onOpenJob={() => onOpenJobDialog(division)}
                        onCloseJob={() => onCloseJob(division)}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
}

function DivisionHeader({ division, onEdit }: { division: DivisionRecord; onEdit: () => void }) {
    return (
        <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-blue-900">{division.name}</h3>
                        {division.is_hiring && (
                            <Badge className="bg-green-600 hover:bg-green-600">
                                <Briefcase className="mr-1 h-3 w-3" />
                                Lowongan Terbuka
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-slate-600">
                        {division.description ?? 'Belum ada deskripsi.'}
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                        Manager:{' '}
                        <span className="font-medium text-slate-900">
                            {division.manager_name ?? 'Belum ditentukan'}
                        </span>
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan
                </Button>
            </div>
        </div>
    );
}

function DivisionOverview({ division }: { division: DivisionRecord }) {
    const ratio =
        division.capacity > 0
            ? Math.min((division.current_staff / division.capacity) * 100, 100)
            : 0;
    const capacityStatus =
        division.available_slots <= 0
            ? { color: 'text-red-600', bg: 'bg-red-100' }
            : division.capacity > 0 && division.current_staff / division.capacity >= 0.8
              ? { color: 'text-orange-600', bg: 'bg-orange-100' }
              : { color: 'text-green-600', bg: 'bg-green-100' };

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600">Kapasitas Staff</p>
                    <Badge className={`${capacityStatus.bg} ${capacityStatus.color}`}>
                        {division.current_staff}/{division.capacity}
                    </Badge>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div
                        className={`h-2 rounded-full ${
                            division.available_slots === 0
                                ? 'bg-red-500'
                                : division.capacity > 0 && division.current_staff / division.capacity >= 0.8
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                        }`}
                        style={{ width: `${ratio}%` }}
                    />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                    {division.available_slots > 0 ? (
                        <span className="text-green-600">
                            <CheckCircle2 className="mr-1 inline h-3 w-3" />
                            {division.available_slots} slot tersedia
                        </span>
                    ) : (
                        <span className="text-red-600">
                            <XCircle className="mr-1 inline h-3 w-3" />
                            Kapasitas penuh
                        </span>
                    )}
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Total Staff" value={`${division.current_staff} orang`} />
                <InfoCard label="Slot Tersedia" value={`${division.available_slots} slot`} />
                <InfoCard label="Status Rekrutmen" value={division.is_hiring ? 'Aktif' : 'Tidak Aktif'} />
                <InfoCard label="Manager" value={division.manager_name ?? '-'} />
            </div>
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs text-slate-600">{label}</p>
            <p className="mt-2 font-semibold text-blue-900">{value}</p>
        </div>
    );
}

function DivisionStaffTable({ staff }: { staff: StaffMember[] }) {
    if (staff.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-slate-500">
                Belum ada staff pada divisi ini.
            </div>
        );
    }

    return (
        <div className="rounded-xl border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Posisi</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tanggal Bergabung</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staff.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.position}</TableCell>
                            <TableCell className="text-slate-600">{member.email}</TableCell>
                            <TableCell className="text-slate-600">{member.join_date ?? '-'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function DivisionVacancySection({
    division,
    onOpenJob,
    onCloseJob,
}: {
    division: DivisionRecord;
    onOpenJob: () => void;
    onCloseJob: () => void;
}) {
    if (division.is_hiring && division.job_title) {
        return (
            <div className="space-y-4 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h4 className="text-lg font-semibold text-green-900">{division.job_title}</h4>
                        <p className="text-sm text-slate-700">{division.job_description}</p>
                        {division.job_requirements.length > 0 && (
                            <ul className="mt-3 space-y-1 text-sm text-slate-700">
                                {division.job_requirements.map((requirement, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                                        <span>{requirement}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={onOpenJob}>
                            <Edit className="mr-2 h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Lowongan?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Lowongan akan ditutup dan tidak lagi muncul pada portal pelamar.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={onCloseJob}
                                        className="bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-dashed p-6 text-center">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="font-medium text-slate-900">Tidak ada lowongan aktif</p>
            <p className="mt-1 text-sm text-slate-600">
                {division.available_slots > 0
                    ? 'Masih tersedia slot. Anda dapat membuka lowongan baru.'
                    : 'Kapasitas penuh. Tingkatkan kapasitas untuk membuka lowongan.'}
            </p>
            <div className="mt-4 flex justify-center">
                <Button
                    onClick={onOpenJob}
                    disabled={division.available_slots === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60"
                >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Buka Lowongan Baru
                </Button>
            </div>
            {division.available_slots === 0 && (
                <div className="mt-4 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                    <AlertCircle className="mr-2 inline h-4 w-4" />
                    Kapasitas sudah penuh. Edit kapasitas divisi terlebih dahulu.
                </div>
            )}
        </div>
    );
}
