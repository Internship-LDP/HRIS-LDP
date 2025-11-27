// src/Pages/SuperAdmin/Recruitment/components/ScheduleInterviewDialog.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { ApplicantRecord, InterviewSchedule } from '../types';
import { useForm } from '@inertiajs/react';
import { 
    Loader2, 
    Calendar, 
    Clock, 
    Video, 
    MapPin, 
    Link as LinkIcon, 
    User, 
    FileText,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { toast } from 'sonner';

const SLOT_INTERVAL_MINUTES = 30;
// Menambah sedikit buffer slot agar waktu selesai bisa dipilih hingga sore
const TIME_SLOTS = Array.from({ length: 24 }, (_, index) => {
    const minutes = 8 * 60 + index * SLOT_INTERVAL_MINUTES; // Mulai jam 08:00
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
});

interface ScheduleData extends Record<string, any> { 
    date: string;
    time: string;
    end_time: string;
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
    existingInterviews?: InterviewSchedule[];
}

export default function ScheduleInterviewDialog({
    open,
    onOpenChange,
    applicant,
    onSuccessSubmit,
    existingInterviews = [],
}: ScheduleInterviewDialogProps) {
    const [conflictError, setConflictError] = useState('');
    const [timeRangeError, setTimeRangeError] = useState('');
    const { data, setData, post, processing, errors, reset } = useForm<ScheduleData>({
        date: '',
        time: '09:00',
        end_time: '09:30',
        mode: 'Online',
        interviewer: 'Tim HR',
        meeting_link: '',
        notes: '',
    });

    const addMinutes = (timeStr: string, minutes: number) => {
        const [h, m] = timeStr.split(':').map(Number);
        const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
        const wrapped = ((total % 1440) + 1440) % 1440;
        const hh = String(Math.floor(wrapped / 60)).padStart(2, '0');
        const mm = String(wrapped % 60).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    const toMinutes = (timeStr?: string | null): number | null => {
        if (!timeStr || !timeStr.includes(':')) return null;
        const [h, m] = timeStr.slice(0, 5).split(':').map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return null;
        return h * 60 + m;
    };

    const buildBlockedSlots = useCallback(
        (selectedDate?: string) => {
            const blocked = new Set<string>();
            if (!selectedDate) return blocked;

            existingInterviews.forEach((interview) => {
                if (!interview.time || !interview.date) return;
                const interviewDate = interview.date_value ?? interview.date;
                if (interviewDate !== selectedDate) return;
                if (applicant && interview.application_id === applicant.id) return;

                const interviewStart = toMinutes(interview.time);
                const interviewEnd =
                    toMinutes(interview.end_time) ??
                    (interviewStart !== null ? interviewStart + SLOT_INTERVAL_MINUTES : null);
                if (interviewStart === null || interviewEnd === null) return;

                TIME_SLOTS.forEach((slot) => {
                    const slotStart = toMinutes(slot);
                    if (slotStart === null) return;
                    const slotEnd = slotStart + SLOT_INTERVAL_MINUTES;
                    if (slotStart < interviewEnd && slotEnd > interviewStart) {
                        blocked.add(slot);
                    }
                });
            });

            return blocked;
        },
        [existingInterviews, applicant],
    );

    const getFirstAvailableSlot = useCallback(
        (selectedDate?: string) => {
            if (!selectedDate) return '';
            const blocked = buildBlockedSlots(selectedDate);
            return TIME_SLOTS.find((slot) => !blocked.has(slot)) ?? '';
        },
        [buildBlockedSlots],
    );

    const blockedSlots = useMemo(
        () => buildBlockedSlots(data.date),
        [buildBlockedSlots, data.date],
    );

    useEffect(() => {
        if (!open || !applicant) {
            reset();
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const initialDate = applicant.interview_date ?? today;
        const normalizedTime = applicant.interview_time
            ? applicant.interview_time.slice(0, 5)
            : getFirstAvailableSlot(initialDate);

        const defaultEnd = normalizedTime
            ? addMinutes(normalizedTime, SLOT_INTERVAL_MINUTES)
            : '';
        const normalizedEnd = applicant.interview_end_time
            ? applicant.interview_end_time.slice(0, 5)
            : defaultEnd;

        setData(() => ({
            date: initialDate,
            time: normalizedTime,
            end_time: normalizedEnd,
            mode: applicant.interview_mode ?? 'Online',
            interviewer: applicant.interviewer_name ?? 'Tim HR',
            meeting_link: applicant.meeting_link ?? '',
            notes: applicant.interview_notes ?? '',
        }));
        setConflictError('');
        setTimeRangeError('');
    }, [open, applicant, reset, setData, getFirstAvailableSlot]);

    const handleDateChange = (value: string) => {
        setConflictError('');
        setTimeRangeError('');
        setData((prev) => {
            const updated = { ...prev, date: value };
            const blocked = buildBlockedSlots(value);
            const nextSlot = getFirstAvailableSlot(value);
            if (!nextSlot) {
                updated.time = '';
                updated.end_time = '';
                return updated;
            }

            updated.time = nextSlot;
            updated.end_time = addMinutes(nextSlot, SLOT_INTERVAL_MINUTES);
            return updated;
        });
    };

    const hasTimeConflict = useMemo(() => {
        if (!data.date || !data.time || !data.end_time) return false;
        if (blockedSlots.has(data.time)) return true;

        const desiredStart = toMinutes(data.time);
        const desiredEnd = toMinutes(data.end_time);
        if (desiredStart === null || desiredEnd === null) return false;

        return existingInterviews.some((interview) => {
            if (!interview.date || !interview.time) return false;
            const interviewDate = interview.date_value ?? interview.date;
            const interviewStart = toMinutes(interview.time);
            const interviewEnd =
                toMinutes(interview.end_time) ??
                (interviewStart !== null ? interviewStart + SLOT_INTERVAL_MINUTES : null);
            if (interviewStart === null || interviewEnd === null) return false;

            const overlaps =
                interviewDate === data.date &&
                desiredStart < interviewEnd &&
                desiredEnd > interviewStart;
            const isSameApplicant = applicant && interview.application_id === applicant.id;
            return overlaps && !isSameApplicant;
        });
    }, [data.date, data.time, data.end_time, blockedSlots, existingInterviews, applicant]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!applicant || processing) return;
        const startMinutes = toMinutes(data.time) || 0;
        const endMinutes = toMinutes(data.end_time) || 0;

        if (endMinutes <= startMinutes) {
            setTimeRangeError('Waktu selesai harus lebih besar dari waktu mulai.');
            return;
        }
        if (hasTimeConflict) {
            setConflictError('Slot waktu ini sudah terpakai (overlap).');
            return;
        }
        setConflictError('');
        setTimeRangeError('');

        post(
            route('super-admin.recruitment.schedule-interview', applicant.id),
            {
                onSuccess: () => {
                    onSuccessSubmit(applicant.id);
                    toast.success(isEditing ? 'Jadwal interview diperbarui.' : 'Jadwal interview disimpan.');
                },
                onError: (backendErrors) => {
                    console.error('Validation Errors:', backendErrors);
                }
            }
        );
    };

    if (!applicant) return null;

    const isEditing = Boolean(
        applicant.has_interview_schedule ||
        applicant.interview_date ||
        applicant.interview_time ||
        applicant.interview_mode
    );
    const timeErrorMessage = timeRangeError || conflictError || errors['time'] || '';

    // Helpers untuk render dropdown selesai
    const startMinutes = toMinutes(data.time) || 0;

    return (
        <Dialog 
            open={open} 
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {isEditing ? 'Edit Jadwal Wawancara' : 'Jadwalkan Wawancara'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Atur detail waktu wawancara untuk <span className="font-semibold text-foreground">{applicant.name}</span> ({applicant.position}).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-5">
                    
                    {/* SECTION 1: WAKTU */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date" className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                Tanggal
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={data.date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full"
                            />
                            {errors['date'] && <p className="text-xs text-red-500">{errors['date']}</p>}
                        </div>

                        {/* Wrapper Waktu Mulai & Selesai agar sejajar */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="time" className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    Mulai
                                </Label>
                                <Select
                                    value={data.time}
                                    onValueChange={(value) => {
                                        setData((prev) => ({
                                            ...prev,
                                            time: value,
                                            end_time: addMinutes(value, SLOT_INTERVAL_MINUTES),
                                        }));
                                        setConflictError('');
                                        setTimeRangeError('');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Jam" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {TIME_SLOTS.map((slot) => (
                                            <SelectItem
                                                key={`start-${slot}`}
                                                value={slot}
                                                disabled={blockedSlots.has(slot)}
                                            >
                                                {slot}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="end_time" className="flex items-center gap-2">
                                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                    Selesai
                                </Label>
                                <Select
                                    value={data.end_time}
                                    onValueChange={(value) => {
                                        setData('end_time', value);
                                        setConflictError('');
                                        setTimeRangeError('');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Jam" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {TIME_SLOTS.map((slot) => {
                                            const slotMin = toMinutes(slot) || 0;
                                            // Disable jika waktu slot <= waktu mulai
                                            const isInvalid = slotMin <= startMinutes;
                                            return (
                                                <SelectItem
                                                    key={`end-${slot}`}
                                                    value={slot}
                                                    disabled={isInvalid}
                                                    className={isInvalid ? 'text-muted-foreground opacity-50' : ''}
                                                >
                                                    {slot}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Error Message Container */}
                    {timeErrorMessage && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{timeErrorMessage}</p>
                        </div>
                    )}

                    <div className="border-t border-border/50 my-1"></div>

                    {/* SECTION 2: TEKNIS & LOKASI */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="mode" className="flex items-center gap-2">
                                {data.mode === 'Online' ? <Video className="w-4 h-4 text-primary" /> : <MapPin className="w-4 h-4 text-primary" />}
                                Mode Interview
                            </Label>
                            <Select 
                                value={data.mode} 
                                onValueChange={(value) => setData('mode', value)} 
                                disabled={processing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Online">Online (Zoom/GMeet)</SelectItem>
                                    <SelectItem value="Offline">Offline (Kantor)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors['mode'] && <p className="text-xs text-red-500">{errors['mode']}</p>}
                        </div>

                        {data.mode === 'Online' && (
                            <div className="grid gap-2">
                                <Label htmlFor="meeting_link" className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                    Link Meeting
                                </Label>
                                <Input
                                    id="meeting_link"
                                    value={data.meeting_link}
                                    onChange={(e) => setData('meeting_link', e.target.value)}
                                    placeholder="https://meet.google.com/..."
                                    required
                                />
                                {errors['meeting_link'] && <p className="text-xs text-red-500">{errors['meeting_link']}</p>}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="interviewer" className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            Pewawancara
                        </Label>
                        <Input
                            id="interviewer"
                            value={data.interviewer}
                            onChange={(e) => setData('interviewer', e.target.value)}
                            required
                            disabled={processing}
                            placeholder="Nama Pewawancara / Tim HR"
                        />
                        {errors['interviewer'] && <p className="text-xs text-red-500">{errors['interviewer']}</p>}
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="notes" className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            Catatan Tambahan
                        </Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Contoh: Harap siapkan portofolio, berpakaian formal..."
                            required
                            className="min-h-[80px]"
                        />
                        {errors['notes'] && <p className="text-xs text-red-500">{errors['notes']}</p>}
                    </div>

                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="min-w-[140px]"
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                'Simpan Jadwal'
                            )}
                        </Button>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    );
}
