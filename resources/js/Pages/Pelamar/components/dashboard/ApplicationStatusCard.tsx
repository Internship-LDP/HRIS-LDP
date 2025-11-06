import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { CheckCircle, Clock } from 'lucide-react';

export interface ApplicationStage {
    name: string;
    status: 'completed' | 'current' | 'pending';
    date: string;
}

interface ApplicationStatusCardProps {
    progress: number;
    stages: ApplicationStage[];
}

export default function ApplicationStatusCard({
    progress,
    stages,
}: ApplicationStatusCardProps) {
    return (
        <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-blue-900">
                Status Lamaran Anda
            </h3>

            <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Progress:</span>
                    <span className="font-semibold text-blue-900">
                        {progress}%
                    </span>
                </div>
                <Progress value={progress} className="h-3" />
            </div>

            {stages.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    Belum ada lamaran yang dikirim. Ajukan lamaran untuk melihat
                    perkembangan proses rekrutmen Anda.
                </p>
            ) : (
            <div className="space-y-4">
                {stages.map((stage) => (
                    <div key={stage.name} className="flex items-center gap-4">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                stage.status === 'completed'
                                    ? 'bg-green-500'
                                    : stage.status === 'current'
                                      ? 'bg-blue-500'
                                      : 'bg-slate-200'
                            }`}
                        >
                            {stage.status === 'completed' ? (
                                <CheckCircle className="h-6 w-6 text-white" />
                            ) : stage.status === 'current' ? (
                                <Clock className="h-6 w-6 text-white" />
                            ) : (
                                <div className="h-3 w-3 rounded-full bg-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p
                                className={`text-sm font-medium ${
                                    stage.status === 'current'
                                        ? 'text-blue-900'
                                        : 'text-slate-700'
                                }`}
                            >
                                {stage.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {stage.date}
                            </p>
                        </div>
                        {stage.status === 'current' && (
                            <Badge className="bg-blue-500">Tahap Saat Ini</Badge>
                        )}
                        {stage.status === 'completed' && (
                            <Badge
                                variant="outline"
                                className="border-green-500 text-green-500"
                            >
                                Selesai
                            </Badge>
                        )}
                    </div>
                ))}
            </div>
            )}
        </Card>
    );
}
