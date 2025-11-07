import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';
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
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
    const [selectedPending, setSelectedPending] = useState<LetterRecord | null>(null);
    const [dispositionOpen, setDispositionOpen] = useState(false);

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

    const handleSelectLetter = (letter: LetterRecord) => {
        setSelectedLetter(letter);
        setDetailOpen(true);
    };

    const openDispositionDialog = (letter: LetterRecord) => {
        setSelectedPending(letter);
        dispositionForm.reset();
        setDispositionOpen(true);
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
        if (!selectedPending) return;

        dispositionForm.post(
            route('super-admin.letters.disposition', selectedPending.id),
            {
                onSuccess: () => {
                    toast.success('Surat didisposisi ke divisi tujuan.');
                    setDispositionOpen(false);
                },
                onError: () =>
                    toast.error('Gagal mendisposisi surat, coba lagi.'),
            }
        );
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

            <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-900">
                            Menunggu Disposisi HR
                        </h3>
                        <p className="text-sm text-slate-500">
                            Surat dari staff yang harus diteruskan ke divisi tujuan.
                        </p>
                    </div>
                    <BadgeCount count={pendingDisposition.length} />
                </div>

                {pendingDisposition.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        Tidak ada surat yang menunggu disposisi.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500">
                                    <th className="pb-2">Nomor</th>
                                    <th className="pb-2">Pengirim</th>
                                    <th className="pb-2">Divisi Tujuan</th>
                                    <th className="pb-2">Subjek</th>
                                    <th className="pb-2">Tanggal</th>
                                    <th className="pb-2 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingDisposition.map((letter) => (
                                    <tr
                                        key={letter.id}
                                        className="border-t border-slate-100"
                                    >
                                        <td className="py-2">{letter.letterNumber}</td>
                                        <td className="py-2">
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {letter.senderName}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {letter.senderDivision}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="py-2">
                                            {letter.targetDivision ?? '-'}
                                        </td>
                                        <td className="py-2">{letter.subject}</td>
                                        <td className="py-2">{letter.date}</td>
                                        <td className="py-2 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => openDispositionDialog(letter)}
                                            >
                                                Disposisi
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                        <TabsTrigger value="inbox">Inbox</TabsTrigger>
                        <TabsTrigger value="outbox">Outbox</TabsTrigger>
                        <TabsTrigger value="archive">Arsip</TabsTrigger>
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

            <Dialog open={dispositionOpen} onOpenChange={setDispositionOpen}>
                <DialogContent className="border-0 bg-white p-0 sm:max-w-lg">
                    <DialogHeader className="space-y-1 border-b border-slate-100 px-6 py-4">
                        <DialogTitle>Disposisi Surat</DialogTitle>
                        <DialogDescription>
                            Tambahkan catatan singkat sebelum meneruskan surat ke divisi tujuan.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPending && (
                        <div className="space-y-4 px-6 pb-6 pt-4">
                            <div className="rounded-lg border border-slate-200 p-4 text-sm">
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <p className="text-xs text-slate-500">Nomor Surat</p>
                                        <p className="font-semibold text-slate-900">
                                            {selectedPending.letterNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Divisi Tujuan</p>
                                        <p className="font-semibold text-slate-900">
                                            {selectedPending.targetDivision ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Catatan (Opsional)</Label>
                                <Textarea
                                    rows={4}
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
                                disabled={dispositionForm.processing}
                                className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                            >
                                {dispositionForm.processing
                                    ? 'Memproses...'
                                    : 'Disposisi ke Divisi'}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </SuperAdminLayout>
    );
}

function BadgeCount({ count }: { count: number }) {
    return (
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
            {count} surat
        </span>
    );
}
