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

interface EditDivisionDialogProps {
    division: DivisionRecord | null;
    form: InertiaFormProps<EditFormFields>;
    onClose: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function EditDivisionDialog({ division, form, onClose, onSubmit }: EditDivisionDialogProps) {
    return (
        <Dialog open={Boolean(division)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl p-6">
                <DialogHeader>
                    <DialogTitle>Perbarui Divisi</DialogTitle>
                    <DialogDescription>
                        Sesuaikan deskripsi, manager, dan kapasitas divisi.
                    </DialogDescription>
                </DialogHeader>

                {division && (
                    <form onSubmit={onSubmit} className="space-y-6 mt-4">
                        <div className="max-h-[65vh] space-y-6 overflow-y-auto pr-1">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nama Divisi</Label>
                                    <Input
                                        value={division.name}
                                        disabled
                                        className="bg-muted/40"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="division-manager">Manager</Label>
                                    <Input
                                        id="division-manager"
                                        value={form.data.manager_name}
                                        onChange={(e) => form.setData('manager_name', e.target.value)}
                                        placeholder="Nama manager"
                                    />
                                    {form.errors.manager_name && (
                                        <p className="text-xs text-destructive">{form.errors.manager_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="division-description">Deskripsi Divisi</Label>
                                <Textarea
                                    id="division-description"
                                    rows={4}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Ceritakan fokus, mandat, dan aktivitas utama divisi."
                                />
                                {form.errors.description && (
                                    <p className="text-xs text-destructive">{form.errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="division-capacity">Kapasitas Staff</Label>
                                <Input
                                    id="division-capacity"
                                    type="number"
                                    min={division.current_staff}
                                    value={form.data.capacity}
                                    onChange={(e) => form.setData('capacity', Number(e.target.value))}
                                />

                                <p className="text-xs text-muted-foreground">
                                    Minimal harus {division.current_staff} karena itu jumlah staff aktif saat ini.
                                </p>

                                {form.errors.capacity && (
                                    <p className="text-xs text-destructive">{form.errors.capacity}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={onClose}
                            >
                                Batalkan
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                disabled={form.processing}
                            >
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}