import { useMemo, useState, type ReactNode } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminStaffLayout from '@/Pages/AdminStaff/Layout';
import ComposeLetterDialog from '@/Pages/AdminStaff/components/ComposeLetterDialog';
import type { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Archive,
    Download,
    FileText,
    Filter,
    Inbox,
    Search,
    Send,
    Users,
} from 'lucide-react';

interface LetterRecord {
    id: number;
    letterNumber: string;
    from: string;
    sender: string;
    subject: string;
    category: string;
    date: string;
    status: string;
    priority: string;
    hasAttachment: boolean;
    attachmentUrl?: string | null;
    content?: string | null;
}

interface LettersPageProps extends Record<string, unknown> {
    stats: {
        inbox: number;
        outbox: number;
        pending: number;
        archived: number;
    };
    letters: {
        inbox: LetterRecord[];
        outbox: LetterRecord[];
        archive: LetterRecord[];
    };
    recruitments: Array<{
        name: string;
        position: string;
        date: string;
        status: string;
        education?: string | null;
    }>;
    options: {
        letterTypes: string[];
        categories: string[];
        priorities: Record<string, string>;
        divisions: string[];
    };
    nextLetterNumber: string;
}

type TabValue = 'inbox' | 'outbox' | 'archive';

export default function AdminStaffLetters() {
    const {
        props: { auth, stats, letters, recruitments, options, nextLetterNumber },
    } = usePage<PageProps<LettersPageProps>>();

    const [composerOpen, setComposerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabValue>('inbox');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedLetter, setSelectedLetter] = useState<LetterRecord | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const form = useForm({
        penerima: 'Admin HR',
        perihal: '',
        isi_surat: '',
        jenis_surat: '',
        kategori: '',
        prioritas: '',
        target_division: '',
        lampiran: null as File | null,
    });

    const filteredLetters = useMemo(() => {
        const filterList = (items: LetterRecord[]) => {
            const search = searchTerm.toLowerCase();
            return items.filter((letter) => {
                const matchesSearch =
                    !search ||
                    letter.subject.toLowerCase().includes(search) ||
                    letter.letterNumber.toLowerCase().includes(search) ||
                    letter.sender.toLowerCase().includes(search);
                const matchesCategory =
                    categoryFilter === 'all' || letter.category === categoryFilter;
                return matchesSearch && matchesCategory;
            });
        };

        return {
            inbox: filterList(letters.inbox),
            outbox: filterList(letters.outbox),
            archive: filterList(letters.archive),
        };
    }, [letters, searchTerm, categoryFilter]);

    const activeLetters = filteredLetters[activeTab];

    const handleSubmit = () => {
        form.post(route('admin-staff.letters.store'), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Surat berhasil dikirim ke Admin HR.');
                form.reset();
                setComposerOpen(false);
            },
            onError: () => toast.error('Gagal mengirim surat, periksa kembali data.'),
        });
    };

    const openDetail = (letter: LetterRecord) => {
        setSelectedLetter(letter);
        setDetailOpen(true);
    };

    const categoryOptions = [
        'all',
        ...Array.from(
            new Set(
                [...letters.inbox, ...letters.outbox, ...letters.archive].map(
                    (item) => item.category
                )
            )
        ),
    ];

    return (
        <AdminStaffLayout
            title="Correspondence & Filing"
            description="Kelola surat masuk, keluar, dan arsip digital"
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin-staff.dashboard') },
                { label: 'Kelola Surat' },
            ]}
            actions={
                <ComposeLetterDialog
                    open={composerOpen}
                    onOpenChange={setComposerOpen}
                    data={form.data}
                    setData={form.setData}
                    errors={form.errors}
                    processing={form.processing}
                    onSubmit={handleSubmit}
                    userInfo={{
                        name: auth.user.name,
                        division: auth.user.division,
                        role: auth.user.role,
                    }}
                    options={options}
                    letterNumberPreview={nextLetterNumber}
                />
            }
        >
            <Head title="Kelola Surat" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <StatCard label="Surat Masuk" value={stats.inbox} icon={<Inbox className="h-5 w-5" />} />
                <StatCard label="Surat Keluar" value={stats.outbox} icon={<Send className="h-5 w-5" />} color="bg-emerald-50" />
                <StatCard label="Perlu Diproses" value={stats.pending} icon={<Filter className="h-5 w-5" />} color="bg-amber-50" />
                <StatCard label="Arsip" value={stats.archived} icon={<Archive className="h-5 w-5" />} color="bg-purple-50" />
            </div>

            <Card className="p-6">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Cari surat..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-52">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {categoryOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option === 'all' ? 'Semua Kategori' : option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
                    <TabsList className="mb-5">
                        <TabsTrigger value="inbox">Inbox</TabsTrigger>
                        <TabsTrigger value="outbox">Outbox</TabsTrigger>
                        <TabsTrigger value="archive">Arsip</TabsTrigger>
                    </TabsList>

                    <TabsContent value="inbox">
                        <LettersTable letters={activeLetters} onViewDetail={openDetail} />
                    </TabsContent>
                    <TabsContent value="outbox">
                        <LettersTable letters={activeLetters} variant="outbox" onViewDetail={openDetail} />
                    </TabsContent>
                    <TabsContent value="archive">
                        <LettersTable letters={activeLetters} variant="archive" onViewDetail={openDetail} />
                    </TabsContent>
                </Tabs>
            </Card>

            <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-blue-900">Rekrutmen Baru</h3>
                    <Badge variant="outline">{recruitments.length} kandidat</Badge>
                </div>
                {recruitments.length === 0 ? (
                    <EmptyState message="Belum ada pelamar baru." />
                ) : (
                    <div className="space-y-3">
                        {recruitments.map((candidate, index) => (
                            <div key={`${candidate.name}-${index}`} className="rounded-lg border border-slate-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-900">{candidate.name}</p>
                                        <p className="text-sm text-slate-500">{candidate.position}</p>
                                    </div>
                                    <Badge variant="secondary">{candidate.status}</Badge>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                    <span>{candidate.date}</span>
                                    {candidate.education && (
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {candidate.education}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden border-0 bg-white p-0">
                    <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-4">
                        <DialogTitle>Detail Surat</DialogTitle>
                        <DialogDescription>
                            Ringkasan informasi surat masuk/keluar beserta lampiran yang disertakan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[calc(85vh-4.5rem)] overflow-y-auto">
                        {selectedLetter ? (
                            <div className="space-y-6 px-6 pb-6 pt-4">
                                <section className="grid gap-4 rounded-xl border border-slate-200/80 p-4 text-sm md:grid-cols-3">
                                    <InfoTile label="Nomor Surat" value={selectedLetter.letterNumber} />
                                    <InfoTile label="Tanggal" value={selectedLetter.date} />
                                    <InfoTile label="Pengirim" value={selectedLetter.sender} />
                                    <InfoTile label="Divisi" value={selectedLetter.from} />
                                    <InfoTile label="Kategori" value={selectedLetter.category} />
                                    <InfoTile
                                        label="Prioritas"
                                        value={<Badge className="bg-slate-900 text-white">{selectedLetter.priority}</Badge>}
                                    />
                                    <InfoTile label="Status" value={<StatusBadge status={selectedLetter.status} />} />
                                </section>

                                <section className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-5">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Subjek</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {selectedLetter.subject}
                                        </p>
                                    </div>
                                    {selectedLetter.content && (
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500">Isi Surat</p>
                                            <div className="mt-2 rounded-lg bg-white p-4 text-sm text-slate-700">
                                                {selectedLetter.content}
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {selectedLetter.hasAttachment && selectedLetter.attachmentUrl && (
                                    <section className="rounded-xl border border-slate-200/80 bg-white p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                                    Lampiran
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                                    {selectedLetter.subject}
                                                </p>
                                            </div>
                                            <Button asChild variant="outline">
                                                <a href={selectedLetter.attachmentUrl} target="_blank" rel="noreferrer">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Unduh Lampiran
                                                </a>
                                            </Button>
                                        </div>
                                    </section>
                                )}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center text-sm text-slate-500">
                                Pilih surat untuk melihat detail.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AdminStaffLayout>
    );
}

function LettersTable({
    letters,
    variant = 'inbox',
    onViewDetail,
}: {
    letters: LetterRecord[];
    variant?: TabValue;
    onViewDetail: (letter: LetterRecord) => void;
}) {
    if (letters.length === 0) {
        return <EmptyState message="Belum ada surat pada tab ini." />;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nomor</TableHead>
                    <TableHead>Pengirim</TableHead>
                    <TableHead>Subjek</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {letters.map((letter) => (
                    <TableRow key={letter.id}>
                        <TableCell>{letter.letterNumber}</TableCell>
                        <TableCell>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    {letter.sender}
                                </p>
                                <p className="text-xs text-slate-500">{letter.from}</p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span>{letter.subject}</span>
                                {letter.hasAttachment && (
                                    <FileText className="h-4 w-4 text-slate-400" />
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{letter.category}</Badge>
                        </TableCell>
                        <TableCell>{letter.date}</TableCell>
                        <TableCell>
                            <StatusBadge status={letter.status} />
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => onViewDetail(letter)}>
                                Detail
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function StatCard({
    label,
    value,
    icon,
    color = 'bg-blue-50',
}: {
    label: string;
    value: number;
    icon: ReactNode;
    color?: string;
}) {
    return (
        <Card className="p-5">
            <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${color}`}>
                {icon}
                <span className="font-medium">{label}</span>
            </div>
            <p className="text-2xl font-semibold text-blue-900">
                {Intl.NumberFormat('id-ID').format(value)}
            </p>
        </Card>
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

function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
            {message}
        </div>
    );
}

function InfoTile({
    label,
    value,
}: {
    label: string;
    value?: ReactNode | string | null;
}) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <div className="text-sm font-semibold text-slate-900">{value ?? '-'}</div>
        </div>
    );
}
