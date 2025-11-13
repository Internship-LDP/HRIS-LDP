import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { FileText } from 'lucide-react';
import { LetterRecord } from './LettersTable';
import { PriorityBadge } from './PriorityBadge';

interface LetterDetailDialogProps {
    letter: LetterRecord | null;
    open: boolean;
    onOpenChange: (value: boolean) => void;
}

export default function LetterDetailDialog({
    letter,
    open,
    onOpenChange,
}: LetterDetailDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl border-0 bg-white p-0">
                <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-4">
                    <DialogTitle>
                        Detail Surat {letter ? `: ${letter.subject}` : ''}
                    </DialogTitle>
                    <DialogDescription>
                        Tinjau metadata, isi surat, dan lampiran sebelum menindaklanjuti.
                    </DialogDescription>
                </DialogHeader>

                {!letter ? (
                    <p className="px-6 py-10 text-center text-sm text-slate-500">
                        Pilih surat untuk melihat detail.
                    </p>
                ) : (
                    <div className="space-y-5 px-6 pb-6 pt-4">
                        <div className="grid gap-4 rounded-xl border border-slate-200 p-4 text-sm md:grid-cols-2">
                            <DetailItem label="Nomor Surat" value={letter.letterNumber} />
                            <DetailItem label="Tanggal" value={letter.date} />
                            <DetailItem label="Pengirim" value={letter.senderName} />
                            <DetailItem label="Divisi" value={letter.senderDivision} />
                            <DetailItem label="Penerima" value={letter.recipientName} />
                            <DetailItem label="Jenis Surat" value={letter.letterType} />
                            <DetailItem label="Kategori" value={letter.category} />
                            <div>
                                <p className="text-xs text-slate-500">Prioritas</p>
                                <div className="mt-1">
                                    <PriorityBadge priority={letter.priority} />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Status</p>
                                <div className="mt-1">
                                    <Badge variant="outline">{letter.status}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-xl border border-dashed border-slate-200 p-4">
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Subjek
                            </p>
                            <p className="text-sm font-semibold text-slate-900">{letter.subject}</p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Isi Surat
                            </p>
                            <div className="mt-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                                {letter.content}
                            </div>
                        </div>

                        {letter.attachment && (
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Lampiran
                                </p>
                                <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium text-slate-900">
                                            {letter.attachment.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {letter.attachment.size}
                                        </p>
                                    </div>
                                    {letter.attachment.url && (
                                        <Button asChild size="sm" variant="outline">
                                            <a
                                                href={letter.attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Download
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {letter.replyNote && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-xs uppercase tracking-wide text-emerald-600">
                                    Catatan Balasan Divisi
                                </p>
                                <p className="mt-2 whitespace-pre-line text-sm text-emerald-900">
                                    {letter.replyNote}
                                </p>
                                <p className="mt-3 text-xs text-emerald-700">
                                    {letter.replyBy ? `Dibalas oleh ${letter.replyBy}` : 'Balasan'}
                                    {letter.replyAt ? ` pada ${letter.replyAt}` : ''}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm text-slate-900">{value ?? '-'}</p>
        </div>
    );
}
