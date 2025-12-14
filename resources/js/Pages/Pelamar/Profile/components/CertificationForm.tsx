import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Plus, Save, Trash2, Upload, FileText, Image, Download, X } from 'lucide-react';
import { Certification } from '../profileTypes';
import { useRef } from 'react';
import { toast } from 'sonner';

interface CertificationFormProps {
    certifications: Certification[];
    onChange: (id: string, key: keyof Certification, value: string | File | null) => void;
    onAdd: () => void;
    onRemove: (id: string) => void;
    onSave: () => void;
    processing: boolean;
    disabled?: boolean;
}

export default function CertificationForm({
    certifications,
    onChange,
    onAdd,
    onRemove,
    onSave,
    processing,
    disabled = false,
}: CertificationFormProps) {
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const handleFileChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Format file tidak valid', {
                    description: 'File harus berformat JPG, JPEG, PNG, atau PDF',
                });
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ukuran file terlalu besar', {
                    description: 'Ukuran file maksimal 5MB',
                });
                return;
            }
            onChange(id, 'file', file);
        }
    };

    const getFileIcon = (certification: Certification) => {
        if (certification.file) {
            return certification.file.type === 'application/pdf' ? (
                <FileText className="h-5 w-5 text-red-500" />
            ) : (
                <Image className="h-5 w-5 text-blue-500" />
            );
        }
        if (certification.file_url) {
            const isPdf = certification.file_name?.toLowerCase().endsWith('.pdf');
            return isPdf ? (
                <FileText className="h-5 w-5 text-red-500" />
            ) : (
                <Image className="h-5 w-5 text-blue-500" />
            );
        }
        return null;
    };

    const getFileName = (certification: Certification) => {
        if (certification.file) {
            return certification.file.name;
        }
        if (certification.file_name) {
            return certification.file_name;
        }
        return null;
    };

    return (
        <Card className="p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-blue-900">Sertifikasi</h3>
                    <p className="text-sm text-slate-500">
                        Tambahkan sertifikat profesional yang Anda miliki (opsional).
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAdd}
                    className="border-blue-200 text-blue-900 hover:bg-blue-50"
                    disabled={disabled}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Sertifikasi
                </Button>
            </div>

            {certifications.length === 0 ? (
                <p className="text-sm text-slate-500">
                    Belum ada sertifikasi ditambahkan. Anda dapat menambahkan kapan saja.
                </p>
            ) : (
                <div className="space-y-4">
                    {certifications.map((certification, index) => (
                        <div key={certification.id} className="rounded-lg border border-slate-200 p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <Badge variant="outline">Sertifikasi #{index + 1}</Badge>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemove(certification.id)}
                                    className="text-red-500 hover:text-red-600"
                                    disabled={disabled}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>
                                        Nama Sertifikasi <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={certification.name ?? ''}
                                        onChange={(event) =>
                                            onChange(certification.id, 'name', event.target.value)
                                        }
                                        placeholder="Contoh: AWS Certified Solutions Architect"
                                        disabled={disabled}
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Organisasi Penerbit <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={certification.issuing_organization ?? ''}
                                        onChange={(event) =>
                                            onChange(certification.id, 'issuing_organization', event.target.value)
                                        }
                                        placeholder="Contoh: Amazon Web Services"
                                        disabled={disabled}
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Tanggal Terbit <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="month"
                                        value={certification.issue_date ?? ''}
                                        onChange={(event) =>
                                            onChange(certification.id, 'issue_date', event.target.value)
                                        }
                                        disabled={disabled}
                                    />
                                </div>
                                <div>
                                    <Label>Tanggal Kadaluarsa</Label>
                                    <Input
                                        type="month"
                                        value={certification.expiry_date ?? ''}
                                        onChange={(event) =>
                                            onChange(certification.id, 'expiry_date', event.target.value)
                                        }
                                        disabled={disabled}
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        Kosongkan jika sertifikat tidak memiliki masa berlaku
                                    </p>
                                </div>
                                <div>
                                    <Label>ID Kredensial</Label>
                                    <Input
                                        value={certification.credential_id ?? ''}
                                        onChange={(event) =>
                                            onChange(certification.id, 'credential_id', event.target.value)
                                        }
                                        placeholder="Contoh: ABC123XYZ"
                                        disabled={disabled}
                                    />
                                </div>
                                <div>
                                    <Label>Upload Sertifikat</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={(el) => (fileInputRefs.current[certification.id] = el)}
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => handleFileChange(certification.id, e)}
                                            className="hidden"
                                            disabled={disabled}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRefs.current[certification.id]?.click()}
                                            disabled={disabled}
                                            className="flex-shrink-0"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Pilih File
                                        </Button>
                                        {(certification.file || certification.file_url) && (
                                            <div className="flex flex-1 items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm">
                                                {getFileIcon(certification)}
                                                <span className="flex-1 truncate text-slate-700">
                                                    {getFileName(certification)}
                                                </span>
                                                {certification.file_url && !certification.file && (
                                                    <a
                                                        href={certification.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                )}
                                                {!disabled && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onChange(certification.id, 'file', null)}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Format: JPG, JPEG, PNG, atau PDF (maks. 5MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!disabled && (
                <div className="mt-6">
                    <Button
                        onClick={onSave}
                        disabled={processing}
                        className="bg-blue-900 hover:bg-blue-800"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Sertifikasi
                    </Button>
                </div>
            )}
        </Card>
    );
}
