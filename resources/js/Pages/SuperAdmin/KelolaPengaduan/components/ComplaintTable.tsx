import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { PaginationLink, ComplaintRecord } from '../types';

interface ComplaintTableProps {
    complaints: ComplaintRecord[];
    links: PaginationLink[];
    onSelect: (complaint: ComplaintRecord) => void;
}

export default function ComplaintTable({
    complaints,
    links,
    onSelect,
}: ComplaintTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead className="uppercase">ID</TableHead>
                        <TableHead>Pelapor</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Subjek</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Prioritas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {complaints.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={8}
                                className="px-4 py-12 text-center text-slate-500"
                            >
                                Tidak ada pengaduan yang sesuai filter.
                            </TableCell>
                        </TableRow>
                    )}

                    {complaints.map((complaint) => (
                        <TableRow
                            key={complaint.id}
                            className="hover:bg-slate-50/70 transition"
                        >
                            <TableCell className="font-semibold text-slate-900">
                                {complaint.code}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-900">
                                        {complaint.reporter}
                                    </span>
                                    {complaint.reporterEmail && (
                                        <span className="text-xs text-slate-500">
                                            {complaint.reporterEmail}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium">
                                    {complaint.category}
                                </span>
                            </TableCell>
                            <TableCell className="max-w-[240px] truncate">
                                {complaint.subject}
                            </TableCell>
                            <TableCell>{complaint.submittedAt ?? '-'}</TableCell>
                            <TableCell>
                                {renderPriorityBadge(complaint.priority, complaint.priorityLabel)}
                            </TableCell>
                            <TableCell>
                                {renderStatusBadge(complaint.status, complaint.statusLabel)}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSelect(complaint)}
                                    className="text-blue-900 hover:text-blue-800"
                                >
                                    Detail
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        {links.length > 1 && (
                <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
                    <span className="text-slate-500">
                        Menampilkan {complaints.length} data
                    </span>
                    <div className="flex gap-2">
                        {links.map((link, index) => (
                            <a
                                key={`${link.label}-${index}`}
                                href={link.url ?? '#'}
                                onClick={(event) => {
                                    if (!link.url) {
                                        event.preventDefault();
                                    }
                                }}
                                className={`rounded px-3 py-1 ${
                                    link.active
                                        ? 'bg-blue-900 text-white'
                                        : link.url
                                          ? 'text-blue-900 hover:bg-blue-50'
                                          : 'text-slate-400'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function renderPriorityBadge(priority: string, label: string) {
    switch (priority) {
        case 'high':
            return (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                    {label}
                </span>
            );
        case 'medium':
            return (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
                    {label}
                </span>
            );
        default:
            return (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
                    {label}
                </span>
            );
    }
}

function renderStatusBadge(status: string, label: string) {
    switch (status) {
        case 'new':
            return (
                <span className="rounded-full border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
                    {label}
                </span>
            );
        case 'in_progress':
            return (
                <span className="rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-600">
                    {label}
                </span>
            );
        case 'resolved':
            return (
                <span className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-600">
                    {label}
                </span>
            );
        default:
            return (
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                    {label}
                </span>
            );
    }
}
