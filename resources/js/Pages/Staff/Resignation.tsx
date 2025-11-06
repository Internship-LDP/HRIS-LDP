import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, Clock, FileText, UserMinus } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Progress } from '@/Components/ui/progress';
import StaffLayout from '@/Pages/Staff/components/Layout';
import type { PageProps } from '@/types';

interface ProfileInfo {
    name: string;
    employeeCode?: string | null;
    division?: string | null;
    position?: string | null;
    joinedAt?: string | null;
    joinedDisplay?: string;
}

interface TerminationRecord {
    reference: string;
    status: string;
    progress: number | null;
    requestDate: string;
    effectiveDate: string;
    reason?: string | null;
    suggestion?: string | null;
    type?: string;
}

interface ResignationPageProps extends Record<string, unknown> {
    profile: ProfileInfo;
    activeRequest: TerminationRecord | null;
    history: TerminationRecord[];
}

export default function StaffResignation() {
    const {
        props: { profile, activeRequest, history },
    } = usePage<PageProps<ResignationPageProps>>();

    const form = useForm({
        effective_date: '',
        reason: '',
        suggestion: '',
        confirmation: false,
    });

    const submit = () => {
        form.post(route('staff.resignation.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Head title="Pengajuan Resign" />
            <StaffLayout
                title="Pengajuan Resign"
                description="Ajukan permohonan resign dan pantau proses offboarding Anda."
                breadcrumbs={[
                    { label: 'Dashboard', href: route('staff.dashboard') },
                    { label: 'Pengajuan Resign' },
                ]}
            >
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold text-blue-900">
                            Form Pengajuan Resign
                        </h2>
                        <p className="text-sm text-slate-500">
                            Data pribadi otomatis terisi sesuai profil Anda.
                        </p>
                        <div className="mt-5 space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    label="Nama Lengkap"
                                    value={profile.name}
                                    disabled
                                />
                                <FormField
                                    label="ID Karyawan"
                                    value={profile.employeeCode ?? '-'}
                                    disabled
                                />
                                <FormField
                                    label="Divisi"
                                    value={profile.division ?? '-'}
                                    disabled
                                />
                                <FormField
                                    label="Posisi"
                                    value={profile.position ?? '-'}
                                    disabled
                                />
                                <div>
                                    <Label>Tanggal Bergabung</Label>
                                    <Input
                                        type="date"
                                        value={profile.joinedAt ?? ''}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <Label>Tanggal Efektif Resign</Label>
                                    <Input
                                        type="date"
                                        value={form.data.effective_date}
                                        onChange={(event) =>
                                            form.setData('effective_date', event.target.value)
                                        }
                                    />
                                    {form.errors.effective_date && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.effective_date}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label>Alasan Resign</Label>
                                <Textarea
                                    rows={4}
                                    placeholder="Jelaskan alasan Anda mengajukan resign..."
                                    value={form.data.reason}
                                    onChange={(event) => form.setData('reason', event.target.value)}
                                />
                                {form.errors.reason && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {form.errors.reason}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label>Saran untuk Perusahaan (Opsional)</Label>
                                <Textarea
                                    rows={3}
                                    placeholder="Berikan saran atau masukan..."
                                    value={form.data.suggestion}
                                    onChange={(event) =>
                                        form.setData('suggestion', event.target.value)
                                    }
                                />
                                {form.errors.suggestion && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {form.errors.suggestion}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <Checkbox
                                    id="confirm"
                                    checked={form.data.confirmation}
                                    onCheckedChange={(checked) =>
                                        form.setData('confirmation', Boolean(checked))
                                    }
                                />
                                <Label htmlFor="confirm" className="text-sm font-medium text-slate-700">
                                    Saya memahami bahwa pengajuan resign ini akan diproses sesuai kebijakan
                                    perusahaan.
                                </Label>
                            </div>
                            {form.errors.confirmation && (
                                <p className="text-xs text-red-500">{form.errors.confirmation}</p>
                            )}
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    className="bg-blue-900 hover:bg-blue-800"
                                    onClick={submit}
                                    disabled={form.processing}
                                >
                                    {form.processing ? 'Mengirim...' : 'Submit Pengajuan'}
                                </Button>
                                <Button variant="outline" onClick={() => form.reset()} disabled={form.processing}>
                                    Reset Form
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <InfoCard
                            icon={<FileText className="h-5 w-5 text-blue-900" />}
                            title="Masa Pemberitahuan"
                            description="Minimal 30 hari sebelum tanggal efektif resign."
                            color="bg-blue-50 border-blue-200"
                        />
                        <InfoCard
                            icon={<Clock className="h-5 w-5 text-amber-900" />}
                            title="Serah Terima"
                            description="Selesaikan pekerjaan dan dokumentasi sebelum tanggal akhir."
                            color="bg-amber-50 border-amber-200"
                        />
                        <InfoCard
                            icon={<CheckCircle className="h-5 w-5 text-green-900" />}
                            title="Exit Interview"
                            description="Tim HRD akan menjadwalkan exit interview setelah pengajuan disetujui."
                            color="bg-green-50 border-green-200"
                        />
                    </div>
                </div>

                <Card className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-blue-900">
                                Status Pengajuan
                            </h2>
                            <p className="text-sm text-slate-500">
                                Monitor progres resign dan riwayat pengajuan Anda.
                            </p>
                        </div>
                        {activeRequest && (
                            <Badge variant="outline" className="border-blue-500 text-blue-700">
                                Aktif: {activeRequest.reference}
                            </Badge>
                        )}
                    </div>

                    {activeRequest ? (
                        <div className="mt-4 rounded-lg border border-slate-200 p-4">
                            <div className="grid gap-4 md:grid-cols-4">
                                <DetailInfo label="Referensi" value={activeRequest.reference} />
                                <DetailInfo label="Diajukan" value={activeRequest.requestDate} />
                                <DetailInfo label="Efektif" value={activeRequest.effectiveDate} />
                                <DetailInfo label="Status" value={activeRequest.status} />
                            </div>
                            <div className="mt-4">
                                <Label className="text-xs uppercase text-slate-500">Progress</Label>
                                <Progress value={activeRequest.progress ?? 0} className="mt-2" />
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-slate-500">
                            Belum ada pengajuan yang berjalan.
                        </p>
                    )}

                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-slate-700">Riwayat Pengajuan</h3>
                        <div className="mt-3">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Referensi</TableHead>
                                        <TableHead>Diajukan</TableHead>
                                        <TableHead>Efektif</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-sm text-slate-500">
                                                Belum ada riwayat sebelumnya.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {history.map((record) => (
                                        <TableRow key={record.reference}>
                                            <TableCell className="font-semibold text-slate-900">
                                                {record.reference}
                                            </TableCell>
                                            <TableCell>{record.requestDate}</TableCell>
                                            <TableCell>{record.effectiveDate}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={record.status} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Card>
            </StaffLayout>
        </>
    );
}

function FormField({
    label,
    value,
    disabled = false,
}: {
    label: string;
    value: string;
    disabled?: boolean;
}) {
    return (
        <div>
            <Label>{label}</Label>
            <Input value={value} disabled={disabled} readOnly />
        </div>
    );
}

function InfoCard({
    icon,
    title,
    description,
    color,
}: {
    icon: JSX.Element;
    title: string;
    description: string;
    color: string;
}) {
    return (
        <div className={`rounded-lg border p-4 ${color}`}>
            <div className="flex items-center gap-3">
                {icon}
                <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="text-xs text-slate-600">{description}</p>
                </div>
            </div>
        </div>
    );
}

function DetailInfo({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();

    if (normalized.includes('selesai')) {
        return (
            <Badge variant="outline" className="border-green-500 text-green-600">
                {status}
            </Badge>
        );
    }

    if (normalized.includes('proses') || normalized.includes('menunggu')) {
        return (
            <Badge variant="outline" className="border-amber-500 text-amber-600">
                {status}
            </Badge>
        );
    }

    return <Badge variant="outline">{status}</Badge>;
}
