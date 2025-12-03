import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { CheckCircle } from 'lucide-react';
import { ApplicantRecord } from '../types';

interface AcceptanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    applicant: ApplicantRecord | null;
    isSubmitting?: boolean;
}

export default function AcceptanceModal({
    isOpen,
    onClose,
    onConfirm,
    applicant,
    isSubmitting = false,
}: AcceptanceModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[360px] gap-6">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-semibold leading-none tracking-tight">
                                Terima Pelamar
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-600">
                                Konfirmasi penerimaan pelamar ini sebagai karyawan baru.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {applicant && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Nama Pelamar
                                </p>
                                <p className="text-base font-semibold text-slate-900">
                                    {applicant.name}
                                </p>
                            </div>
                            <div className="h-px bg-slate-200" />
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                    Posisi yang Dilamar
                                </p>
                                <p className="text-base font-medium text-slate-700">
                                    {applicant.position}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="rounded-md bg-blue-50 p-3">
                        <p className="text-sm text-blue-700">
                            <span className="font-semibold">Catatan:</span> Status pelamar akan diubah menjadi <span className="font-semibold">Hired</span> dan proses onboarding akan dimulai.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="min-w-[75px]"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="min-w-[105px] bg-green-600 hover:bg-green-700 focus-visible:ring-green-600"
                    >
                        {isSubmitting ? 'Memproses...' : 'Konfirmasi Terima'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
