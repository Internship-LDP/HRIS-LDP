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
import type { DivisionRecord } from './types';

export type EditFormFields = {
    description: string;
    manager_name: string;
    capacity: number;
};

type EditDivisionDialogProps = {
    division: DivisionRecord | null;
    form: InertiaFormProps<EditFormFields>;
    onClose: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function EditDivisionDialog({
    division,
    form,
    onClose,
    onSubmit,
}: EditDivisionDialogProps) {
    return (
        <Dialog open={Boolean(division)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Perbarui Divisi</DialogTitle>
                    <DialogDescription>
                        Sesuaikan deskripsi, manager, dan kapasitas divisi.
                    </DialogDescription>
                </DialogHeader>

                {division && (
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="max-h-[65vh] space-y-6 overflow-y-auto pr-1">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nama Divisi</Label>
                                    <Input value={division.name} disabled className="bg-slate-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="division-manager">Manager</Label>
                                    <Input
                                        id="division-manager"
                                        value={form.data.manager_name}
                                        onChange={(event) =>
                                            form.setData('manager_name', event.target.value)
                                        }
                                        placeholder="Nama manager"
                                    />
                                    {form.errors.manager_name && (
                                        <p className="text-xs text-red-500">{form.errors.manager_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="division-description">Deskripsi Divisi</Label>
                                <Textarea
                                    id="division-description"
                                    rows={4}
                                    value={form.data.description}
                                    onChange={(event) => form.setData('description', event.target.value)}
                                    placeholder="Ceritakan fokus, mandat, dan aktivitas utama divisi."
                                />
                                {form.errors.description && (
                                    <p className="text-xs text-red-500">{form.errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="division-capacity">Kapasitas Staff</Label>
                                <Input
                                    id="division-capacity"
                                    type="number"
                                    min={division.current_staff}
                                    value={form.data.capacity}
                                    onChange={(event) => form.setData('capacity', Number(event.target.value))}
                                />
                                <p className="text-xs text-slate-500">
                                    Minimal harus {division.current_staff} karena itu jumlah staff aktif saat ini.
                                </p>
                                {form.errors.capacity && (
                                    <p className="text-xs text-red-500">{form.errors.capacity}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Batalkan
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
