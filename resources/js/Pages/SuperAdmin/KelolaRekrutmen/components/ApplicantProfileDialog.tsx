import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { ApplicantRecord } from '../types';
import { ApplicantProfileView } from './ApplicantProfileView';

interface ApplicantProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    applicant: ApplicantRecord | null;
    onAccept?: () => void;
    onReject?: () => void;
    onScheduleInterview?: () => void;
}

export default function ApplicantProfileDialog({
    open,
    onOpenChange,
    applicant,
    onAccept,
    onReject,
    onScheduleInterview,
}: ApplicantProfileDialogProps) {
    
    if (!applicant) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 bg-white p-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>Profil Pelamar - {applicant.name}</DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    <ApplicantProfileView
                        applicant={applicant}
                        onAccept={onAccept}
                        onReject={onReject}
                        onScheduleInterview={onScheduleInterview}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
