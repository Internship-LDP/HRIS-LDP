import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { FeedbackState } from '../profileTypes';

interface FeedbackDialogProps {
    feedback: FeedbackState;
    onClose: () => void;
}

export default function FeedbackDialog({ feedback, onClose }: FeedbackDialogProps) {
    return (
        <Dialog open={Boolean(feedback)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader className="space-y-3 text-center">
                    <div
                        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                            feedback?.type === 'success'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-600'
                        }`}
                    >
                        {feedback?.type === 'success' ? (
                            <CheckCircle2 className="h-7 w-7" />
                        ) : (
                            <XCircle className="h-7 w-7" />
                        )}
                    </div>
                    <DialogTitle className="text-xl">
                        {feedback?.type === 'success'
                            ? 'Profil tersimpan'
                            : 'Gagal menyimpan'}
                    </DialogTitle>
                    <DialogDescription className="text-base text-slate-600">
                        {feedback?.message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button
                        type="button"
                        onClick={onClose}
                        className={`w-full sm:w-auto ${
                            feedback?.type === 'success'
                                ? 'bg-green-600 hover:bg-green-500'
                                : 'bg-red-600 hover:bg-red-500'
                        }`}
                    >
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
