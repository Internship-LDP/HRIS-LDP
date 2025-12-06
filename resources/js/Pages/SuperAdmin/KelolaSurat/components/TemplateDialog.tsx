import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Upload, Download, Trash2, Check, X, FileText, Info } from 'lucide-react';

interface Template {
    id: number;
    name: string;
    fileName: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
}

interface TemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PLACEHOLDERS: Record<string, string> = {
    '{{nomor_surat}}': 'Nomor Surat',
    '{{tanggal}}': 'Tanggal Surat',
    '{{pengirim}}': 'Nama Pengirim',
    '{{divisi_pengirim}}': 'Divisi Pengirim',
    '{{penerima}}': 'Penerima / Divisi Tujuan',
    '{{perihal}}': 'Perihal',
    '{{isi_surat}}': 'Isi Surat',
    '{{prioritas}}': 'Prioritas',
    '{{catatan_disposisi}}': 'Catatan Disposisi',
    '{{tanggal_disposisi}}': 'Tanggal Disposisi',
    '{{oleh}}': 'HR yang Mendisposisi',
};

export default function TemplateDialog({ open, onOpenChange }: TemplateDialogProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    const form = useForm({
        name: '',
        template_file: null as File | null,
    });

    // Fetch templates when dialog opens
    useEffect(() => {
        if (open) {
            fetchTemplates();
        }
    }, [open]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('super-admin.letters.templates.list'));
            const data = await response.json();
            setTemplates(data.templates || []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('super-admin.letters.templates.store'), {
            forceFormData: true,
            onSuccess: () => {
                setShowUpload(false);
                form.reset();
                fetchTemplates();
            },
        });
    };

    const handleToggle = (templateId: number) => {
        router.post(
            route('super-admin.letters.templates.toggle', { template: templateId }),
            {},
            { onSuccess: () => fetchTemplates() }
        );
    };

    const handleDelete = (templateId: number) => {
        if (confirm('Hapus template ini?')) {
            router.delete(
                route('super-admin.letters.templates.destroy', { template: templateId }),
                { onSuccess: () => fetchTemplates() }
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Template Surat Word
                    </DialogTitle>
                    <DialogDescription>
                        Upload template .docx dengan placeholder untuk disposisi final.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    <div className="px-6 py-4 space-y-4">
                        {/* Upload Section */}
                        {showUpload ? (
                            <Card className="p-4 border-dashed border-2">
                                <form onSubmit={handleUpload} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Template</Label>
                                        <Input
                                            id="name"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            placeholder="Contoh: Template Disposisi Resmi"
                                        />
                                        {form.errors.name && (
                                            <p className="text-xs text-red-500">{form.errors.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="template_file">File Template (.docx)</Label>
                                        <Input
                                            id="template_file"
                                            type="file"
                                            accept=".docx"
                                            onChange={(e) => form.setData('template_file', e.target.files?.[0] || null)}
                                        />
                                        {form.errors.template_file && (
                                            <p className="text-xs text-red-500">{form.errors.template_file}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => setShowUpload(false)}>
                                            Batal
                                        </Button>
                                        <Button type="submit" size="sm" disabled={form.processing}>
                                            {form.processing ? 'Mengupload...' : 'Upload'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        ) : (
                            <Button variant="outline" className="w-full gap-2" onClick={() => setShowUpload(true)}>
                                <Upload className="h-4 w-4" />
                                Upload Template Baru
                            </Button>
                        )}

                        {/* Templates List */}
                        <div>
                            <h4 className="text-sm font-medium mb-2">Template Tersedia</h4>
                            {loading ? (
                                <p className="text-sm text-slate-500 py-4 text-center">Memuat...</p>
                            ) : templates.length > 0 ? (
                                <div className="space-y-2">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{template.name}</p>
                                                <p className="text-xs text-slate-500">{template.fileName}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {template.isActive ? (
                                                    <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                                                ) : (
                                                    <Badge variant="outline">Nonaktif</Badge>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleToggle(template.id)}
                                                    title={template.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                                >
                                                    {template.isActive ? (
                                                        <X className="h-4 w-4 text-slate-500" />
                                                    ) : (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    asChild
                                                >
                                                    <a href={route('super-admin.letters.templates.download', { template: template.id })}>
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600"
                                                    onClick={() => handleDelete(template.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-sm text-slate-500">
                                    <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                    <p className="mb-3">Belum ada template</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        asChild
                                    >
                                        <a href={route('super-admin.letters.templates.sample')}>
                                            <Download className="h-4 w-4" />
                                            Unduh Template Contoh
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Download Sample Template */}
                        <div className="flex justify-center">
                            <Button
                                variant="link"
                                size="sm"
                                className="text-blue-600 gap-2"
                                asChild
                            >
                                <a href={route('super-admin.letters.templates.sample')}>
                                    <Download className="h-4 w-4" />
                                    Unduh Template Contoh untuk diedit
                                </a>
                            </Button>
                        </div>

                        {/* Placeholders Info */}
                        <div className="border-t pt-4">
                            <h4 className="flex items-center gap-2 text-sm font-medium mb-2">
                                <Info className="h-4 w-4 text-blue-600" />
                                Placeholder yang Tersedia
                            </h4>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                {Object.entries(PLACEHOLDERS).map(([key, label]) => (
                                    <div key={key} className="flex justify-between bg-slate-50 px-2 py-1 rounded">
                                        <code className="text-[10px] bg-white px-1 rounded">{key}</code>
                                        <span className="text-slate-500">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
