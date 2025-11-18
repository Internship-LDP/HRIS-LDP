import { useState } from 'react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import { Archive, FileText, Loader2 } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';

export type ReplyHistoryEntry = {
    id: number | null;
    note: string;
    author?: string | null;
    division?: string | null;
    toDivision?: string | null;
    timestamp?: string | null;
};

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
    replyNote?: string | null;
    replyBy?: string | null;
    replyAt?: string | null;
    replyHistory?: ReplyHistoryEntry[];
    dispositionNote?: string | null;
    disposedBy?: string | null;
    disposedAt?: string | null;
    approvalDate?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

interface LettersTableProps {
    letters: LetterRecord[];
    variant: 'inbox' | 'outbox';
    onSelect: (letter: LetterRecord) => void;
    onArchive?: (letter: LetterRecord) => void;
    archivingId?: number | null;
    archiveProcessing?: boolean;
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
    onArchive,
    archivingId,
    archiveProcessing,
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
                    <TableHead>Divisi Tujuan</TableHead>
                    {!isInbox && <TableHead>Jenis Surat</TableHead>}
                    <TableHead>Kategori</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {letters.map((letter) => {
                    const latestReply =
                        letter.replyHistory && letter.replyHistory.length > 0
                            ? letter.replyHistory[letter.replyHistory.length - 1]
                            : undefined;
                    const hasReply = Boolean(latestReply || letter.replyNote);

                    return (
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
                        <TableCell>
                            <p className="text-sm font-medium text-slate-900">
                                {letter.targetDivision ?? letter.recipientName ?? '-'}
                            </p>
                            {letter.targetDivision && letter.recipientName && letter.targetDivision !== letter.recipientName && (
                                <p className="text-[11px] text-slate-500">Penerima: {letter.recipientName}</p>
                            )}
                        </TableCell>
                        {!isInbox && (
                            <TableCell>
                                <Badge variant="outline">{letter.letterType}</Badge>
                            </TableCell>
                        )}
                        <TableCell>
                            <Badge variant="outline">{letter.category}</Badge>
                        </TableCell>
                        <TableCell>
                            <PriorityBadge priority={letter.priority} />
                        </TableCell>
                        <TableCell>{letter.date}</TableCell>
                        <TableCell>
                            {getStatusBadge(letter.status)}
                            {hasReply && (
                                <p className="mt-1 text-xs font-medium text-emerald-700">
                                    Balasan tersedia
                                </p>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onSelect(letter)}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Detail
                                </Button>
                                {onArchive && (
                                    <ArchiveActionButton
                                        letter={letter}
                                        onConfirm={onArchive}
                                        disabled={archiveProcessing}
                                        isProcessing={archiveProcessing && archivingId === letter.id}
                                    />
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

function ArchiveActionButton({
    letter,
    onConfirm,
    disabled,
    isProcessing,
}: {
    letter: LetterRecord;
    onConfirm: (letter: LetterRecord) => void;
    disabled?: boolean;
    isProcessing?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const canArchive = letter.status === 'Didisposisi';

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700"
                    disabled={disabled || letter.status === 'Diarsipkan'}
                >
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Archive className="mr-2 h-4 w-4" />
                    )}
                    Arsipkan
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Arsipkan surat ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {canArchive
                            ? 'Surat akan dipindahkan ke tab Arsip dan tidak muncul di daftar aktif.'
                            : 'Surat belum didisposisi oleh HR sehingga belum dapat diarsipkan.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-rose-600 hover:bg-rose-700"
                        disabled={!canArchive || disabled || isProcessing}
                        onClick={() => {
                            if (!canArchive || disabled || isProcessing) {
                                return;
                            }
                            onConfirm(letter);
                            setOpen(false);
                        }}
                    >
                        {isProcessing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Ya, Arsipkan'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

