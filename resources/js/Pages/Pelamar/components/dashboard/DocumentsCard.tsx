import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { FileText } from 'lucide-react';

export interface DocumentItem {
    name: string;
    status: 'approved' | 'pending';
    date: string;
}

interface DocumentsCardProps {
    documents: DocumentItem[];
    onUpload?: () => void;
}

export default function DocumentsCard({
    documents,
    onUpload,
}: DocumentsCardProps) {
    return (
        <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900">
                    Dokumen Anda
                </h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onUpload}
                    className="border-blue-200 text-blue-900 hover:bg-blue-50"
                >
                    Upload Dokumen
                </Button>
            </div>
            {documents.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                    Belum ada dokumen yang diunggah.
                </p>
            ) : (
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <div
                            key={`${doc.name}-${doc.date}`}
                            className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"
                        >
                            <FileText className="h-5 w-5 text-blue-900" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900">
                                    {doc.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {doc.date}
                                </p>
                            </div>
                            {doc.status === 'approved' ? (
                                <Badge
                                    variant="outline"
                                    className="border-green-500 text-green-500"
                                >
                                    Approved
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="border-orange-500 text-orange-500"
                                >
                                    Pending
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
