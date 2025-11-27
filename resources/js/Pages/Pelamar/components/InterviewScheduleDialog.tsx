import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Calendar, Clock, Video, FileText } from 'lucide-react';

interface InterviewData {
    date: string;
    time: string;
    mode: string;
    link?: string | null;
    interviewer: string;
    notes?: string | null;
}

interface ApplicationStatus {
    position: string;
    interview?: InterviewData | null;
}

interface InterviewScheduleDialogProps {
    application: ApplicationStatus | null;
    onClose: () => void;
}

export default function InterviewScheduleDialog({
    application,
    onClose,
}: InterviewScheduleDialogProps) {
    return (
        <Dialog open={!!application} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Jadwal Interview</DialogTitle>
                    <DialogDescription>
                        Detail jadwal interview untuk posisi {application?.position}.
                    </DialogDescription>
                </DialogHeader>
                {application?.interview && (
                    <div className="space-y-4 rounded-lg bg-blue-50 p-6">
                        {/* Posisi */}
                        <div>
                            <p className="text-xs text-slate-500">Posisi</p>
                            <p className="text-base font-semibold text-blue-900">
                                {application.position}
                            </p>
                        </div>

                        {/* Tanggal & Waktu */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-slate-500">Tanggal</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-900" />
                                    <span className="text-slate-800">
                                        {application.interview.date}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">Waktu</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-900" />
                                    <span className="text-slate-800">
                                        {application.interview.time}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Metode */}
                        <div>
                            <p className="text-xs text-slate-500">Metode</p>
                            <div className="mt-1 flex items-center gap-2">
                                <Video className="h-4 w-4 text-blue-900" />
                                <span className="text-slate-800">{application.interview.mode}</span>
                            </div>
                        </div>

                        {/* Pewawancara */}
                        <div>
                            <p className="text-xs text-slate-500">Pewawancara</p>
                            <p className="mt-1 text-slate-800">
                                {application.interview.interviewer}
                            </p>
                        </div>

                        {/* Notes */}
                        {application.interview.notes && (
                            <div>
                                <p className="text-xs text-slate-500">Catatan</p>
                                <div className="mt-1 flex items-start gap-2">
                                    <FileText className="h-4 w-4 text-blue-900 mt-0.5" />
                                    <p className="text-slate-800 whitespace-pre-line">
                                        {application.interview.notes}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* LINK MEETING + JOIN BUTTON */}
                        {application.interview.link && (
                            <div className="pt-2 space-y-2">
                                <a
                                    href={application.interview.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center text-sm text-blue-700 underline"
                                >
                                    {application.interview.link}
                                </a>

                                <Button
                                    className="w-full bg-blue-900 hover:bg-blue-800"
                                    onClick={() => window.open(application.interview?.link!, '_blank')}
                                >
                                    Join Interview
                                </Button>
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
