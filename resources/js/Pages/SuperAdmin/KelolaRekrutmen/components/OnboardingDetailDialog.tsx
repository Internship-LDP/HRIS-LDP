import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import { OnboardingItem } from '../types';
import { CheckCircle, FileText, Package, GraduationCap } from 'lucide-react';
import { router } from '@inertiajs/react';

interface OnboardingDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: OnboardingItem | null;
}

export default function OnboardingDetailDialog({
    open,
    onOpenChange,
    item,
}: OnboardingDetailDialogProps) {
    const [checklist, setChecklist] = useState({
        contract_signed: false,
        inventory_handover: false,
        training_orientation: false,
    });
    const [isSaving, setIsSaving] = useState(false);

    // Initialize checklist from item data when dialog opens
    useEffect(() => {
        if (item && item.steps) {
            // Load existing checklist data from item.steps
            setChecklist({
                contract_signed: item.steps[0]?.complete ?? false,
                inventory_handover: item.steps[1]?.complete ?? false,
                training_orientation: item.steps[2]?.complete ?? false,
            });
        }
    }, [item]);

    if (!item) return null;

    const handleCheckChange = (key: keyof typeof checklist) => {
        setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const allChecked = Object.values(checklist).every((value) => value);
    const anyChecked = Object.values(checklist).some((value) => value);

    const handleSaveProgress = () => {
        if (!item) return;

        setIsSaving(true);

        // Use application_id instead of name
        router.post(
            route('super-admin.onboarding.update-checklist', { id: item.application_id }),
            {
                contract_signed: checklist.contract_signed,
                inventory_handover: checklist.inventory_handover,
                training_orientation: checklist.training_orientation,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    onOpenChange(false);
                },
                onError: (errors) => {
                    setIsSaving(false);
                    console.error('Failed to save onboarding checklist:', errors);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Detail Onboarding</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Detail Pelamar */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <h3 className="mb-3 font-semibold text-blue-900">
                            Detail Pelamar
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Nama:</span>
                                <span className="font-medium text-slate-900">
                                    {item.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Posisi:</span>
                                <span className="font-medium text-slate-900">
                                    {item.position}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">
                                    Tanggal Mulai:
                                </span>
                                <span className="font-medium text-slate-900">
                                    {item.startedAt}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Status:</span>
                                <Badge
                                    className={
                                        item.status === 'Selesai'
                                            ? 'bg-green-500'
                                            : 'bg-orange-500'
                                    }
                                >
                                    {item.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Checklist Onboarding */}
                    <div className="rounded-lg border border-slate-200 p-4">
                        <h3 className="mb-4 font-semibold text-blue-900">
                            Checklist Onboarding
                        </h3>
                        <p className="mb-4 text-sm text-slate-500">
                            Centang item yang sudah selesai dan simpan progress secara bertahap
                        </p>
                        <div className="space-y-4">
                            {/* Kontrak ditandatangani */}
                            <div className="flex items-start space-x-3 rounded-lg bg-slate-50 p-3">
                                <Checkbox
                                    id="contract_signed"
                                    checked={checklist.contract_signed}
                                    onCheckedChange={() =>
                                        handleCheckChange('contract_signed')
                                    }
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <Label
                                        htmlFor="contract_signed"
                                        className="flex cursor-pointer items-center gap-2 text-base font-medium"
                                    >
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Kontrak ditandatangani
                                    </Label>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Pastikan kontrak kerja telah
                                        ditandatangani oleh karyawan baru
                                    </p>
                                </div>
                            </div>

                            {/* Serah terima inventaris */}
                            <div className="flex items-start space-x-3 rounded-lg bg-slate-50 p-3">
                                <Checkbox
                                    id="inventory_handover"
                                    checked={checklist.inventory_handover}
                                    onCheckedChange={() =>
                                        handleCheckChange('inventory_handover')
                                    }
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <Label
                                        htmlFor="inventory_handover"
                                        className="flex cursor-pointer items-center gap-2 text-base font-medium"
                                    >
                                        <Package className="h-5 w-5 text-emerald-600" />
                                        Serah terima inventaris
                                    </Label>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Serah terima peralatan kerja seperti
                                        laptop, ID card, dll
                                    </p>
                                </div>
                            </div>

                            {/* Training & orientasi */}
                            <div className="flex items-start space-x-3 rounded-lg bg-slate-50 p-3">
                                <Checkbox
                                    id="training_orientation"
                                    checked={checklist.training_orientation}
                                    onCheckedChange={() =>
                                        handleCheckChange(
                                            'training_orientation',
                                        )
                                    }
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <Label
                                        htmlFor="training_orientation"
                                        className="flex cursor-pointer items-center gap-2 text-base font-medium"
                                    >
                                        <GraduationCap className="h-5 w-5 text-purple-600" />
                                        Training & orientasi
                                    </Label>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Karyawan telah mengikuti program
                                        training dan orientasi perusahaan
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        {allChecked && (
                            <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">
                                    Semua checklist telah selesai!
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Tutup
                    </Button>
                    <Button
                        onClick={handleSaveProgress}
                        className="bg-blue-900 hover:bg-blue-800"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Progress'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
