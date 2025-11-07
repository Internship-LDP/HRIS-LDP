import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { useMemo } from 'react';
import { Upload, X } from 'lucide-react';

interface ComposeLetterDialogProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    triggerLabel?: string;
    data: {
        penerima: string;
        perihal: string;
        isi_surat: string;
        jenis_surat: string;
        kategori: string;
        prioritas: string;
        target_division: string;
        lampiran: File | null;
    };
    setData: (field: string, value: unknown) => void;
    errors: Record<string, string | undefined>;
    processing: boolean;
    onSubmit: () => void;
    userInfo: {
        name: string;
        division?: string | null;
        role?: string | null;
    };
    options: {
        letterTypes: string[];
        categories: string[];
        priorities: Record<string, string>;
        divisions: string[];
    };
    letterNumberPreview: string;
}

export default function ComposeLetterDialog({
    open,
    onOpenChange,
    triggerLabel = 'Buat Surat Baru',
    data,
    setData,
    errors,
    processing,
    onSubmit,
    userInfo,
    options,
    letterNumberPreview,
}: ComposeLetterDialogProps) {
    const priorityEntries = useMemo(
        () => Object.entries(options.priorities),
        [options.priorities],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white">
                <DialogHeader>
                    <DialogTitle>Buat Surat Baru</DialogTitle>
                </DialogHeader>

                <form
                    className="space-y-5"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit();
                    }}
                >
                    <section className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">
                            Informasi Pengirim
                        </p>
                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <InfoItem label="Nama Pengirim" value={userInfo.name} />
                            <InfoItem
                                label="Jabatan"
                                value={userInfo.role ?? 'Tidak diketahui'}
                            />
                            <InfoItem
                                label="Divisi"
                                value={userInfo.division ?? 'Tidak diketahui'}
                            />
                            <InfoItem
                                label="Nomor Surat (Preview)"
                                value={letterNumberPreview}
                            />
                        </div>
                    </section>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>
                                Jenis Surat <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.jenis_surat}
                                onValueChange={(value) => setData('jenis_surat', value)}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Pilih jenis surat" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {options.letterTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.jenis_surat && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.jenis_surat}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Tanggal Surat</Label>
                            <Input
                                value={new Date().toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                                disabled
                                className="bg-slate-100"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>
                                Divisi Tujuan <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.target_division}
                                onValueChange={(value) =>
                                    setData('target_division', value)
                                }
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Pilih divisi tujuan" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {options.divisions.map((division) => (
                                        <SelectItem key={division} value={division}>
                                            {division}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.target_division && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.target_division}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>
                                Kepada <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={data.penerima}
                                onChange={(event) =>
                                    setData('penerima', event.target.value)
                                }
                                placeholder="Nama penerima / divisi / instansi"
                            />
                            {errors.penerima && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.penerima}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label>
                            Subjek Surat <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={data.perihal}
                            onChange={(event) => setData('perihal', event.target.value)}
                            placeholder="Subjek surat"
                        />
                        {errors.perihal && (
                            <p className="mt-1 text-sm text-red-500">{errors.perihal}</p>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>
                                Kategori <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.kategori}
                                onValueChange={(value) => setData('kategori', value)}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {options.categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.kategori && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.kategori}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>
                                Prioritas <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={data.prioritas}
                                onValueChange={(value) => setData('prioritas', value)}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Pilih prioritas" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {priorityEntries.map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.prioritas && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.prioritas}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label>
                            Isi Surat <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            rows={8}
                            placeholder="Tulis isi surat di sini..."
                            value={data.isi_surat}
                            onChange={(event) => setData('isi_surat', event.target.value)}
                        />
                        {errors.isi_surat && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.isi_surat}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label>Lampiran (Opsional - PDF atau JPG, Max 5MB)</Label>
                        <label
                            htmlFor="lampiran"
                            className="mt-2 block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 transition hover:border-blue-500 hover:text-blue-600"
                        >
                            <Upload className="mx-auto mb-2 h-6 w-6" />
                            Klik untuk mengunggah lampiran
                        </label>
                        <input
                            id="lampiran"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(event) =>
                                setData('lampiran', event.target.files?.[0] ?? null)
                            }
                        />
                        {data.lampiran && (
                            <div className="mt-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
                                <div>
                                    <p className="font-medium text-slate-900">
                                        {data.lampiran.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(data.lampiran.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="text-red-500"
                                    onClick={() => setData('lampiran', null)}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        {errors.lampiran && (
                            <p className="mt-1 text-sm text-red-500">{errors.lampiran}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Button
                            type="submit"
                            className="bg-blue-900 hover:bg-blue-800"
                            disabled={processing}
                        >
                            {processing ? 'Mengirim...' : 'Kirim Surat'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs text-blue-900/70">{label}</p>
            <p className="text-sm font-medium text-blue-900">{value ?? '-'}</p>
        </div>
    );
}
