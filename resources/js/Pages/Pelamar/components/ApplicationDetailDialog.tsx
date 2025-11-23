import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { CheckCircle2 } from 'lucide-react';

interface ApplicationStage {
    name: string;
    status: 'pending' | 'current' | 'completed';
    date: string;
}

interface ApplicationStatus {
    id: number;
    position: string;
    division: string;
    status: string;
    progress: number;
    stages: ApplicationStage[];
    rejection_reason?: string | null;
    updated_at_diff: string;
    submitted_at_formatted: string;
}

interface ApplicationDetailDialogProps {
    application: ApplicationStatus | null;
    onClose: () => void;
    getStatusBadge: (status: string) => JSX.Element;
}

export default function ApplicationDetailDialog({
    application,
    onClose,
    getStatusBadge,
}: ApplicationDetailDialogProps) {
    return (
        <Dialog open={!!application} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Detail Lamaran</DialogTitle>
                    <DialogDescription>
                        Informasi lengkap mengenai status lamaran Anda.
                    </DialogDescription>
                </DialogHeader>
                {application && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Posisi</h4>
                                <p className="font-semibold text-gray-900">{application.position}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Divisi</h4>
                                <p className="font-semibold text-gray-900">{application.division}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                <div className="mt-1">{getStatusBadge(application.status)}</div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Tanggal Melamar</h4>
                                <p className="font-semibold text-gray-900">{application.submitted_at_formatted}</p>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="mb-4 text-sm font-medium text-gray-500">Riwayat Status</h4>
                            <div className="space-y-4">
                                {application.stages.map((stage, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className={`mt-0.5 h-2 w-2 rounded-full ${
                                            stage.status === 'completed' ? 'bg-green-500' :
                                            stage.status === 'current' ? 'bg-blue-500' :
                                            'bg-gray-300'
                                        }`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {stage.date !== '-' ? stage.date : 'Menunggu'}
                                            </p>
                                        </div>
                                        {stage.status === 'completed' && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {application.rejection_reason && (
                            <div className="rounded-lg bg-red-50 p-4">
                                <h4 className="mb-1 text-sm font-medium text-red-800">Alasan Penolakan</h4>
                                <p className="text-sm text-red-600">{application.rejection_reason}</p>
                            </div>
                        )}
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={onClose}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
