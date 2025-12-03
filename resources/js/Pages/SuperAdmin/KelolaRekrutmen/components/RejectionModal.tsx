import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { AlertCircle, XCircle } from 'lucide-react';
import { ApplicantRecord } from '../types';

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    applicant: ApplicantRecord | null;
    isSubmitting?: boolean;
}

export default function RejectionModal({
    isOpen,
    onClose,
    onConfirm,
    applicant,
    isSubmitting = false,
}: RejectionModalProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError('Alasan penolakan wajib diisi');
            return;
        }

        onConfirm(reason.trim());
        handleClose();
    };

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[405px] gap-5">
                <DialogHeader className="space-y-3">
                    <div className="flex items-start gap-4">
                        {/* <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div> */}
                        <div className="space-y-1.5">
                            <DialogTitle className="text-xl font-semibold leading-none tracking-tight">
                                Tolak Pelamar
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-600">
                                Anda akan menolak pelamar berikut
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-5">
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

                    <div className="space-y-3">
                        <Label htmlFor="rejection-reason" className="text-sm font-medium text-slate-900">
                            Alasan Penolakan <span className="text-red-600">*</span>
                        </Label>
                        <Textarea
                            id="rejection-reason"
                            placeholder="Tuliskan alasan penolakan secara detail dan profesional..."
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError('');
                            }}
                            className={`min-h-[110px] resize-none text-sm ${error ? 'border-red-500 focus-visible:ring-red-500' : ''
                                }`}
                            disabled={isSubmitting}
                        />
                        {error && (
                            <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <p className="text-xs leading-relaxed text-slate-500">
                            Alasan ini akan dikirimkan kepada pelamar sebagai feedback.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="min-w-[75px]"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="min-w-[120px] bg-red-600 hover:bg-red-700 focus-visible:ring-red-600"
                    >
                        {isSubmitting ? 'Memproses...' : 'Konfirmasi Penolakan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
