import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import type { ComplaintRecord } from '../types';

interface ComplaintTableProps {
    complaints: ComplaintRecord[];
    onSelect: (complaint: ComplaintRecord) => void;
}

export default function ComplaintTable({ complaints, onSelect }: ComplaintTableProps) {
    return (
        <div className="mt-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Subjek</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Prioritas</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Catatan Penanganan</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {complaints.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-sm text-slate-500">
                                Belum ada data yang sesuai filter.
                            </TableCell>
                        </TableRow>
                    )}

                    {complaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                            <TableCell>{complaint.letterNumber ?? '-'}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{complaint.category}</Badge>
                            </TableCell>
                            <TableCell>{complaint.subject}</TableCell>
                            <TableCell>{complaint.date}</TableCell>
                            <TableCell>
                                <PriorityBadge priority={complaint.priority} />
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={complaint.status} />
                            </TableCell>
                            <TableCell className="max-w-xs text-sm text-slate-600">
                                {complaint.resolutionNotes?.length
                                    ? complaint.resolutionNotes
                                    : complaint.handler
                                    ? `Menunggu catatan dari ${complaint.handler}`
                                    : 'Belum ada catatan penanganan'}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => onSelect(complaint)}>
                                    Detail
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();

    if (normalized.includes('selesai')) {
        return (
            <Badge variant="outline" className="border-green-500 text-green-600">
                {status}
            </Badge>
        );
    }

    if (normalized.includes('proses') || normalized.includes('menunggu')) {
        return (
            <Badge variant="outline" className="border-amber-500 text-amber-600">
                {status}
            </Badge>
        );
    }

    return <Badge variant="outline">{status}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
    const normalized = priority.toLowerCase();

    if (normalized.includes('tinggi') || normalized === 'high') {
        return <Badge className="bg-red-500 text-white">Tinggi</Badge>;
    }

    if (normalized.includes('sedang') || normalized === 'medium') {
        return <Badge className="bg-orange-500 text-white">Sedang</Badge>;
    }

    return <Badge className="bg-blue-500 text-white">Rendah</Badge>;
}
