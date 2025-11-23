import { useState } from 'react';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { OnboardingItem } from '../types';
import OnboardingDetailDialog from './OnboardingDetailDialog';

interface OnboardingTabProps {
    items: OnboardingItem[];
}

export default function OnboardingTab({ items }: OnboardingTabProps) {
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<OnboardingItem | null>(null);

    const handleViewDetail = (item: OnboardingItem) => {
        setSelectedItem(item);
        setDetailOpen(true);
    };

    return (
        <>
            <Card className="space-y-6 p-6">
                {items.length === 0 ? (
                    <p className="text-center text-sm text-slate-500">
                        Belum ada proses onboarding yang berjalan.
                    </p>
                ) : (
                    <div className="grid gap-4">
                        {items.map((item) => (
                            <div
                                key={`${item.name}-${item.position}`}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {item.name} - {item.position}
                                        </p>
                                        <p className="text-sm text-slate-600">Mulai: {item.startedAt}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={item.status === 'Selesai' ? 'bg-green-500' : 'bg-orange-500'}>
                                            {item.status}
                                        </Badge>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewDetail(item)}
                                            className="border-blue-200 text-blue-900 hover:bg-blue-50"
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Detail
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {item.steps.map((step) => (
                                        <div key={step.label} className="flex items-center gap-2 text-sm">
                                            {step.complete ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : step.pending ? (
                                                <Clock className="h-4 w-4 text-orange-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-slate-300" />
                                            )}
                                            <span
                                                className={
                                                    step.complete
                                                        ? 'text-slate-700'
                                                        : step.pending
                                                            ? 'text-slate-400'
                                                            : 'text-slate-600'
                                                }
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <OnboardingDetailDialog
                open={detailOpen}
                onOpenChange={setDetailOpen}
                item={selectedItem}
            />
        </>
    );
}
