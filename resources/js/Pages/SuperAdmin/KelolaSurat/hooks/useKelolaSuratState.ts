import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { LetterRecord } from '@/Pages/SuperAdmin/KelolaSurat/components/LettersTable';

interface LettersCollection {
    inbox: LetterRecord[];
    outbox: LetterRecord[];
    archive: LetterRecord[];
}

interface UseKelolaSuratStateParams {
    letters: LettersCollection;
    pendingDisposition: LetterRecord[];
    appliedFilters: {
        search: string;
        category: string;
        tab: 'inbox' | 'outbox' | 'archive';
    };
}

export function useKelolaSuratState({
    letters,
    pendingDisposition,
    appliedFilters,
}: UseKelolaSuratStateParams) {
    const [activeTab, setActiveTab] = useState<'inbox' | 'outbox' | 'archive'>(appliedFilters.tab);
    const [searchQuery, setSearchQuery] = useState(appliedFilters.search ?? '');
    const [categoryFilter, setCategoryFilter] = useState(appliedFilters.category ?? 'all');
    const [isComposeOpen, setComposeOpen] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState<LetterRecord | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [dispositionOpen, setDispositionOpen] = useState(false);
    const [selectedDispositionIds, setSelectedDispositionIds] = useState<number[]>([]);
    const [dispositionTargets, setDispositionTargets] = useState<LetterRecord[]>([]);

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
                const matchCategory = categoryFilter === 'all' || letter.category === categoryFilter;
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
            prev.filter((id) => pendingDisposition.some((letter) => letter.id === id))
        );
    }, [pendingDisposition]);

    const selectedPendingCount = selectedDispositionIds.length;
    const isAllPendingSelected =
        pendingDisposition.length > 0 && selectedPendingCount === pendingDisposition.length;
    const headerCheckboxState: boolean | 'indeterminate' = isAllPendingSelected
        ? true
        : selectedPendingCount > 0
          ? 'indeterminate'
          : false;

    const handleSelectLetter = (letter: LetterRecord) => {
        setSelectedLetter(letter);
        setDetailOpen(true);
    };

    const openDispositionDialog = (lettersToUse?: LetterRecord | LetterRecord[]) => {
        const normalizedTargets = lettersToUse
            ? Array.isArray(lettersToUse)
                ? lettersToUse
                : [lettersToUse]
            : pendingDisposition.filter((letter) => selectedDispositionIds.includes(letter.id));

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

    const selectAllPending = () => {
        setSelectedDispositionIds(pendingDisposition.map((letter) => letter.id));
    };

    const clearPendingSelection = () => {
        setSelectedDispositionIds([]);
    };

    const handleHeaderCheckboxChange = (checked: boolean) => {
        if (checked) {
            selectAllPending();
        } else {
            clearPendingSelection();
        }
    };

    const handleDispositionDialogChange = (open: boolean) => {
        setDispositionOpen(open);
        if (!open) {
            setDispositionTargets([]);
        }
    };

    const handleComposeSubmit = () => {
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

    const handleDispositionSubmit = (mode: 'forward' | 'reject') => {
        const letterIds = dispositionTargets.map((letter) => letter.id);

        if (letterIds.length === 0) {
            toast.error('Tidak ada surat yang dipilih.');
            return;
        }

        if (mode === 'reject' && !(dispositionForm.data.disposition_note || '').trim()) {
            toast.error('Tambahkan catatan penolakan sebelum menolak surat.');
            return;
        }

        const routeName =
            mode === 'reject'
                ? 'super-admin.letters.disposition.reject'
                : 'super-admin.letters.disposition.bulk';

        dispositionForm.transform((data) => ({
            ...data,
            letter_ids: letterIds,
        }));

        dispositionForm.post(route(routeName), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    mode === 'reject'
                        ? `${letterIds.length} surat ditolak dan dikembalikan ke pengirim.`
                        : `${letterIds.length} surat didisposisi ke divisi tujuan.`
                );
                setDispositionOpen(false);
                setDispositionTargets([]);
                clearPendingSelection();
                dispositionForm.reset();
            },
            onError: () => toast.error('Gagal mendisposisi surat, coba lagi.'),
        });
    };

    return {
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        activeTab,
        setActiveTab,
        filteredLetters,
        isComposeOpen,
        setComposeOpen,
        selectedLetter,
        detailOpen,
        setDetailOpen,
        dispositionOpen,
        handleDispositionDialogChange,
        dispositionTargets,
        selectedDispositionIds,
        selectedPendingCount,
        headerCheckboxState,
        isAllPendingSelected,
        form,
        dispositionForm,
        openDispositionDialog,
        handlePendingSelect,
        selectAllPending,
        clearPendingSelection,
        handleHeaderCheckboxChange,
        handleSelectLetter,
        handleComposeSubmit,
        handleDispositionSubmit,
    };
}
