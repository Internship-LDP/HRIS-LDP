import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { ApplicantRecord, formatApplicationId } from '../types';

interface ApplicantDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    applicant: ApplicantRecord | null;
}

export default function ApplicantDetailDialog({
    open,
    onOpenChange,
    applicant,
}: ApplicantDetailDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl border-0 bg-white p-0">
                <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-4">
                    <DialogTitle>Detail Pelamar</DialogTitle>
                    <DialogDescription>
                        Informasi singkat kandidat untuk memudahkan proses screening lanjutan.
                    </DialogDescription>
                </DialogHeader>
                <div className="px-6 pb-6 pt-4">
                    {applicant ? (
                        <div className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
                            <Detail label="ID Lamaran" value={formatApplicationId(applicant.id)} />
                            <Detail label="Nama" value={applicant.name} />
                            <Detail label="Posisi" value={applicant.position} />
                            <Detail label="Email" value={applicant.email} />
                            <Detail label="Telepon" value={applicant.phone} />
                            <Detail label="Pendidikan" value={applicant.education} />
                            <Detail label="Pengalaman" value={applicant.experience} />
                            <Detail label="Status" value={applicant.status} />
                        </div>
                    ) : (
                        <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                            Pilih pelamar untuk melihat detail.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
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
