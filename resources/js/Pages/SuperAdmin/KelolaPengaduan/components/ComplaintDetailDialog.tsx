import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import type { ComplaintRecord, Option } from '../types';

interface ComplaintDetailDialogProps {
    complaint: ComplaintRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    statusOptions: Option[];
    priorityOptions: Option[];
}

export default function ComplaintDetailDialog({
    complaint,
    open,
    onOpenChange,
    statusOptions,
    priorityOptions,
}: ComplaintDetailDialogProps) {
    const form = useForm({
        status: complaint?.status ?? '',
        priority: complaint?.priority ?? '',
        resolution_notes: complaint?.resolutionNotes ?? '',
    });

    useEffect(() => {
        if (complaint) {
            form.setData({
                status: complaint.status,
                priority: complaint.priority,
                resolution_notes: complaint.resolutionNotes ?? '',
            });
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [complaint?.id]);

    const handleSubmit = () => {
        if (!complaint) {
            return;
        }

        form.patch(route('super-admin.complaints.update', complaint.id), {
            preserveScroll: true,
            onSuccess: () => {
                form.clearErrors();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Detail Pengaduan</DialogTitle>
                    {complaint && (
                        <DialogDescription className="text-xs uppercase tracking-wide text-slate-500">
                            ID Pengaduan {complaint.code}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {complaint && (
                    <div className="space-y-6">
                        <section className="grid gap-4 md:grid-cols-2">
                            <DetailItem label="Pelapor">
                                <span className="font-semibold text-slate-900">
                                    {complaint.reporter}
                                </span>
                                {complaint.reporterEmail && (
                                    <span className="text-xs text-slate-500">
                                        {complaint.reporterEmail}
                                    </span>
                                )}
                            </DetailItem>
                            <DetailItem label="Tanggal Pengaduan">
                                {complaint.submittedAt ?? '-'}
                            </DetailItem>
                            <DetailItem label="Kategori">{complaint.category}</DetailItem>
                            <DetailItem label="Prioritas">
                                {complaint.priorityLabel}
                            </DetailItem>
                        </section>

                        <section className="space-y-3">
                            <div>
                                <Label className="text-xs uppercase text-slate-500">
                                    Subjek
                                </Label>
                                <p className="text-sm font-semibold text-slate-900">
                                    {complaint.subject}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs uppercase text-slate-500">
                                    Deskripsi
                                </Label>
                                <p className="whitespace-pre-wrap text-sm text-slate-700">
                                    {complaint.description ?? '-'}
                                </p>
                            </div>
                            {complaint.attachment?.url && (
                                <div>
                                    <Label className="text-xs uppercase text-slate-500">
                                        Lampiran
                                    </Label>
                                    <a
                                        href={complaint.attachment.url}
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900 hover:underline"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-900">
                                            {complaint.attachment.name ?? 'Lihat Lampiran'}
                                        </Badge>
                                    </a>
                                </div>
                            )}
                        </section>

                        <section className="space-y-4 rounded-lg border border-slate-200 p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Status Tindak Lanjut</Label>
                                    <Select
                                        value={form.data.status}
                                        onValueChange={(value) => form.setData('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.status && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.status}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Prioritas</Label>
                                    <Select
                                        value={form.data.priority}
                                        onValueChange={(value) => form.setData('priority', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih prioritas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {priorityOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.priority && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.priority}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label>Catatan Penanganan</Label>
                                <Textarea
                                    rows={4}
                                    value={form.data.resolution_notes}
                                    onChange={(event) =>
                                        form.setData('resolution_notes', event.target.value)
                                    }
                                    placeholder="Tulis tanggapan atau tindak lanjut untuk pengaduan ini..."
                                />
                                {form.errors.resolution_notes && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {form.errors.resolution_notes}
                                    </p>
                                )}
                            </div>

                            {complaint.resolvedAt && (
                                <p className="text-xs text-emerald-600">
                                    Ditandai selesai pada {complaint.resolvedAt}
                                </p>
                            )}
                        </section>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Tutup
                            </Button>
                            <Button
                                type="button"
                                className="bg-blue-900 hover:bg-blue-800"
                                disabled={form.processing}
                                onClick={handleSubmit}
                            >
                                {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailItem({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
                {label}
            </p>
            <div className="mt-1 text-sm text-slate-700">{children}</div>
        </div>
    );
}

