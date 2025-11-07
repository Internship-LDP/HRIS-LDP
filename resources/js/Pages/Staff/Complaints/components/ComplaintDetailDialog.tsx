import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import type { ComplaintRecord } from '../types';

interface ComplaintDetailDialogProps {
    complaint: ComplaintRecord | null;
    onOpenChange: (open: boolean) => void;
}

export default function ComplaintDetailDialog({
    complaint,
    onOpenChange,
}: ComplaintDetailDialogProps) {
    return (
        <Dialog open={Boolean(complaint)} onOpenChange={(open) => onOpenChange(open)}>
            <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden border-0 bg-white p-0">
                <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-4">
                    <DialogTitle>Detail Pengaduan</DialogTitle>
                    <DialogDescription>
                        Lihat status penanganan dan catatan penyelesaian pengaduan Anda.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[calc(85vh-4.5rem)] overflow-y-auto">
                    {!complaint ? (
                        <div className="px-6 py-12 text-center text-sm text-slate-500">
                            Pilih pengaduan untuk melihat detail lengkap.
                        </div>
                    ) : (
                        <div className="space-y-6 px-6 pb-6 pt-4">
                            <section className="grid gap-4 rounded-xl border border-slate-200/80 p-4 md:grid-cols-3">
                                <DetailInfo label="Nomor" value={complaint.letterNumber ?? '-'} />
                                <DetailInfo label="Kategori" value={complaint.category} />
                                <DetailInfo label="Tanggal" value={complaint.date} />
                                <DetailInfo
                                    label="Prioritas"
                                    value={<Badge className="bg-slate-900 text-white">{complaint.priority}</Badge>}
                                />
                                <DetailInfo
                                    label="Status"
                                    value={<StatusBadge status={complaint.status} />}
                                />
                                {complaint.attachment?.name && (
                                    <DetailInfo
                                        label="Lampiran"
                                        value={<Badge variant="outline">{complaint.attachment.name}</Badge>}
                                    />
                                )}
                            </section>

                        <section className="space-y-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-5">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Subjek
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {complaint.subject}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Deskripsi
                                </p>
                                <p className="mt-1 whitespace-pre-wrap rounded-md bg-white/70 p-3 text-sm text-slate-700">
                                    {complaint.description ?? '-'}
                                </p>
                            </div>
                        </section>

                        <section className="space-y-3 rounded-xl border border-slate-200/80 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Tindak Lanjut HR</p>
                                    <p className="text-xs text-slate-500">
                                        Catatan dari penanggung jawab pengaduan.
                                    </p>
                                </div>
                                {complaint.handler && (
                                    <Badge variant="outline" className="border-blue-200 text-blue-900">
                                        {complaint.handler}
                                    </Badge>
                                )}
                            </div>
                            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                                {complaint.resolutionNotes?.length
                                    ? complaint.resolutionNotes
                                    : 'Belum ada catatan penanganan dari tim HR.'}
                            </p>
                        </section>

                            {complaint.attachment?.url && (
                                <section className="rounded-xl border border-slate-200/80 bg-white p-4">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Lampiran
                                    </p>
                                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {complaint.attachment.name ?? 'Berkas lampiran'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Klik tombol di samping untuk melihat dokumen.
                                            </p>
                                        </div>
                                        <Button asChild size="sm" variant="outline">
                                            <a href={complaint.attachment.url} target="_blank" rel="noreferrer">
                                                Lihat Lampiran
                                            </a>
                                        </Button>
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailInfo({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <div className="mt-1 text-sm font-semibold text-slate-900">{value ?? '-'}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();

    if (normalized.includes('selesai')) {
        return <Badge className="bg-emerald-500">Selesai</Badge>;
    }
    if (normalized.includes('tangani') || normalized.includes('proses')) {
        return <Badge className="bg-amber-500">Ditangani</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
}
