import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { TerminationRecord } from '../types';
import { CheckSquare, FileText } from 'lucide-react';
import ChecklistDialog from './ChecklistDialog';

interface ActiveTerminationsTableProps {
    terminations: TerminationRecord[];
    checklistTemplate: string[];
}

export default function ActiveTerminationsTable({
    terminations,
    checklistTemplate,
}: ActiveTerminationsTableProps) {
    if (terminations.length === 0) {
        return (
            <p className="py-6 text-center text-sm text-slate-500">
                Belum ada proses offboarding aktif.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Karyawan</TableHead>
                    <TableHead>Divisi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Tanggal Efektif</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {terminations.map((request) => (
                    <TableRow key={request.id}>
                        <TableCell>{request.reference}</TableCell>
                        <TableCell>
                            <div>
                                <p className="font-medium text-slate-900">
                                    {request.employeeName}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {request.employeeCode}
                                </p>
                            </div>
                        </TableCell>
                        <TableCell>{request.division ?? '-'}</TableCell>
                        <TableCell>{typeBadge(request.type)}</TableCell>
                        <TableCell>{request.effectiveDate ?? '-'}</TableCell>
                        <TableCell>{statusBadge(request.status)}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 rounded-full bg-slate-200">
                                    <div
                                        className="h-2 rounded-full bg-blue-900"
                                        style={{ width: `${request.progress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500">
                                    {request.progress}%
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                <ChecklistDialog
                                    termination={request}
                                    checklistTemplate={checklistTemplate}
                                    trigger={
                                        <Button variant="ghost" size="sm">
                                            <CheckSquare className="mr-2 h-4 w-4" />
                                            Checklist
                                        </Button>
                                    }
                                />
                                <Button variant="ghost" size="sm">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Detail
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function statusBadge(status: string) {
    switch (status) {
        case 'Diajukan':
            return (
                <Badge variant="outline" className="border-blue-500 text-blue-500">
                    Diajukan
                </Badge>
            );
        case 'Proses':
            return (
                <Badge variant="outline" className="border-orange-500 text-orange-500">
                    Proses
                </Badge>
            );
        case 'Selesai':
            return (
                <Badge variant="outline" className="border-green-500 text-green-500">
                    Selesai
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function typeBadge(type: string) {
    return (
        <Badge className={type === 'Resign' ? 'bg-blue-500' : 'bg-red-500'}>
            {type}
        </Badge>
    );
}
