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
import { FileText } from 'lucide-react';

export interface LetterRecord {
    id: number;
    letterNumber: string;
    senderName: string;
    senderDivision?: string | null;
    senderPosition?: string | null;
    recipientName: string;
    subject: string;
    letterType: string;
    category: string;
    priority: string;
    date: string;
    status: string;
    content: string;
    type: 'masuk' | 'keluar';
    attachment?: {
        name: string | null;
        size?: string | null;
        url?: string | null;
    } | null;
    targetDivision?: string | null;
    currentRecipient?: string;
}

interface LettersTableProps {
    letters: LetterRecord[];
    variant: 'inbox' | 'outbox';
    onSelect: (letter: LetterRecord) => void;
}

function getPriorityBadge(priority: string) {
    switch (priority) {
        case 'high':
            return <Badge className="bg-red-500">Tinggi</Badge>;
        case 'medium':
            return <Badge className="bg-orange-500">Sedang</Badge>;
        case 'low':
            return <Badge className="bg-blue-500">Rendah</Badge>;
        default:
            return <Badge variant="outline">{priority}</Badge>;
    }
}

function getStatusBadge(status: string) {
    const normalized = status.toLowerCase();

    if (normalized === 'diterima') {
        return (
            <Badge variant="outline" className="border-blue-500 text-blue-600">
                Diterima
            </Badge>
        );
    }
    if (normalized === 'diproses') {
        return (
            <Badge
                variant="outline"
                className="border-orange-500 text-orange-600"
            >
                Diproses
            </Badge>
        );
    }
    if (normalized === 'selesai') {
        return (
            <Badge
                variant="outline"
                className="border-green-500 text-green-600"
            >
                Selesai
            </Badge>
        );
    }

    return <Badge variant="outline">{status}</Badge>;
}

export default function LettersTable({
    letters,
    variant,
    onSelect,
}: LettersTableProps) {
    const isInbox = variant === 'inbox';

    if (letters.length === 0) {
        return (
            <div className="py-10 text-center text-slate-500">
                Tidak ada data surat pada tab ini.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{isInbox ? 'ID Surat' : 'Nomor Surat'}</TableHead>
                    <TableHead>{isInbox ? 'Dari' : 'Pengirim'}</TableHead>
                    <TableHead>{isInbox ? 'Pengirim' : 'Kepada'}</TableHead>
                    <TableHead>Subjek</TableHead>
                    {!isInbox && <TableHead>Jenis Surat</TableHead>}
                    <TableHead>Kategori</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {letters.map((letter) => (
                    <TableRow key={letter.id}>
                        <TableCell>
                            {isInbox ? letter.id : letter.letterNumber}
                        </TableCell>
                        <TableCell>
                            <p className="text-sm font-medium text-slate-900">
                                {isInbox ? letter.senderDivision : letter.senderName}
                            </p>
                        </TableCell>
                        <TableCell>
                            <p className="text-sm text-slate-900">
                                {isInbox ? letter.senderName : letter.recipientName}
                            </p>
                            {letter.senderPosition && (
                                <p className="text-xs text-slate-500">
                                    {letter.senderPosition}
                                </p>
                            )}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span className="line-clamp-1 text-sm">
                                    {letter.subject}
                                </span>
                                {letter.attachment && (
                                    <FileText className="h-4 w-4 text-slate-400" />
                                )}
                            </div>
                        </TableCell>
                        {!isInbox && (
                            <TableCell>
                                <Badge variant="outline">{letter.letterType}</Badge>
                            </TableCell>
                        )}
                        <TableCell>
                            <Badge variant="outline">{letter.category}</Badge>
                        </TableCell>
                        <TableCell>{getPriorityBadge(letter.priority)}</TableCell>
                        <TableCell>{letter.date}</TableCell>
                        <TableCell>{getStatusBadge(letter.status)}</TableCell>
                        <TableCell className="text-right">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSelect(letter)}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Detail
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
