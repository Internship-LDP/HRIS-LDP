import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detail Pengaduan</DialogTitle>
                </DialogHeader>
                {complaint && (
                    <div className="mt-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <DetailInfo label="Nomor" value={complaint.letterNumber ?? '-'} />
                            <DetailInfo label="Kategori" value={complaint.category} />
                            <DetailInfo label="Tanggal" value={complaint.date} />
                            <DetailInfo label="Status" value={complaint.status} />
                        </div>
                        <div>
                            <Label className="text-xs uppercase text-slate-500">Subjek</Label>
                            <p className="text-sm font-semibold text-slate-900">
                                {complaint.subject}
                            </p>
                        </div>
                        <div>
                            <Label className="text-xs uppercase text-slate-500">Deskripsi</Label>
                            <p className="text-sm text-slate-700">
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
                                    className="text-sm font-semibold text-blue-900 hover:underline"
                                >
                                    {complaint.attachment.name ?? 'Lihat Lampiran'}
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
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
