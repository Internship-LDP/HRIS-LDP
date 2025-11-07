import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { TerminationRecord } from '../types';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ChecklistDialogProps {
    termination: TerminationRecord;
    checklistTemplate: string[];
    trigger: React.ReactNode;
}

export default function ChecklistDialog({
    termination,
    checklistTemplate,
    trigger,
}: ChecklistDialogProps) {
    const [checks, setChecks] = useState<Record<string, boolean>>(
        Object.fromEntries(checklistTemplate.map((item) => [item, termination.progress >= 100]))
    );

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-3xl border-0 bg-white p-0">
                <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-4">
                    <DialogTitle>Checklist Offboarding: {termination.employeeName}</DialogTitle>
                    <DialogDescription>
                        Pantau progres serah terima dan lengkapi catatan exit interview.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 px-6 pb-6 pt-4">
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                        <DetailItem label="ID" value={termination.reference} />
                        <DetailItem label="Divisi" value={termination.division} />
                        <DetailItem label="Tipe" value={termination.type} />
                        <DetailItem label="Tanggal Efektif" value={termination.effectiveDate} />
                        <DetailItem label="Status" value={termination.status} />
                        <div>
                            <p className="text-xs text-slate-500">Progress</p>
                            <div className="mt-1 flex items-center gap-2">
                                <div className="h-2 flex-1 rounded-full bg-slate-200">
                                    <div
                                        className="h-2 rounded-full bg-blue-900"
                                        style={{ width: `${termination.progress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500">
                                    {termination.progress}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-3 text-base font-semibold text-slate-900">
                            Checklist Offboarding
                        </h4>
                        <div className="space-y-2">
                            {checklistTemplate.map((item) => (
                                <label
                                    key={item}
                                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                                >
                                    <Checkbox
                                        checked={checks[item]}
                                        onCheckedChange={(value) =>
                                            setChecks((prev) => ({
                                                ...prev,
                                                [item]: Boolean(value),
                                            }))
                                        }
                                    />
                                    <span className="flex-1 text-slate-700">{item}</span>
                                    {checks[item] && (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Jadwal Exit Interview</Label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <Input type="date" />
                                <Input type="time" />
                            </div>
                        </div>
                        <div>
                            <Label>Catatan</Label>
                            <Textarea rows={3} placeholder="Tambahkan catatan..." />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button className="bg-blue-900 hover:bg-blue-800">Simpan Progress</Button>
                        <Button variant="outline" className="border-green-500 text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Tandai Selesai
                        </Button>
                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                            Form ini bersifat informatif untuk tim HR.
                        </Badge>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-900">{value ?? '-'}</p>
        </div>
    );
}
