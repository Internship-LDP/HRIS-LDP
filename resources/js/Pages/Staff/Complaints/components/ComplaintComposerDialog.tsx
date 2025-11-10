import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import type { FormDataType } from '@inertiajs/core';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import type { ComplaintFiltersOptions } from '../types';

interface ComplaintComposerDialogProps {
    open: boolean;
    filters: ComplaintFiltersOptions;
    onOpenChange: (open: boolean) => void;
}

type ComplaintFormData = FormDataType<{
    category: string;
    priority: string;
    subject: string;
    description: string;
    anonymous: boolean;
    attachment: File | null;
}>;

export default function ComplaintComposerDialog({
    open,
    filters,
    onOpenChange,
}: ComplaintComposerDialogProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const form = useForm<ComplaintFormData>({
        category: '',
        priority: 'medium',
        subject: '',
        description: '',
        anonymous: false,
        attachment: null,
    });

    const hasErrors = Object.keys(form.errors).length > 0;

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    };

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next);
        if (next) {
            form.clearErrors();
            setHasSubmitted(false);
        } else {
            resetForm();
        }
    };

    const resetForm = () => {
        form.reset();
        form.clearErrors();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setHasSubmitted(false);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        form.setData('attachment', file);
        if (file) {
            form.clearErrors('attachment');
        }
    };

    const removeAttachment = () => {
        form.setData('attachment', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        form.clearErrors('attachment');
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setHasSubmitted(true);

        form.post(route('staff.complaints.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaduan berhasil dikirim', {
                    description: 'Tim HR akan meninjau laporan Anda segera.',
                });
                handleClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white p-0">
                <div className="flex max-h-[90vh] w-full flex-col gap-4 overflow-y-auto px-6 py-6">
                    {hasErrors && hasSubmitted && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            Periksa kembali data yang Anda masukkan. Beberapa field masih membutuhkan perhatian.
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                            <Checkbox
                                id="anonymous"
                                checked={form.data.anonymous}
                                onCheckedChange={(checked) => form.setData('anonymous', Boolean(checked))}
                            />
                            <div className="space-y-1">
                                <Label htmlFor="anonymous" className="cursor-pointer text-sm font-medium text-blue-900">
                                    Kirim sebagai anonim
                                </Label>
                                <p className="text-xs text-slate-600">
                                    Identitas Anda tidak akan ditampilkan kepada pihak lain selain tim HR.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormSelect
                                label="Kategori"
                                placeholder="Pilih kategori"
                                value={form.data.category}
                                options={applyFallback(filters.categories, [
                                    'Lingkungan Kerja',
                                    'Kompensasi & Benefit',
                                    'Fasilitas',
                                    'Relasi Kerja',
                                    'Kebijakan Perusahaan',
                                    'Lainnya',
                                ])}
                                onChange={(value) => {
                                    form.setData('category', value);
                                    form.clearErrors('category');
                                }}
                                error={form.errors.category}
                            />

                            <FormSelect
                                label="Prioritas"
                                placeholder="Pilih prioritas"
                                value={form.data.priority}
                                options={[
                                    { value: 'high', label: 'Tinggi (Perlu perhatian segera)' },
                                    { value: 'medium', label: 'Sedang' },
                                    { value: 'low', label: 'Rendah' },
                                ]}
                                onChange={(value) => {
                                    form.setData('priority', value);
                                    form.clearErrors('priority');
                                }}
                                error={form.errors.priority}
                            />
                        </div>

                        <FormField
                            label="Subjek"
                            value={form.data.subject}
                            placeholder="Ringkasan singkat pengaduan/saran"
                            onChange={(value) => {
                                form.setData('subject', value);
                                form.clearErrors('subject');
                            }}
                            error={form.errors.subject}
                        />

                        <FormTextarea
                            label="Deskripsi Detail"
                            value={form.data.description}
                            placeholder="Jelaskan secara detail pengaduan atau saran Anda..."
                            onChange={(value) => {
                                form.setData('description', value);
                                form.clearErrors('description');
                            }}
                            error={form.errors.description}
                        />

                        <div>
                            <Label>Lampiran (Opsional - PDF atau JPG, JPEG, PNG Max 5MB)</Label>
                            <div className="space-y-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-sm text-slate-600 transition hover:border-blue-500 hover:text-blue-700"
                                >
                                    <Upload className="mb-2 h-6 w-6" />
                                    {form.data.attachment
                                        ? 'Ganti lampiran'
                                        : 'Upload bukti pendukung (foto, dokumen, dll)'}
                                </button>
                                {form.data.attachment && (
                                    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                                        <span className="max-w-[220px] truncate">
                                            {form.data.attachment.name}
                                        </span>
                                        <button
                                            type="button"
                                            className="font-semibold text-blue-900 hover:underline"
                                            onClick={removeAttachment}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}
                                <p className="text-xs text-slate-500">
                                    Format yang diterima: PDF, JPG, PNG dengan ukuran maksimal 5 MB.
                                </p>
                            </div>
                            {form.errors.attachment && (
                                <p className="mt-1 text-xs text-red-500">{form.errors.attachment}</p>
                            )}
                        </div>

                        <DialogFooter className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={handleClose}
                                disabled={form.processing}
                            >
                                Batalkan
                            </Button>
                            <Button
                                type="submit"
                                className="w-full bg-blue-900 hover:bg-blue-800 text-white sm:w-auto"
                                disabled={form.processing}
                            >
                                {form.processing ? 'Mengirim...' : 'Kirim Pengaduan/Saran'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface FormSelectProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    options: Array<{ value: string; label: string }>;
}

function FormSelect({
    label,
    placeholder,
    value,
    options,
    onChange,
    error,
}: FormSelectProps) {
    return (
        <div>
            <Label>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

interface FormFieldProps {
    label: string;
    value: string;
    placeholder: string;
    error?: string;
    onChange: (value: string) => void;
}

function FormField({ label, value, placeholder, error, onChange }: FormFieldProps) {
    return (
        <div>
            <Label>{label}</Label>
            <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

interface FormTextareaProps extends Omit<FormFieldProps, 'onChange'> {
    onChange: (value: string) => void;
}

function FormTextarea({ label, value, placeholder, error, onChange }: FormTextareaProps) {
    return (
        <div>
            <Label>{label}</Label>
            <Textarea
                rows={6}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function applyFallback(values: string[], fallback: string[]) {
    if (values.length > 0) {
        return values.map((value) => ({ value, label: value }));
    }

    return fallback.map((value) => ({ value, label: value }));
}
