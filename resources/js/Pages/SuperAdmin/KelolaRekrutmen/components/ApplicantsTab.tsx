// src/Pages/SuperAdmin/Recruitment/components/ApplicantsTab.tsx

import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Calendar as CalendarIcon, X, Filter, Search, User } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Calendar } from '@/Components/ui/calendar';
import { DateRange } from 'react-day-picker';
import {
    ApplicantRecord,
    ApplicantStatus,
    StatusSummary,
    formatApplicationId,
    ApplicantActionHandler,
    ApplicantRejectHandler,
} from '../types';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import RejectionModal from './RejectionModal';

interface ApplicantsTabProps {
    statusOptions: string[];
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    dateRange: { from: Date | null; to: Date | null };
    onDateRangeChange: (range: { from: Date | null; to: Date | null }) => void;
    statusOrder: ApplicantStatus[];
    statusSummary: StatusSummary;
    visibleApplications: ApplicantRecord[];
    onStatusUpdate: ApplicantActionHandler;
    onReject: ApplicantRejectHandler;
    isUpdatingStatus: boolean;
    updatingApplicantId: number | null;
    onScheduleInterview: (application: ApplicantRecord) => void;
    onViewProfile?: (application: ApplicantRecord) => void;
}

const statusBadge = (status: ApplicantStatus) => {
    switch (status) {
        case 'Applied':
            return (
                <Badge variant="outline" className="border-blue-500 bg-blue-50 text-blue-500 hover:bg-blue-50">
                    Applied
                </Badge>
            );
        case 'Screening':
            return (
                <Badge variant="outline" className="border-orange-500 bg-orange-50 text-orange-500 hover:bg-orange-50">
                    Screening
                </Badge>
            );
        case 'Interview':
            return (
                <Badge variant="outline" className="border-purple-500 bg-purple-50 text-purple-500 hover:bg-purple-50">
                    Interview
                </Badge>
            );
        case 'Hired':
            return (
                <Badge variant="outline" className="border-green-500 bg-green-50 text-green-500 hover:bg-green-50">
                    Hired
                </Badge>
            );
        case 'Rejected':
            return (
                <Badge variant="outline" className="border-red-500 bg-red-50 text-red-500 hover:bg-red-50">
                    Rejected
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function ApplicantsTab({
    statusOptions,
    searchTerm,
    onSearchTermChange,
    statusFilter,
    onStatusFilterChange,
    dateRange,
    onDateRangeChange,
    statusOrder,
    statusSummary,
    visibleApplications,
    onStatusUpdate,
    onReject,
    isUpdatingStatus,
    updatingApplicantId,
    onScheduleInterview,
    onViewProfile,
}: ApplicantsTabProps) {
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<ApplicantRecord | null>(null);
    const [datePickerMonth, setDatePickerMonth] = useState<Date | undefined>(
        dateRange.from ?? dateRange.to ?? new Date(),
    );
    const displayDateRange = useMemo(() => {
        const { from, to } = dateRange;
        const formatDate = (date: Date) => format(date, 'd MMM yyyy');
        if (from && to) return `${formatDate(from)} - ${formatDate(to)}`;
        if (from) return `${formatDate(from)} - Pilih akhir`;
        return 'Pilih rentang tanggal';
    }, [dateRange]);

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        onSearchTermChange(event.target.value);
    };

    const handleHire = (application: ApplicantRecord) => {
        const confirmed = window.confirm(
            `Konfirmasi penerimaan (Hired) untuk ${application.name}?`
        );
        if (confirmed) {
            onStatusUpdate(application.id, 'Hired');
        }
    };

    const handleReject = (application: ApplicantRecord) => {
        setSelectedApplicant(application);
        setIsRejectionModalOpen(true);
    };

    const handleConfirmReject = (reason: string) => {
        if (selectedApplicant) {
            onReject(selectedApplicant.id, reason);
        }
    };

    useEffect(() => {
        if (dateRange.from) {
            setDatePickerMonth(dateRange.from);
        } else if (dateRange.to) {
            setDatePickerMonth(dateRange.to);
        }
    }, [dateRange.from, dateRange.to]);

    return (
        <>
        <Card className="space-y-6 p-6">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Semua status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            {statusOrder.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <CalendarIcon className="h-4 w-4" />
                                <span>{displayDateRange}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3">
                            <Calendar
                                mode="range"
                                numberOfMonths={2}
                                month={datePickerMonth}
                                onMonthChange={setDatePickerMonth}
                                selected={dateRange as DateRange}
                                onSelect={(range: DateRange | undefined) => {
                                    if (!range) {
                                        onDateRangeChange({ from: null, to: null });
                                        return;
                                    }
                                    onDateRangeChange({
                                        from: range.from ?? null,
                                        to: range.to ?? null,
                                    });
                                }}
                            />
                            <div className="mt-3 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => onDateRangeChange({ from: null, to: null })}
                                >
                                    <X className="h-4 w-4" /> Reset
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Cari pelamar..."
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>ID Lamaran</TableHead>
                            <TableHead>Pelamar</TableHead>
                            <TableHead>Posisi</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="text-right w-[280px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {visibleApplications.map((application) => {
                            const isCurrentlyUpdating =
                                isUpdatingStatus && updatingApplicantId === application.id;

                            return (
                                <TableRow key={application.id}>
                                    <TableCell className="font-semibold text-blue-900">
                                        {formatApplicationId(application.id)}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium text-slate-900">
                                            {application.name}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            {application.email}
                                        </p>
                                    </TableCell>
                                    <TableCell>{application.position}</TableCell>
                                    <TableCell>{statusBadge(application.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap items-center justify-end gap-2">
                                            {onViewProfile && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onViewProfile(application)}
                                                    disabled={isCurrentlyUpdating}
                                                    title="Lihat Profil Lengkap"
                                                >
                                                    <User className="h-4 w-4 mr-2 text-blue-600" />
                                                    Profil
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </Card>

        <RejectionModal
            isOpen={isRejectionModalOpen}
            onClose={() => {
                setIsRejectionModalOpen(false);
                setSelectedApplicant(null);
            }}
            onConfirm={handleConfirmReject}
            applicant={selectedApplicant}
            isSubmitting={isUpdatingStatus}
        />
        </>
    );
}
