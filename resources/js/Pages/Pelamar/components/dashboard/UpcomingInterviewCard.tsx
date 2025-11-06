import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Calendar, Clock, Video } from 'lucide-react';

export interface UpcomingInterview {
    position: string;
    date: string;
    time: string;
    mode: string;
    interviewer: string;
    link?: string | null;
}

interface UpcomingInterviewCardProps {
    interview?: UpcomingInterview | null;
}

export default function UpcomingInterviewCard({
    interview,
}: UpcomingInterviewCardProps) {
    return (
        <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-blue-900">
                Jadwal Interview
            </h3>
            {!interview ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    Belum ada jadwal interview yang tersedia.
                </p>
            ) : (
                <div className="space-y-4 rounded-lg bg-blue-50 p-6">
                    <div>
                        <p className="text-xs text-slate-500">Posisi</p>
                        <p className="text-base font-semibold text-blue-900">
                            {interview.position}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-slate-500">Tanggal</p>
                            <div className="mt-1 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-900" />
                                <span className="text-slate-800">
                                    {interview.date}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Waktu</p>
                            <div className="mt-1 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-900" />
                                <span className="text-slate-800">
                                    {interview.time}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Mode</p>
                        <div className="mt-1 flex items-center gap-2">
                            <Video className="h-4 w-4 text-blue-900" />
                            <span className="text-slate-800">
                                {interview.mode}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Pewawancara</p>
                        <p className="mt-1 text-slate-800">
                            {interview.interviewer}
                        </p>
                    </div>
                    {interview.link && (
                        <>
                            <Button className="w-full bg-blue-900 hover:bg-blue-800">
                                Join Interview
                            </Button>
                            <p className="text-center text-xs text-slate-500">
                                {interview.link}
                            </p>
                        </>
                    )}
                </div>
            )}
        </Card>
    );
}
