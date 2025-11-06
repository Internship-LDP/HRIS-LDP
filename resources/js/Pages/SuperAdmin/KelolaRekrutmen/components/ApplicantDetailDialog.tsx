import {
    Dialog,
    DialogContent,
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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Detail Pelamar</DialogTitle>
                </DialogHeader>
                {applicant ? (
                    <div className="grid gap-4 md:grid-cols-2">
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
                    <p className="text-sm text-slate-500">Pilih pelamar untuk melihat detail.</p>
                )}
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