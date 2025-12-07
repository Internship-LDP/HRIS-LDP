import { Head, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Clock, FileText } from "lucide-react";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import StaffLayout from "@/Pages/Staff/components/Layout";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Checkbox } from "@/Components/ui/checkbox";
import { Badge } from "@/Components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Progress } from "@/Components/ui/progress";
import type { PageProps } from "@/types";

import type {
    ProfileInfo,
    TerminationRecord,
    ResignationPageProps,
} from "../Staff/types";

export default function StaffResignation() {
    const {
        props: { profile, activeRequest, history },
    } = usePage<PageProps<ResignationPageProps>>();

    const form = useForm({
        effective_date: "",
        reason: "",
        suggestion: "",
        confirmation: false,
    });

    const hasActiveRequest = Boolean(activeRequest);
    const [clientError, setClientError] = useState<string | null>(null);

    const getProgressValue = (req: TerminationRecord | null) => {
        if (!req) return 0;
        const raw = Number(req.progress ?? 0);
        const statusLower = (req.status ?? "").toLowerCase();
        const isInitial =
            statusLower.includes("diajukan") ||
            statusLower.includes("menunggu") ||
            statusLower.includes("pending") ||
            statusLower.includes("baru");
        return isInitial ? 0 : Math.max(0, raw);
    };

    const submit = () => {
        if (hasActiveRequest || !form.data.confirmation) return;

        const trimmedReason = form.data.reason.trim();
        const trimmedSuggestion = form.data.suggestion.trim();

        if (!form.data.effective_date || !trimmedReason || !trimmedSuggestion) {
            setClientError("Semua field wajib diisi.");
            return;
        }

        setClientError(null);

        form.post(route("staff.resignation.store"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Pengajuan resign berhasil dikirim.");
                form.reset();
            },
            onError: () => {
                toast.error("Pengajuan gagal dikirim. Periksa data Anda lalu coba lagi.");
            },
        });
    };

    return (
        <>
            <Head title="Pengajuan Resign" />

            <StaffLayout
                title="Pengajuan Resign"
                description="Ajukan permohonan resign dan pantau proses offboarding Anda."
                breadcrumbs={[
                    { label: "Dashboard", href: route("staff.dashboard") },
                    { label: "Pengajuan Resign" },
                ]}
            >
                {/* FORM + INFO PANEL */}
                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    {/* FORM */}
                    <Card className="p-6 w-full">
                        <h2 className="text-lg font-semibold text-blue-900">
                            Form Pengajuan Resign
                        </h2>
                        <p className="text-sm text-slate-500">
                            Data pribadi terisi otomatis.
                        </p>

                        <div className="mt-5 space-y-4">
                            {/* GRID FORM */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <FormField
                                    label="Nama Lengkap"
                                    value={profile.name}
                                    disabled
                                />
                                <FormField
                                    label="ID Karyawan"
                                    value={profile.employeeCode ?? "-"}
                                    disabled
                                />
                                <FormField
                                    label="Divisi"
                                    value={profile.division ?? "-"}
                                    disabled
                                />
                                <FormField
                                    label="Posisi"
                                    value={profile.position ?? "-"}
                                    disabled
                                />
                                <FormField
                                    type="date"
                                    label="Tanggal Bergabung"
                                    value={profile.joinedAt ?? ""}
                                    disabled
                                />

                                <div className="flex flex-col">
                                    <Label>Tanggal Efektif Resign</Label>
                                    <Input
                                        type="date"
                                        value={form.data.effective_date}
                                        disabled={hasActiveRequest}
                                        required
                                        onChange={(e) =>
                                            form.setData(
                                                "effective_date",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Alasan */}
                            <div className="w-full">
                                <Label>Alasan Resign</Label>
                                <Textarea
                                    rows={4}
                                    value={form.data.reason}
                                    disabled={hasActiveRequest}
                                    required
                                    onChange={(e) =>
                                        form.setData("reason", e.target.value)
                                    }
                                />
                            </div>

                            {/* Saran */}
                            <div className="w-full">
                                <Label>Saran (Opsional)</Label>
                                <Textarea
                                    rows={3}
                                    value={form.data.suggestion}
                                    disabled={hasActiveRequest}
                                    required
                                    onChange={(e) =>
                                        form.setData(
                                            "suggestion",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-start gap-3 p-3 border rounded-lg bg-slate-50 w-full">
                                <Checkbox
                                    checked={form.data.confirmation}
                                    disabled={hasActiveRequest}
                                    onCheckedChange={(v) =>
                                        form.setData("confirmation", Boolean(v))
                                    }
                                />
                                <Label className="text-sm">
                                    Saya memahami bahwa pengajuan ini diproses
                                    sesuai kebijakan perusahaan.
                                </Label>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    onClick={submit}
                                    disabled={
                                        form.processing ||
                                        !form.data.confirmation ||
                                        !form.data.effective_date ||
                                        !form.data.reason.trim() ||
                                        !form.data.suggestion.trim() ||
                                        hasActiveRequest
                                    }
                                    className="bg-blue-900 text-white hover:bg-blue-800"
                                >
                                    {form.processing
                                        ? "Mengirim..."
                                        : "Submit Pengajuan"}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={hasActiveRequest}
                                    onClick={() => form.reset()}
                                >
                                    Reset
                                </Button>
                                {clientError && (
                                    <p className="text-sm text-red-500 mt-1">{clientError}</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* INFO PANEL */}
                    <div className="space-y-4 w-full">
                        <InfoCard
                            icon={
                                <FileText className="h-5 w-5 text-blue-900" />
                            }
                            title="Masa Pemberitahuan"
                            description="Minimal 30 hari sebelum tanggal efektif."
                            color="bg-blue-50 border-blue-200"
                        />
                        <InfoCard
                            icon={<Clock className="h-5 w-5 text-amber-900" />}
                            title="Serah Terima"
                            description="Lengkapi dokumentasi sebelum hari terakhir."
                            color="bg-amber-50 border-amber-200"
                        />
                        <InfoCard
                            icon={
                                <CheckCircle className="h-5 w-5 text-green-900" />
                            }
                            title="Exit Interview"
                            description="HR akan menjadwalkan sesi interview."
                            color="bg-green-50 border-green-200"
                        />
                    </div>
                </div>

                {/* STATUS SECTION */}
                <Card className="p-6 mt-6">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-blue-900">
                                Status Pengajuan
                            </h2>
                            <p className="text-sm text-slate-500">
                                Monitor progres dan riwayat.
                            </p>
                        </div>

                        {activeRequest && (
                            <Badge
                                variant="outline"
                                className="border-blue-500 text-blue-600"
                            >
                                Aktif: {activeRequest.reference}
                            </Badge>
                        )}
                    </div>

                    {/* ACTIVE REQUEST */}
                    {activeRequest ? (
                        <div className="mt-4 border rounded-xl p-5 bg-white shadow-sm">
                            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                Anda sudah memiliki pengajuan resign aktif. Form pengajuan dinonaktifkan sampai proses selesai.
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                <StatusItem
                                    label="Referensi"
                                    value={activeRequest.reference}
                                />
                                <StatusItem
                                    label="Tanggal Diajukan"
                                    value={activeRequest.requestDate}
                                />
                                <StatusItem
                                    label="Tanggal Efektif"
                                    value={activeRequest.effectiveDate}
                                />
                                <StatusItem
                                    label="Status"
                                    value={activeRequest.status}
                                    highlight
                                />
                            </div>

                            {/* PROGRESS */}
                            <div className="mt-6">
                                <p className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-1">
                                    Progress Proses Resign
                                </p>

                                <Progress
                                    value={getProgressValue(activeRequest)}
                                    className="h-3 rounded-full"
                                />

                                <p className="mt-1 text-xs text-slate-500">
                                    {getProgressValue(activeRequest)}% selesai
                                </p>
                            </div>

                            <div className="mt-4">
                                <p className="text-xs uppercase tracking-wide text-slate-500 font-medium mb-1">
                                    Catatan HR
                                </p>
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                                    {activeRequest.notes?.trim()?.length
                                        ? activeRequest.notes
                                        : "Belum ada catatan dari HR / Super Admin."}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 mt-3">
                            Belum ada pengajuan aktif.
                        </p>
                    )}

                    {/* HISTORY */}
                    <div className="mt-6">
                        <h3 className="font-semibold text-slate-700">
                            Riwayat Pengajuan
                        </h3>

                        {/* MOBILE CARD VIEW */}
                        <div className="mt-3 space-y-3 sm:hidden">
                            {history.length === 0 && (
                                <p className="text-sm text-slate-500">
                                    Belum ada riwayat.
                                </p>
                            )}

                            {history.map((item: TerminationRecord) => (
                                <div
                                    key={item.reference}
                                    className="border rounded-lg p-4 bg-white shadow-sm"
                                >
                                    <p className="text-sm font-semibold text-slate-900">
                                        {item.reference}
                                    </p>

                                    <div className="mt-2 text-xs text-slate-600 space-y-1">
                                        <p>
                                            <span className="font-medium">
                                                Diajukan:
                                            </span>{" "}
                                            {item.requestDate}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Efektif:
                                            </span>{" "}
                                            {item.effectiveDate}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-medium">
                                                Status:
                                            </span>
                                            <StatusBadge status={item.status} />
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* DESKTOP TABLE VIEW */}
                        <div className="mt-3 overflow-x-auto hidden sm:block">
                            <Table className="w-full min-w-[600px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Referensi</TableHead>
                                        <TableHead>Diajukan</TableHead>
                                        <TableHead>Efektif</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center text-sm text-slate-500"
                                            >
                                                Belum ada riwayat.
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {history.map((item: TerminationRecord) => (
                                        <TableRow key={item.reference}>
                                            <TableCell>
                                                {item.reference}
                                            </TableCell>
                                            <TableCell>
                                                {item.requestDate}
                                            </TableCell>
                                            <TableCell>
                                                {item.effectiveDate}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={item.status}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </Card>
            </StaffLayout>
        </>
    );
}

/* ---------------- COMPONENTS ---------------- */

interface FormFieldProps {
    label: string;
    value: string;
    disabled?: boolean;
    type?: string;
}

function FormField({ label, value, disabled, type = "text" }: FormFieldProps) {
    return (
        <div className="w-full">
            <Label>{label}</Label>
            <Input
                type={type}
                value={value}
                disabled={disabled}
                readOnly={disabled}
            />
        </div>
    );
}

interface InfoCardProps {
    icon: JSX.Element;
    title: string;
    description: string;
    color: string;
}

function InfoCard({ icon, title, description, color }: InfoCardProps) {
    return (
        <div className={`rounded-lg border p-4 w-full ${color}`}>
            <div className="flex gap-3">
                {icon}
                <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-xs text-slate-600">{description}</p>
                </div>
            </div>
        </div>
    );
}

interface StatusItemProps {
    label: string;
    value: string;
    highlight?: boolean;
}

function StatusItem({ label, value, highlight = false }: StatusItemProps) {
    return (
        <div className="flex flex-col">
            <p className="text-xs uppercase text-slate-500 font-medium mb-1">
                {label}
            </p>

            {highlight ? (
                <Badge
                    variant="outline"
                    className="border-blue-500 text-blue-700 w-fit px-2 py-1"
                >
                    {value}
                </Badge>
            ) : (
                <p className="text-sm font-semibold text-slate-900">{value}</p>
            )}
        </div>
    );
}

interface StatusBadgeProps {
    status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
    const s = status.toLowerCase();

    if (s.includes("selesai"))
        return (
            <Badge
                variant="outline"
                className="border-green-500 text-green-600"
            >
                {status}
            </Badge>
        );

    if (s.includes("proses") || s.includes("menunggu"))
        return (
            <Badge
                variant="outline"
                className="border-amber-500 text-amber-600"
            >
                {status}
            </Badge>
        );

    return <Badge variant="outline">{status}</Badge>;
}
