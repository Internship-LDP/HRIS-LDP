// src/Pages/SuperAdmin/Recruitment/components/ApplicantsTab.tsx

import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import {
    Filter,
    Search,
    XCircle,
    Loader2,
    Calendar,
    Check,
    User,
} from 'lucide-react';
import {
    ApplicantRecord,
    ApplicantStatus,
    StatusSummary,
    formatApplicationId,
    ApplicantActionHandler,
    ApplicantRejectHandler,
} from '../types';
import { ChangeEvent, useState } from 'react';
import RejectionModal from './RejectionModal';

interface ApplicantsTabProps {
    statusOptions: string[];
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    statusOrder: ApplicantStatus[];
    statusSummary: StatusSummary;
    visibleApplications: ApplicantRecord[];
    onDelete: (application: ApplicantRecord) => void;
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
    statusOrder,
    statusSummary,
    visibleApplications,
    onDelete,
    onStatusUpdate,
    onReject,
    isUpdatingStatus,
    updatingApplicantId,
    onScheduleInterview,
    onViewProfile,
}: ApplicantsTabProps) {
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<ApplicantRecord | null>(null);

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

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDelete(application)}
                                                disabled={isCurrentlyUpdating}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Hapus
                                            </Button>
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
