import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { FileText } from 'lucide-react';
import { LetterRecord } from './LettersTable';

interface ArchiveListProps {
    letters: LetterRecord[];
    onSelect: (letter: LetterRecord) => void;
}

export default function ArchiveList({ letters, onSelect }: ArchiveListProps) {
    if (letters.length === 0) {
        return (
            <div className="py-10 text-center text-slate-500">
                Arsip masih kosong.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {letters.map((letter) => (
                <Card
                    key={letter.id}
                    className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                >
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {letter.subject}
                        </p>
                        <p className="text-xs text-slate-500">
                            {letter.letterNumber} • {letter.category} • {letter.date}
                        </p>
                        <p className="text-xs text-slate-500">
                            Pengirim: {letter.senderName} • Penerima: {letter.recipientName}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">Diarsipkan</Badge>
                        <Button variant="ghost" size="sm" onClick={() => onSelect(letter)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Detail
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
}
