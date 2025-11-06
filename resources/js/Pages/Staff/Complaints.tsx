import { useMemo, useRef, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    FileText,
    Megaphone,
    MessageSquare,
    Search,
    Upload,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import StaffLayout from '@/Pages/Staff/components/Layout';
import StatsCard from '@/Pages/Staff/components/StatsCard';
import type { PageProps } from '@/types';

interface ComplaintRecord {
    id: number;
    letterNumber?: string | null;
    from: string;
    category: string;
    subject: string;
    date: string;
    status: string;
    priority: string;
    description?: string | null;
    attachment?: {
        name?: string | null;
        url?: string | null;
    };
}

interface RegulationRecord {
    id: number;
    title: string;
    category: string;
    uploadDate: string;
    fileName?: string | null;
    fileUrl?: string | null;
}

interface AnnouncementRecord {
    id: number;
    title: string;
    date: string;
    content: string;
}

interface ComplaintsPageProps extends Record<string, unknown> {
    stats: {
        new: number;
        inProgress: number;
        resolved: number;
        regulations: number;
    };
    complaints: ComplaintRecord[];
    filters: {
        categories: string[];
        statuses: string[];
        priorities: string[];
    };
    regulations: RegulationRecord[];
    announcements: AnnouncementRecord[];
}

export default function StaffComplaints() {
    const {
        props: { stats, complaints, filters, regulations, announcements },
    } = usePage<PageProps<ComplaintsPageProps>>();

    const [activeTab, setActiveTab] = useState<'complaints' | 'regulations' | 'forum'>(
        'complaints',
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [detailComplaint, setDetailComplaint] = useState<ComplaintRecord | null>(null);
    const [composerOpen, setComposerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm({
        category: '',
        subject: '',
        description: '',
        priority: '',
        attachment: null as File | null,
    });

    const filteredComplaints = useMemo(() => {
        const normalizedSearch = searchTerm.toLowerCase();

        return complaints.filter((complaint) => {
            const matchSearch =
                !normalizedSearch ||
                complaint.subject.toLowerCase().includes(normalizedSearch) ||
                (complaint.letterNumber ?? '').toLowerCase().includes(normalizedSearch) ||
                complaint.category.toLowerCase().includes(normalizedSearch);

            const matchStatus =
                statusFilter === 'all' ||
                complaint.status.toLowerCase() === statusFilter.toLowerCase();

            const matchCategory =
                categoryFilter === 'all' ||
                complaint.category.toLowerCase() === categoryFilter.toLowerCase();

            const matchPriority =
                priorityFilter === 'all' ||
                complaint.priority.toLowerCase() === priorityFilter.toLowerCase();

            return matchSearch && matchStatus && matchCategory && matchPriority;
        });
    }, [complaints, searchTerm, statusFilter, categoryFilter, priorityFilter]);

    const resetForm = () => {
        form.reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submitComplaint = () => {
        form.post(route('staff.complaints.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setComposerOpen(false);
                resetForm();
            },
        });
    };

    return (
        <>
            <Head title="Keluhan & Saran" />
            <StaffLayout
                title="Keluhan & Saran"
                description="Kirim pengaduan dan pantau tindak lanjut HR secara real-time."
                breadcrumbs={[
                    { label: 'Dashboard', href: route('staff.dashboard') },
                    { label: 'Keluhan & Saran' },
                ]}
                actions={
                    <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-900 hover:bg-blue-800">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Buat Pengaduan/Saran
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Form Pengaduan & Saran</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 space-y-4">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label>Kategori</Label>
                                        <Select
                                            value={form.data.category}
                                            onValueChange={(value) =>
                                                form.setData('category', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {renderOptions(filters.categories, [
                                                    'Lingkungan Kerja',
                                                    'Kompensasi & Benefit',
                                                    'Fasilitas',
                                                    'Relasi Kerja',
                                                    'Kebijakan Perusahaan',
                                                    'Lainnya',
                                                ]).map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {form.errors.category && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {form.errors.category}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Prioritas</Label>
                                        <Select
                                            value={form.data.priority}
                                            onValueChange={(value) =>
                                                form.setData('priority', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih prioritas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="high">
                                                    Tinggi (Perlu perhatian segera)
                                                </SelectItem>
                                                <SelectItem value="medium">Sedang</SelectItem>
                                                <SelectItem value="low">Rendah</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.errors.priority && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {form.errors.priority}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label>Subjek</Label>
                                    <Input
                                        value={form.data.subject}
                                        onChange={(event) =>
                                            form.setData('subject', event.target.value)
                                        }
                                        placeholder="Ringkasan singkat pengaduan/saran"
                                    />
                                    {form.errors.subject && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.subject}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>Deskripsi Detail</Label>
                                    <Textarea
                                        rows={6}
                                        value={form.data.description}
                                        onChange={(event) =>
                                            form.setData('description', event.target.value)
                                        }
                                        placeholder="Jelaskan secara detail pengaduan atau saran Anda..."
                                    />
                                    {form.errors.description && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.description}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>Lampiran (Opsional)</Label>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                form.setData('attachment', file ?? null);
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm text-slate-500 transition hover:border-blue-500 hover:text-blue-700"
                                        >
                                            <Upload className="mx-auto mb-2 h-6 w-6" />
                                            {form.data.attachment
                                                ? form.data.attachment.name
                                                : 'Upload bukti pendukung (foto, dokumen, dll)'}
                                        </button>
                                    </div>
                                    {form.errors.attachment && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {form.errors.attachment}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    className="w-full bg-blue-900 hover:bg-blue-800"
                                    onClick={submitComplaint}
                                    disabled={form.processing}
                                >
                                    {form.processing ? 'Mengirim...' : 'Kirim Pengaduan/Saran'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                }
            >
                <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        label="Pengaduan Baru"
                        value={stats.new}
                        icon={<AlertCircle className="h-4 w-4 text-blue-900" />}
                        accent="bg-blue-100 text-blue-900"
                    />
                    <StatsCard
                        label="Sedang Ditangani"
                        value={stats.inProgress}
                        icon={<MessageSquare className="h-4 w-4 text-blue-900" />}
                        accent="bg-amber-100 text-amber-900"
                    />
                    <StatsCard
                        label="Selesai Bulan Ini"
                        value={stats.resolved}
                        icon={<FileText className="h-4 w-4 text-blue-900" />}
                        accent="bg-green-100 text-green-900"
                    />
                    <StatsCard
                        label="Regulasi Aktif"
                        value={stats.regulations}
                        icon={<Megaphone className="h-4 w-4 text-blue-900" />}
                        accent="bg-purple-100 text-purple-900"
                    />
                </section>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="complaints">Pengaduan & Saran</TabsTrigger>
                        <TabsTrigger value="regulations">Regulasi</TabsTrigger>
                        <TabsTrigger value="forum">Forum & Pengumuman</TabsTrigger>
                    </TabsList>

                    <TabsContent value="complaints" className="mt-4">
                        <Card className="p-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="md:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            placeholder="Cari pengaduan..."
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {filters.categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        {filters.statuses.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Prioritas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Prioritas</SelectItem>
                                        {filters.priorities.map((priority) => (
                                            <SelectItem key={priority} value={priority}>
                                                {priority}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="mt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Kategori</TableHead>
                                            <TableHead>Subjek</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Prioritas</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredComplaints.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-sm text-slate-500">
                                                    Belum ada data yang sesuai filter.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {filteredComplaints.map((complaint) => (
                                            <TableRow key={complaint.id}>
                                                <TableCell>{complaint.letterNumber ?? '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{complaint.category}</Badge>
                                                </TableCell>
                                                <TableCell>{complaint.subject}</TableCell>
                                                <TableCell>{complaint.date}</TableCell>
                                                <TableCell>
                                                    <PriorityBadge priority={complaint.priority} />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={complaint.status} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDetailComplaint(complaint)}
                                                    >
                                                        Detail
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="regulations" className="mt-4">
                        <Card className="p-6 space-y-4">
                            {regulations.length === 0 && (
                                <p className="text-sm text-slate-500">
                                    Belum ada regulasi yang dibagikan ke divisi Anda.
                                </p>
                            )}
                            {regulations.map((regulation) => (
                                <div
                                    key={regulation.id}
                                    className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {regulation.title}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {regulation.category} • Upload: {regulation.uploadDate}
                                        </p>
                                    </div>
                                    {regulation.fileUrl && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={regulation.fileUrl} target="_blank" rel="noreferrer">
                                                    Lihat
                                                </a>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={regulation.fileUrl} download={regulation.fileName ?? undefined}>
                                                    Download
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Card>
                    </TabsContent>

                    <TabsContent value="forum" className="mt-4">
                        <Card className="p-6 space-y-4">
                            {announcements.length === 0 && (
                                <p className="text-sm text-slate-500">
                                    Belum ada pengumuman terbaru.
                                </p>
                            )}
                            {announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <Megaphone className="mt-1 h-4 w-4 text-blue-900" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-900">
                                                {announcement.title}
                                            </h4>
                                            <p className="text-sm text-slate-700">
                                                {announcement.content}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500">
                                                {announcement.date}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    </TabsContent>
                </Tabs>

                <Dialog
                    open={Boolean(detailComplaint)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDetailComplaint(null);
                        }
                    }}
                >
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detail Pengaduan</DialogTitle>
                        </DialogHeader>
                        {detailComplaint && (
                            <div className="mt-4 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <DetailInfo label="Nomor" value={detailComplaint.letterNumber ?? '-'} />
                                    <DetailInfo label="Kategori" value={detailComplaint.category} />
                                    <DetailInfo label="Tanggal" value={detailComplaint.date} />
                                    <DetailInfo label="Status" value={detailComplaint.status} />
                                </div>
                                <div>
                                    <Label className="text-xs uppercase text-slate-500">
                                        Subjek
                                    </Label>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {detailComplaint.subject}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs uppercase text-slate-500">
                                        Deskripsi
                                    </Label>
                                    <p className="text-sm text-slate-700">
                                        {detailComplaint.description ?? '-'}
                                    </p>
                                </div>
                                {detailComplaint.attachment?.url && (
                                    <div>
                                        <Label className="text-xs uppercase text-slate-500">
                                            Lampiran
                                        </Label>
                                        <a
                                            href={detailComplaint.attachment.url}
                                            className="text-sm font-semibold text-blue-900 hover:underline"
                                        >
                                            {detailComplaint.attachment.name ?? 'Lihat Lampiran'}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </StaffLayout>
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase();

    if (normalized.includes('selesai')) {
        return (
            <Badge variant="outline" className="border-green-500 text-green-600">
                {status}
            </Badge>
        );
    }

    if (normalized.includes('proses') || normalized.includes('menunggu')) {
        return (
            <Badge variant="outline" className="border-amber-500 text-amber-600">
                {status}
            </Badge>
        );
    }

    return <Badge variant="outline">{status}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
    const normalized = priority.toLowerCase();

    if (normalized.includes('tinggi') || normalized === 'high') {
        return <Badge className="bg-red-500 text-white">Tinggi</Badge>;
    }

    if (normalized.includes('sedang') || normalized === 'medium') {
        return <Badge className="bg-orange-500 text-white">Sedang</Badge>;
    }

    return <Badge className="bg-blue-500 text-white">Rendah</Badge>;
}

function DetailInfo({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}

function renderOptions(values: string[], fallback: string[]): string[] {
    if (values.length > 0) {
        return values;
    }

    return fallback;
}
