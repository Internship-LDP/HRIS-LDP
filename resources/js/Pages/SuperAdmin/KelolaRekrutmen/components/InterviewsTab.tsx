import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { InterviewSchedule } from '../types';
import { Calendar as CalendarIcon, Clock, Eye } from 'lucide-react';

interface InterviewsTabProps {
    interviews: InterviewSchedule[];
}

export default function InterviewsTab({ interviews }: InterviewsTabProps) {
    return (
        <Card className="space-y-6 p-6">
            <div className="grid gap-4">
                {interviews.map((interview) => (
                    <div
                        key={`${interview.candidate}-${interview.position}-${interview.time}`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm text-slate-500">{interview.position}</p>
                                <p className="text-lg font-semibold text-blue-900">
                                    {interview.candidate}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                                    <span className="inline-flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        {interview.date} • {interview.time}
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {interview.mode}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-slate-500">
                                    Interviewer
                                    <p className="font-medium text-slate-900">
                                        {interview.interviewer}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    Detail
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}