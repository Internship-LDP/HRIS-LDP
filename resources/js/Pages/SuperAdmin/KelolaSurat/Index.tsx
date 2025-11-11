import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Separator } from '@/Components/ui/separator';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import { cn } from '@/Components/ui/utils';
import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import ArchiveList from '@/Pages/SuperAdmin/KelolaSurat/components/ArchiveList';
import ComposeLetterDialog from '@/Pages/SuperAdmin/KelolaSurat/components/ComposeLetterDialog';
import FiltersBar from '@/Pages/SuperAdmin/KelolaSurat/components/FiltersBar';
import LetterDetailDialog from '@/Pages/SuperAdmin/KelolaSurat/components/LetterDetailDialog';
import LettersTable, {
    LetterRecord,
} from '@/Pages/SuperAdmin/KelolaSurat/components/LettersTable';
import StatsCards from '@/Pages/SuperAdmin/KelolaSurat/components/StatsCards';
import { PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import { Info, MailCheck, SendHorizontal } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';

interface KelolaSuratPageProps extends Record<string, unknown> {
    stats: {
        inbox: number;
        outbox: number;
        pending: number;
        archived: number;
    };
    filters?: {
        search: string;
        category: string;
        tab: 'inbox' | 'outbox' | 'archive';
    };
    letters: {
        inbox: LetterRecord[];
        outbox: LetterRecord[];
        archive: LetterRecord[];
    };
    pendingDisposition: LetterRecord[];
    options: {
        letterTypes: string[];
        categories: string[];
        priorities: Record<string, string>;
        divisions: string[];
    };
    nextLetterNumber: string;
}

export default function KelolaSuratIndex() {
    const {
        props: { auth, stats, filters, letters, options, nextLetterNumber, pendingDisposition },
    } = usePage<PageProps<KelolaSuratPageProps>>();
    const isHumanCapitalAdmin =
        auth.user?.role === 'Admin' &&
        typeof auth.user?.division === 'string' &&
        /human\s+(capital|resources)/i.test(auth.user.division);
    const breadcrumbs = isHumanCapitalAdmin
        ? [
              { label: 'Admin', href: route('admin-staff.dashboard') },
              { label: 'Kelola Surat' },
          ]
        : [
              { label: 'Super Admin', href: route('super-admin.dashboard') },
              { label: 'Kelola Surat' },
          ];

    const appliedFilters = {
        search: filters?.search ?? '',
        category: filters?.category ?? 'all',
    tab: (['inbox', 'outbox', 'archive'].includes(filters?.tab ?? '')
            ? (filters?.tab as 'inbox' | 'outbox' | 'archive')
            : 'inbox') as 'inbox' | 'outbox' | 'archive',
    };

    const [activeTab, setActiveTab] = useState<'inbox' | 'outbox' | 'archive'>(
        appliedFilters.tab
    );
    const [searchQuery, setSearchQuery] = useState(appliedFilters.search ?? '');
    const [categoryFilter, setCategoryFilter] = useState(
        appliedFilters.category ?? 'all'
    );
    const [isComposeOpen, setComposeOpen] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<LetterRecord | null>(
        null
    );
    const [detailOpen, setDetailOpen] = useState(false);
    const [dispositionOpen, setDispositionOpen] = useState(false);
    const [selectedDispositionIds, setSelectedDispositionIds] = useState<
        number[]
    >([]);
    const [dispositionTargets, setDispositionTargets] = useState<
        LetterRecord[]
    >([]);

    const form = useForm({
        penerima: '',
        perihal: '',
        isi_surat: '',
        jenis_surat: '',
        kategori: '',
        prioritas: '',
        target_division: '',
        lampiran: null as File | null,
    });
    const dispositionForm = useForm({
        disposition_note: '',
        letter_ids: [] as number[],
    });

    const filteredLetters = useMemo(() => {
        const applyFilter = (items: LetterRecord[]) => {
            return items.filter((letter) => {
                const searchLower = searchQuery.toLowerCase();
                const matchSearch =
                    !searchLower ||
                    letter.subject.toLowerCase().includes(searchLower) ||
                    letter.letterNumber.toLowerCase().includes(searchLower) ||
                    letter.recipientName.toLowerCase().includes(searchLower);
                const matchCategory =
                    categoryFilter === 'all' ||
                    letter.category === categoryFilter;
                return matchSearch && matchCategory;
            });
        };

        return {
            inbox: applyFilter(letters.inbox),
            outbox: applyFilter(letters.outbox),
            archive: applyFilter(letters.archive),
        };
    }, [letters, searchQuery, categoryFilter]);

    useEffect(() => {
        setSelectedDispositionIds((prev) =>
            prev.filter((id) =>
                pendingDisposition.some((letter) => letter.id === id)
            )
        );
    }, [pendingDisposition]);

    const selectedPendingCount = selectedDispositionIds.length;
    const isAllPendingSelected =
        pendingDisposition.length > 0 &&
        selectedPendingCount === pendingDisposition.length;
    const headerCheckboxState = isAllPendingSelected
        ? true
        : selectedPendingCount > 0
          ? 'indeterminate'
          : false;

    const handleSelectLetter = (letter: LetterRecord) => {
        setSelectedLetter(letter);
        setDetailOpen(true);
    };

    const openDispositionDialog = (letters?: LetterRecord | LetterRecord[]) => {
        const normalizedTargets = letters
            ? Array.isArray(letters)
                ? letters
                : [letters]
            : pendingDisposition.filter((letter) =>
                  selectedDispositionIds.includes(letter.id)
              );

        if (normalizedTargets.length === 0) {
            toast.error('Pilih minimal satu surat untuk disposisi.');
            return;
        }

        setDispositionTargets(normalizedTargets);
        dispositionForm.reset();
        setDispositionOpen(true);
    };

    const handlePendingSelect = (letterId: number, checked: boolean) => {
        setSelectedDispositionIds((prev) => {
            if (checked) {
                if (prev.includes(letterId)) {
                    return prev;
                }
                return [...prev, letterId];
            }

            return prev.filter((id) => id !== letterId);
        });
    };

    const handleSelectAllPending = () => {
        if (
            pendingDisposition.length > 0 &&
            selectedDispositionIds.length === pendingDisposition.length
        ) {
            setSelectedDispositionIds([]);
            return;
        }

        setSelectedDispositionIds(pendingDisposition.map((letter) => letter.id));
    };

    const handleDispositionDialogChange = (open: boolean) => {
        setDispositionOpen(open);
        if (!open) {
            setDispositionTargets([]);
        }
    };

    const handleSubmit = () => {
        form.post(route('super-admin.letters.store'), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Surat berhasil dikirim');
                form.reset();
                form.setData('lampiran', null);
                setComposeOpen(false);
            },
            onError: () => {
                toast.error('Gagal menyimpan surat, periksa kembali data Anda');
            },
        });
    };

    const handleDispositionSubmit = () => {
        const letterIds = dispositionTargets.map((letter) => letter.id);

        if (letterIds.length === 0) {
            toast.error('Tidak ada surat yang dipilih.');
            return;
        }

        dispositionForm.transform((data) => ({
            ...data,
            letter_ids: letterIds,
        }));

        dispositionForm.post(route('super-admin.letters.disposition.bulk'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    `${letterIds.length} surat didisposisi ke divisi tujuan.`
                );
                setDispositionOpen(false);
                setDispositionTargets([]);
                setSelectedDispositionIds([]);
                dispositionForm.reset();
            },
            onError: () =>
                toast.error('Gagal mendisposisi surat, coba lagi.'),
        });
    };

    return (
        <SuperAdminLayout
            title="Kelola Surat"
            description="Kelola surat masuk, keluar, dan arsip digital"
            breadcrumbs={breadcrumbs}
            actions={
                <ComposeLetterDialog
                    open={isComposeOpen}
                    onOpenChange={setComposeOpen}
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

            <StatsCards stats={stats} />

            <Card className="overflow-hidden border border-slate-100 bg-white">
                <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-transparent px-6 py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                <MailCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                    Menunggu Disposisi HR
                                </p>
                                <p className="text-lg font-semibold text-slate-900">
                                    Surat staff yang harus diteruskan ke divisi tujuan
                                </p>
                                <p className="text-sm text-slate-500">
                                    Pilih beberapa surat sekaligus dan kirim dalam satu kali proses.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <BadgeCount count={pendingDisposition.length} />
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 rounded-full border border-blue-100/80 bg-white px-3 py-1 text-xs font-semibold text-blue-700"
                                    >
                                        <Info className="h-3.5 w-3.5" />
                                        Status HR
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Surat menanti pengalihan dari tim HR ke divisi tujuan.
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700">
                            {selectedPendingCount} surat dipilih
                        </Badge>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            disabled={selectedPendingCount === 0}
                            onClick={() => openDispositionDialog()}
                        >
                            <SendHorizontal className="mr-2 h-4 w-4" />
                            Disposisi Terpilih
                        </Button>
                    </div>
                </div>

                {pendingDisposition.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                        <MailCheck className="h-10 w-10 text-blue-400" />
                        <p className="text-base font-semibold text-slate-900">
                            Semua surat sudah dialihkan
                        </p>
                        <p className="text-sm text-slate-500">
                            Tidak ada surat yang menunggu disposisi saat ini.
                        </p>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="max-h-[420px] px-2">
                            <Table className="text-sm text-slate-700">
                                <TableHeader>
                                    <TableRow className="text-slate-500">
                                        <TableHead className="w-10">
                                            <Checkbox
                                                checked={headerCheckboxState}
                                                onCheckedChange={() => handleSelectAllPending()}
                                                aria-label="Pilih semua surat"
                                            />
                                        </TableHead>
                                        <TableHead>Nomor</TableHead>
                                        <TableHead>Pengirim</TableHead>
                                        <TableHead>Divisi Tujuan</TableHead>
                                        <TableHead>Subjek</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingDisposition.map((letter) => {
                                        const isSelected =
                                            selectedDispositionIds.includes(letter.id);

                                        return (
                                            <TableRow
                                                key={letter.id}
                                                data-state={isSelected ? 'selected' : undefined}
                                                className={cn(
                                                    'text-sm',
                                                    isSelected && 'bg-blue-50/70'
                                                )}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(value) =>
                                                            handlePendingSelect(
                                                                letter.id,
                                                                value === true
                                                            )
                                                        }
                                                        aria-label={`Pilih surat ${letter.letterNumber}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-semibold text-slate-900">
                                                    {letter.letterNumber}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {letter.senderName}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {letter.senderDivision}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {letter.targetDivision ?? '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[240px] truncate">
                                                        {letter.subject}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{letter.date}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-500 text-white hover:bg-blue-600"
                                                        onClick={() =>
                                                            openDispositionDialog(letter)
                                                        }
                                                    >
                                                        Disposisi
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                        <Separator />
                        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                            <p className="text-sm text-slate-500">
                                {selectedPendingCount > 0
                                    ? `${selectedPendingCount} surat siap didisposisi`
                                    : 'Pilih minimal satu surat untuk meneruskan.'}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-600 hover:text-slate-900"
                                    disabled={selectedPendingCount === 0}
                                    onClick={() => setSelectedDispositionIds([])}
                                >
                                    Reset Pilihan
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                    disabled={selectedPendingCount === 0}
                                    onClick={() => openDispositionDialog()}
                                >
                                    <SendHorizontal className="h-4 w-4" />
                                    Disposisi Terpilih
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Card>

            <Card className="p-6">
                <div className="mb-6">
                    <FiltersBar
                        search={searchQuery}
                        category={categoryFilter}
                        categories={options.categories}
                        onSearchChange={setSearchQuery}
                        onCategoryChange={setCategoryFilter}
                    />
                </div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                    <TabsList className="mb-5">
                        <TabsTrigger
                            value="inbox"
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-900 data-[state=active]:bg-blue-900 data-[state=active]:text-white"
                        >
                            Inbox
                        </TabsTrigger>
                        <TabsTrigger
                            value="outbox"
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-900 data-[state=active]:bg-blue-900 data-[state=active]:text-white"
                        >
                            Outbox
                        </TabsTrigger>
                        <TabsTrigger
                            value="archive"
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-900 data-[state=active]:bg-blue-900 data-[state=active]:text-white"
                        >
                            Arsip
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="inbox">
                        <LettersTable
                            letters={filteredLetters.inbox}
                            variant="inbox"
                            onSelect={handleSelectLetter}
                        />
                    </TabsContent>
                    <TabsContent value="outbox">
                        <LettersTable
                            letters={filteredLetters.outbox}
                            variant="outbox"
                            onSelect={handleSelectLetter}
                        />
                    </TabsContent>
                    <TabsContent value="archive">
                        <ArchiveList
                            letters={filteredLetters.archive}
                            onSelect={handleSelectLetter}
                        />
                    </TabsContent>
                </Tabs>
            </Card>

            <LetterDetailDialog
                letter={selectedLetter}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />

            <Dialog
                open={dispositionOpen}
                onOpenChange={handleDispositionDialogChange}
            >
                <DialogContent className="border-0 bg-white p-0 sm:max-w-lg">
                    <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-4">
                        <DialogTitle>Disposisi Surat</DialogTitle>
                        <DialogDescription>
                            Tambahkan catatan singkat sebelum meneruskan surat ke divisi tujuan.
                        </DialogDescription>
                    </DialogHeader>
                    {dispositionTargets.length > 0 ? (
                        <div className="space-y-5 px-6 pb-6 pt-4">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Surat terpilih
                                        </p>
                                        <p className="text-base font-semibold text-slate-900">
                                            {dispositionTargets.length} dokumen siap dikirim
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-600 text-white">
                                        HR &rarr; Divisi Tujuan
                                    </Badge>
                                </div>
                                <ScrollArea className="mt-4 max-h-48">
                                    <div className="space-y-3 pr-1">
                                        {dispositionTargets.map((letter) => (
                                            <div
                                                key={letter.id}
                                                className="rounded-xl border border-white/60 bg-white p-3 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {letter.letterNumber}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {letter.subject}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="text-slate-600">
                                                        {letter.targetDivision ?? '-'}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {letter.senderName} - {letter.date}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="disposition-note">Catatan (opsional)</Label>
                                <Textarea
                                    id="disposition-note"
                                    rows={4}
                                    placeholder="Tambahkan konteks sebelum surat diteruskan..."
                                    value={dispositionForm.data.disposition_note}
                                    onChange={(event) =>
                                        dispositionForm.setData(
                                            'disposition_note',
                                            event.target.value
                                        )
                                    }
                                />
                                {dispositionForm.errors.disposition_note && (
                                    <p className="text-xs text-red-500">
                                        {dispositionForm.errors.disposition_note}
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={handleDispositionSubmit}
                                disabled={
                                    dispositionForm.processing ||
                                    dispositionTargets.length === 0
                                }
                                className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
                            >
                                {dispositionForm.processing ? (
                                    'Memproses...'
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <SendHorizontal className="h-4 w-4" />
                                        Disposisi ke Divisi
                                    </span>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="px-6 py-10 text-center text-sm text-slate-500">
                            Pilih surat yang ingin didisposisi.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </SuperAdminLayout>
    );
}

function BadgeCount({ count }: { count: number }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-100/80 bg-white px-4 py-1 text-xs font-semibold text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {count} surat
        </span>
    );
}
