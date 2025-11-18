// src/Pages/SuperAdmin/Recruitment/components/ScheduleInterviewDialog.tsx

import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { ApplicantRecord } from '../types';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';

interface ScheduleData extends Record<string, any> { 
    date: string;
    time: string;
    mode: string;
    interviewer: string;
    meeting_link: string;
    notes: string;
}

interface ScheduleInterviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    applicant: ApplicantRecord | null;
    onSuccessSubmit: (applicantId: number) => void; 
}

export default function ScheduleInterviewDialog({
    open,
    onOpenChange,
    applicant,
    onSuccessSubmit,
}: ScheduleInterviewDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ScheduleData>({
        date: '',
        time: '09:00',
        mode: 'Online',
        interviewer: 'Tim HR',
        meeting_link: '',
        notes: '',
    });

    useEffect(() => {
        if (open) {
            setData(prev => ({ 
                ...prev, 
                date: new Date().toISOString().split('T')[0],
                interviewer: 'Tim HR',
                meeting_link: '',
                notes: ''
            }));
        } else {
            reset();
        }
    }, [open, applicant, reset, setData]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!applicant || processing) return;

        post(
            route('super-admin.recruitment.schedule-interview', applicant.id),
            {
                onSuccess: () => {
                    onSuccessSubmit(applicant.id); 
                },
                onError: (backendErrors) => {
                    console.error('Validation Errors:', backendErrors);
                }
            }
        );
    };

    if (!applicant) return null;

    return (
        <Dialog 
            open={open} 
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Jadwalkan Wawancara</DialogTitle>
                    <DialogDescription>
                        Atur detail waktu wawancara untuk **{applicant.name}** ({applicant.position}).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    
                    {/* TANGGAL */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">Tanggal</Label>
                        <Input
                            id="date"
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            className="col-span-3"
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {errors['date'] && <p className="col-span-4 text-xs text-red-500 text-right">{errors['date']}</p>}
                    </div>

                    {/* WAKTU */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">Waktu</Label>
                        <Input
                            id="time"
                            type="time"
                            value={data.time}
                            onChange={(e) => setData('time', e.target.value)}
                            className="col-span-3"
                            required
                        />
                        {errors['time'] && <p className="col-span-4 text-xs text-red-500 text-right">{errors['time']}</p>}
                    </div>
                    
                    {/* MODE INTERVIEW */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mode" className="text-right">Mode</Label>
                        <Select 
                            value={data.mode} 
                            onValueChange={(value) => setData('mode', value)} 
                            disabled={processing}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Online">Online (Zoom/Meet)</SelectItem>
                                <SelectItem value="Offline">Offline (Kantor)</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors['mode'] && <p className="col-span-4 text-xs text-red-500 text-right">{errors['mode']}</p>}
                    </div>
                    
                    {/* FIELD LINK MEETING (MUNCUL JIKA MODE = ONLINE) */}
                    {data.mode === 'Online' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="meeting_link" className="text-right">Link Meeting</Label>
                            <Input
                                id="meeting_link"
                                value={data.meeting_link}
                                onChange={(e) => setData('meeting_link', e.target.value)}
                                className="col-span-3"
                                placeholder="https://meet.google.com/..."
                                required 
                            />
                            {errors['meeting_link'] && <p className="col-span-4 text-xs text-red-500 text-right">{errors['meeting_link']}</p>}
                        </div>
                    )}

                    {/* PEWAWANCARA */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="interviewer" className="text-right">Pewawancara</Label>
                        <Input
                            id="interviewer"
                            value={data.interviewer}
                            onChange={(e) => setData('interviewer', e.target.value)}
                            className="col-span-3"
                            disabled={processing}
                        />
                        {errors['interviewer'] && <p className="col-span-4 text-xs text-red-500 text-right">{errors['interviewer']}</p>}
                    </div>
                    
                    {/* CATATAN TAMBAHAN */}
                    <div className="grid grid-cols-4 gap-4">
                        <Label htmlFor="notes" className="text-right mt-1">Catatan</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Contoh: Harap siapkan portofolio Anda."
                            className="col-span-3"
                        />
                        {errors['notes'] && <p className="col-span-4 text-xs text-red-500 text-right">{errors['notes']}</p>}
                    </div>


                    <DialogFooter>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="flex items-center"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                'Konfirmasi & Simpan Jadwal'
                            )}
                        </Button>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    );
}