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
import { useForm } from '@inertiajs/react';
import { UserMinus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TerminationDialogProps {
    typeOptions?: Array<'Resign' | 'PHK' | 'Pensiun'>;
}

export default function TerminationDialog({
    typeOptions = ['Resign', 'PHK', 'Pensiun'],
}: TerminationDialogProps) {
    const [open, setOpen] = useState(false);

    const form = useForm({
        employee_code: '',
        type: '' as '' | 'Resign' | 'PHK' | 'Pensiun',
        effective_date: '',
        reason: '',
        suggestion: '',
    });

    const handleSubmit = () => {
        form.post(route('super-admin.staff.store'), {
            onSuccess: () => {
                toast.success('Pengajuan termination berhasil disimpan');
                form.reset();
                setOpen(false);
            },
            onError: () => toast.error('Gagal menyimpan data, periksa input Anda'),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-900 hover:bg-blue-800">
                    <UserMinus className="mr-2 h-4 w-4" />
                    Input Termination
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Input Termination Baru</DialogTitle>
                </DialogHeader>
                <form
                    className="mt-4 space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSubmit();
                    }}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>ID Karyawan</Label>
                            <Input
                                placeholder="EMP-XXXX"
                                value={form.data.employee_code}
                                onChange={(event) =>
                                    form.setData('employee_code', event.target.value.toUpperCase())
                                }
                            />
                            {form.errors.employee_code && (
                                <p className="mt-1 text-sm text-red-500">
                                    {form.errors.employee_code}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Tipe</Label>
                            <Select
                                value={form.data.type}
                                onValueChange={(value) =>
                                    form.setData('type', value as 'Resign' | 'PHK' | 'Pensiun')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.type && (
                                <p className="mt-1 text-sm text-red-500">
                                    {form.errors.type}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Tanggal Efektif</Label>
                            <Input
                                type="date"
                                value={form.data.effective_date}
                                onChange={(event) =>
                                    form.setData('effective_date', event.target.value)
                                }
                            />
                            {form.errors.effective_date && (
                                <p className="mt-1 text-sm text-red-500">
                                    {form.errors.effective_date}
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Alasan</Label>
                            <Textarea
                                rows={3}
                                placeholder="Alasan resign/PHK"
                                value={form.data.reason}
                                onChange={(event) => form.setData('reason', event.target.value)}
                            />
                            {form.errors.reason && (
                                <p className="mt-1 text-sm text-red-500">{form.errors.reason}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <Label>Saran (Opsional)</Label>
                        <Textarea
                            rows={3}
                            placeholder="Saran untuk perusahaan"
                            value={form.data.suggestion}
                            onChange={(event) => form.setData('suggestion', event.target.value)}
                        />
                        {form.errors.suggestion && (
                            <p className="mt-1 text-sm text-red-500">
                                {form.errors.suggestion}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-blue-900 hover:bg-blue-800"
                        disabled={form.processing}
                    >
                        {form.processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
