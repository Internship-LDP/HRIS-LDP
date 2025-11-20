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
        Eye, 
        XCircle, 
        Loader2, 
        Calendar,
        Check,
    } from 'lucide-react';
    import { 
        ApplicantRecord, 
        ApplicantStatus, 
        StatusSummary, 
        formatApplicationId,
        ApplicantActionHandler
    } from '../types';
    import { ChangeEvent } from 'react';

    interface ApplicantsTabProps {
        statusOptions: string[];
        searchTerm: string;
        onSearchTermChange: (value: string) => void;
        statusFilter: string;
        onStatusFilterChange: (value: string) => void;
        statusOrder: ApplicantStatus[];
        statusSummary: StatusSummary;
        visibleApplications: ApplicantRecord[];
        onViewDetail: (application: ApplicantRecord) => void;
        onDelete: (application: ApplicantRecord) => void;
        onStatusUpdate: ApplicantActionHandler; 
        onReject: (id: number, reason: string) => void;
        isUpdatingStatus: boolean;
        updatingApplicantId: number | null;
        onScheduleInterview: (application: ApplicantRecord) => void;
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
        onViewDetail,
        onDelete,
        onStatusUpdate,
        onReject,        // 
        isUpdatingStatus,
        updatingApplicantId,
        onScheduleInterview,
    }: ApplicantsTabProps) {

        const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
            onSearchTermChange(event.target.value);
        };

        // Hired handler (tetap)
        const handleHire = (application: ApplicantRecord) => {
            const confirmed = window.confirm(`Konfirmasi penerimaan (Hired) untuk ${application.name}?`);
            if (confirmed) {
                onStatusUpdate(application.id, 'Hired');
            }
        };

        // NEW: Reject handler dengan alasan
        const handleReject = (application: ApplicantRecord) => {
            const reason = window.prompt(`Masukkan alasan penolakan untuk ${application.name}:`);
            if (!reason || reason.trim() === '') {
                alert('Alasan penolakan wajib diisi.');
                return;
            }

            onReject(application.id, reason.trim());
        };

        return (
            <Card className="space-y-6 p-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>ID Lamaran</TableHead>
                                <TableHead>Pelamar</TableHead>
                                <TableHead>Posisi</TableHead>
                                <TableHead className="w-[120px]">Status</TableHead>
                                <TableHead className="text-right w-[250px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {visibleApplications.map((application) => {
                                const isCurrentlyUpdating = isUpdatingStatus && updatingApplicantId === application.id;

                                return (
                                    <TableRow key={application.id}>
                                        <TableCell className="font-semibold text-blue-900">
                                            {formatApplicationId(application.id)}
                                        </TableCell>

                                        <TableCell>
                                            <p className="font-medium text-slate-900">{application.name}</p>
                                            <p className="text-sm text-slate-500">{application.email}</p>
                                        </TableCell>

                                        <TableCell>{application.position}</TableCell>

                                        <TableCell>
                                            {statusBadge(application.status)}
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">

                                                {/* SCREENING → Jadwalkan Interview */}
                                                {application.status === 'Screening' && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => onScheduleInterview(application)}
                                                        disabled={isCurrentlyUpdating}
                                                        className="bg-purple-600 hover:bg-purple-700"
                                                    >
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        Jadwalkan Interview
                                                    </Button>
                                                )}

                                                {/* INTERVIEW → Hired / Reject */}
                                                {application.status === 'Interview' && (
                                                    <>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => handleHire(application)}
                                                            disabled={isCurrentlyUpdating}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Check className="h-4 w-4 mr-2" />
                                                            Terima (Hired)
                                                        </Button>

                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => handleReject(application)}
                                                            disabled={isCurrentlyUpdating}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Tolak (Rejected)
                                                        </Button>
                                                    </>
                                                )}

                                                {/* VIEW */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onViewDetail(application)}
                                                    disabled={isCurrentlyUpdating}
                                                >
                                                    {isCurrentlyUpdating ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>

                                                {/* DELETE */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDelete(application)}
                                                    disabled={isCurrentlyUpdating}
                                                >
                                                    <XCircle className="h-4 w-4 text-red-500" />
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
        );
    }
