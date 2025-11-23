import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import type { InertiaFormProps } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import type { DivisionRecord } from './types';
import type { FormEvent } from 'react';

const MAX_REQUIREMENTS = 5;

export type JobFormFields = {
    job_title: string;
    job_description: string;
    job_requirements: string[];
};

type JobDialogProps = {
    division: DivisionRecord | null;
    form: InertiaFormProps<JobFormFields>;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function JobDialog({ division, form, onClose, onSubmit }: JobDialogProps) {
    const addRequirement = () => {
        if (form.data.job_requirements.length >= MAX_REQUIREMENTS) return;

        form.setData('job_requirements', [...form.data.job_requirements, '']);
    };

    const updateRequirement = (index: number, value: string) => {
        const requirements = [...form.data.job_requirements];
        requirements[index] = value;
        form.setData('job_requirements', requirements);
        form.clearErrors('job_requirements');
    };

    const removeRequirement = (index: number) => {
        if (form.data.job_requirements.length === 1) return;

        form.setData(
            'job_requirements',
            form.data.job_requirements.filter((_, idx) => idx !== index),
        );
    };

    const validateRequirements = () => {
        const hasEmptyRequirement = form.data.job_requirements.some(
            (requirement) => !requirement.trim(),
        );

        if (hasEmptyRequirement) {
            form.setError('job_requirements', 'Semua persyaratan wajib diisi.');
            window.alert('Semua persyaratan wajib diisi sebelum menyimpan.');
            return false;
        }

        form.clearErrors('job_requirements');
        return true;
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        if (!validateRequirements()) {
            event.preventDefault();
            return;
        }

        onSubmit(event);
    };

    return (
        <Dialog open={Boolean(division)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl p-6">
                <DialogHeader>
                    <DialogTitle>Publikasikan Lowongan</DialogTitle>
                    <DialogDescription>
                        Lengkapi detail rekrutmen untuk divisi {division?.name}.
                    </DialogDescription>
                </DialogHeader>

                {division && (
                    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                        <div className="max-h-[65vh] space-y-6 overflow-y-auto pr-1">
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                                Kapasitas {division.current_staff}/{division.capacity} • Slot tersedia {division.available_slots}
                                {division.available_slots === 0 && (
                                    <span className="mt-1 block text-xs text-red-600">
                                        Tidak ada slot kosong. Tingkatkan kapasitas sebelum membuka lowongan.
                                    </span>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Divisi</Label>
                                    <Input value={division.name} disabled className="bg-muted/40" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Manager</Label>
                                    <Input value={division.manager_name ?? '-'} disabled className="bg-muted/40" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job-title">Judul Lowongan</Label>
                                <Input
                                    id="job-title"
                                    value={form.data.job_title}
                                    onChange={(e) => form.setData('job_title', e.target.value)}
                                    placeholder="Contoh: Marketing Specialist"
                                />
                                {form.errors.job_title && (
                                    <p className="text-xs text-destructive">{form.errors.job_title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job-description">Deskripsi Pekerjaan</Label>
                                <Textarea
                                    id="job-description"
                                    rows={4}
                                    value={form.data.job_description}
                                    onChange={(e) => form.setData('job_description', e.target.value)}
                                    placeholder="Ceritakan tanggung jawab utama, ekspektasi, dan ruang lingkup pekerjaan."
                                />
                                {form.errors.job_description && (
                                    <p className="text-xs text-destructive">{form.errors.job_description}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Persyaratan Kandidat</Label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={addRequirement}
                                        disabled={form.data.job_requirements.length >= MAX_REQUIREMENTS}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Tambah
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Maksimal {MAX_REQUIREMENTS} persyaratan kandidat.
                                </p>

                                <div className="space-y-3">
                                    {form.data.job_requirements.map((requirement, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={requirement}
                                                onChange={(e) => updateRequirement(index, e.target.value)}
                                                placeholder={`Persyaratan ${index + 1}`}
                                                required
                                            />
                                            {form.data.job_requirements.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeRequirement(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {form.errors.job_requirements && (
                                    <p className="text-xs text-destructive">{form.errors.job_requirements}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="flex justify-end gap-2 pt-2">
                            <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={onClose}>
                                Batalkan
                            </Button>
                            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={form.processing}>
                                Simpan Lowongan
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
