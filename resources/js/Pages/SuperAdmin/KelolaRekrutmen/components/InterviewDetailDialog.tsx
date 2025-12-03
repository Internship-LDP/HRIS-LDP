import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Calendar, Clock, MapPin, User, Link as LinkIcon, FileText } from 'lucide-react';
import { ApplicantRecord } from '../types';

interface InterviewDetailDialogProps {
    applicant: ApplicantRecord | null;
    onClose: () => void;
}

export default function InterviewDetailDialog({
    applicant,
    onClose,
}: InterviewDetailDialogProps) {
    if (!applicant || !applicant.has_interview_schedule) {
        return null;
    }

    const getModeBadge = (mode: string) => {
        const styles = {
            'Online': 'bg-blue-100 text-blue-700 border-blue-200',
            'Offline': 'bg-green-100 text-green-700 border-green-200',
            'Hybrid': 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return (
            <Badge variant="outline" className={styles[mode as keyof typeof styles] || 'bg-slate-100 text-slate-700'}>
                {mode}
            </Badge>
        );
    };

    return (
        <Dialog open={!!applicant} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-blue-900">
                        Detail Jadwal Interview
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Applicant Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">Informasi Pelamar</h3>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900">{applicant.name}</p>
                            <p className="text-xs text-slate-600">{applicant.position}</p>
                            <p className="text-xs text-slate-500">ID: {applicant.id}</p>
                        </div>
                    </div>

                    {/* Interview Schedule */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-900">Jadwal Interview</h3>

                        {/* Date & Time */}
                        <div className="flex items-start gap-3">
                            <div className="bg-slate-100 p-2 rounded-lg">
                                <Calendar className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500">Tanggal</p>
                                <p className="text-sm font-medium text-slate-900">{applicant.interview_date || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-slate-100 p-2 rounded-lg">
                                <Clock className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500">Waktu</p>
                                <p className="text-sm font-medium text-slate-900">
                                    {applicant.interview_time || '-'}
                                    {applicant.interview_end_time && ` - ${applicant.interview_end_time}`}
                                </p>
                            </div>
                        </div>

                        {/* Mode */}
                        <div className="flex items-start gap-3">
                            <div className="bg-slate-100 p-2 rounded-lg">
                                <MapPin className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500">Mode Interview</p>
                                <div className="mt-1">
                                    {applicant.interview_mode ? getModeBadge(applicant.interview_mode) : '-'}
                                </div>
                            </div>
                        </div>

                        {/* Interviewer */}
                        <div className="flex items-start gap-3">
                            <div className="bg-slate-100 p-2 rounded-lg">
                                <User className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500">Pewawancara</p>
                                <p className="text-sm font-medium text-slate-900">{applicant.interviewer_name || '-'}</p>
                            </div>
                        </div>

                        {/* Link/Location */}
                        {(applicant as any).interview_link && (
                            <div className="flex items-start gap-3">
                                <div className="bg-slate-100 p-2 rounded-lg">
                                    <LinkIcon className="h-4 w-4 text-slate-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Link/Lokasi</p>
                                    <a
                                        href={(applicant as any).interview_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                    >
                                        {(applicant as any).interview_link}
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {applicant.interview_notes && (
                            <div className="flex items-start gap-3">
                                <div className="bg-slate-100 p-2 rounded-lg">
                                    <FileText className="h-4 w-4 text-slate-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Catatan</p>
                                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{applicant.interview_notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    >
                        Tutup
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
