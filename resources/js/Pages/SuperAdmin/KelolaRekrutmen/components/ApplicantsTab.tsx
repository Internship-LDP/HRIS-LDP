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
import { Filter, Search, Eye, FileText, XCircle } from 'lucide-react';
import { ApplicantRecord, ApplicantStatus, StatusSummary, formatApplicationId } from '../types';
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
}

const statusBadge = (status: ApplicantStatus) => {
    switch (status) {
        case 'Applied':
            return (
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                    Applied
                </Badge>
            );
        case 'Screening':
            return (
                <Badge variant="outline" className="border-orange-500 text-orange-500">
                    Screening
                </Badge>
            );
        case 'Interview':
            return (
                <Badge variant="outline" className="border-purple-500 text-purple-500">
                    Interview
                </Badge>
            );
        case 'Hired':
            return (
                <Badge variant="outline" className="border-green-500 text-green-500">
                    Hired
                </Badge>
            );
        case 'Rejected':
            return (
                <Badge variant="outline" className="border-red-500 text-red-500">
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
}: ApplicantsTabProps) {
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        onSearchTermChange(event.target.value);
    };

    return (
        <Card className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-2 shadow-sm md:w-auto">
                    <Search className="h-4 w-4 text-slate-500" />
                    <Input
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Cari pelamar, posisi, atau email"
                        className="border-none p-0 shadow-none focus-visible:ring-0"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Semua status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
                {statusOrder.map((status) => (
                    <div key={status} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            {status}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-blue-900">
                            {statusSummary[status] ?? 0}
                        </p>
                    </div>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>ID Lamaran</TableHead>
                            <TableHead>Pelamar</TableHead>
                            <TableHead>Posisi</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleApplications.map((application) => (
                            <TableRow key={application.id}>
                                <TableCell className="font-semibold text-blue-900">
                                    {formatApplicationId(application.id)}
                                </TableCell>
                                <TableCell>
                                    <p className="font-medium text-slate-900">{application.name}</p>
                                    <p className="text-sm text-slate-500">{application.email}</p>
                                </TableCell>
                                <TableCell>{application.position}</TableCell>
                                <TableCell>{statusBadge(application.status)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onViewDetail(application)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {visibleApplications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                        Tidak ada pelamar yang sesuai dengan filter.
                    </div>
                ) : null}
            </div>
        </Card>
    );
}
