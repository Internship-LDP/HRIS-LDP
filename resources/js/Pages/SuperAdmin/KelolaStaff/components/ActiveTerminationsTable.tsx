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
import TerminationDetailDialog from './TerminationDetailDialog';

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
            <p className="py-6 text-center text-xs md:text-sm text-slate-500">
                Belum ada proses offboarding aktif.
            </p>
        );
    }

    return (
        <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
                {terminations.map((request) => (
                    <div key={request.id} className="rounded-lg border p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="font-semibold text-xs text-slate-900 truncate">{request.employeeName}</p>
                                <p className="text-[10px] text-slate-500">{request.employeeCode}</p>
                            </div>
                            {statusBadge(request.status, true)}
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <div>
                                <p className="text-[10px] text-slate-400">ID</p>
                                <p className="text-[11px] text-slate-700">{request.reference}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400">Divisi</p>
                                <p className="text-[11px] text-slate-700 truncate">{request.division ?? '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400">Tipe</p>
                                {typeBadge(request.type, true)}
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400">Tanggal Efektif</p>
                                <p className="text-[10px] text-slate-700">{request.effectiveDate ?? '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                                <div className="h-1.5 rounded-full bg-blue-900" style={{ width: `${request.progress}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-500">{request.progress}%</span>
                        </div>
                        <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                            <ChecklistDialog
                                termination={request}
                                checklistTemplate={checklistTemplate}
                                trigger={
                                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                                        <CheckSquare className="mr-1 h-3 w-3" />
                                        Checklist
                                    </Button>
                                }
                            />
                            <TerminationDetailDialog
                                termination={request}
                                trigger={
                                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                                        <FileText className="mr-1 h-3 w-3" />
                                        Detail
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
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
                                        <TerminationDetailDialog
                                            termination={request}
                                            trigger={
                                                <Button variant="ghost" size="sm">
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Detail
                                                </Button>
                                            }
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

function statusBadge(status: string, small = false) {
    const sizeClass = small ? 'text-[10px] px-1.5 py-0' : '';
    switch (status) {
        case 'Diajukan':
            return (
                <Badge variant="outline" className={`border-blue-500 text-blue-500 ${sizeClass}`}>
                    Diajukan
                </Badge>
            );
        case 'Proses':
            return (
                <Badge variant="outline" className={`border-orange-500 text-orange-500 ${sizeClass}`}>
                    Proses
                </Badge>
            );
        case 'Selesai':
            return (
                <Badge variant="outline" className={`border-green-500 text-green-500 ${sizeClass}`}>
                    Selesai
                </Badge>
            );
        default:
            return <Badge variant="outline" className={sizeClass}>{status}</Badge>;
    }
}

function typeBadge(type: string, small = false) {
    const sizeClass = small ? 'text-[10px] px-1.5 py-0' : '';
    return (
        <Badge className={`${type === 'Resign' ? 'bg-blue-500' : 'bg-red-500'} ${sizeClass}`}>
            {type}
        </Badge>
    );
}
