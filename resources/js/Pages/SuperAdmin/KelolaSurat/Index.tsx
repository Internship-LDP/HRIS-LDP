import { Card } from '@/Components/ui/card';
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

interface KelolaSuratPageProps {
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
    options: {
        letterTypes: string[];
        categories: string[];
        priorities: Record<string, string>;
    };
    nextLetterNumber: string;
}

export default function KelolaSuratIndex() {
    const {
        props: { auth, stats, filters, letters, options, nextLetterNumber },
    } = usePage<PageProps<KelolaSuratPageProps>>();

    const appliedFilters = {
        search: filters?.search ?? '',
        category: filters?.category ?? 'all',
        tab: (['inbox', 'outbox', 'archive'].includes(filters?.tab)
            ? (filters?.tab as 'inbox' | 'outbox' | 'archive')
            : 'inbox') as 'inbox' | 'outbox' | 'archive',
    };

    const [activeTab, setActiveTab] = useState<'inbox' | 'outbox' | 'archive'>(
        appliedFilters.tab
    );
    const [searchQuery, setSearchQuery] = useState(appliedFilters.search);
    const [categoryFilter, setCategoryFilter] = useState(
        appliedFilters.category
    );
    const [isComposeOpen, setComposeOpen] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<LetterRecord | null>(
        null
    );
    const [detailOpen, setDetailOpen] = useState(false);

    const form = useForm({
        penerima: '',
        perihal: '',
        isi_surat: '',
        jenis_surat: '',
        kategori: '',
        prioritas: '',
        alamat_pengirim: '',
        lampiran: null as File | null,
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

    return (
        <SuperAdminLayout
            title="Kelola Surat"
            description="Kelola surat masuk, keluar, dan arsip digital"
            breadcrumbs={[
                { label: 'Super Admin', href: route('super-admin.dashboard') },
                { label: 'Kelola Surat' },
            ]}
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
        </SuperAdminLayout>
    );
}
