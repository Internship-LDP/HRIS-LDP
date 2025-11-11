import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import ComposeLetterDialog from '@/Pages/SuperAdmin/KelolaSurat/components/ComposeLetterDialog';
import LetterDetailDialog from '@/Pages/SuperAdmin/KelolaSurat/components/LetterDetailDialog';
import { LetterRecord } from '@/Pages/SuperAdmin/KelolaSurat/components/LettersTable';
import StatsCards from '@/Pages/SuperAdmin/KelolaSurat/components/StatsCards';
import PendingDispositionPanel from '@/Pages/SuperAdmin/KelolaSurat/components/PendingDispositionPanel';
import LettersTabsPanel from '@/Pages/SuperAdmin/KelolaSurat/components/LettersTabsPanel';
import DispositionDialog from '@/Pages/SuperAdmin/KelolaSurat/components/DispositionDialog';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useKelolaSuratState } from '@/Pages/SuperAdmin/KelolaSurat/hooks/useKelolaSuratState';

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

    const {
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
        handleSelectLetter,
        dispositionOpen,
        handleDispositionDialogChange,
        dispositionTargets,
        dispositionForm,
        openDispositionDialog,
        handlePendingSelect,
        selectAllPending,
        clearPendingSelection,
        handleHeaderCheckboxChange,
        selectedDispositionIds,
        selectedPendingCount,
        headerCheckboxState,
        isAllPendingSelected,
        form,
        handleComposeSubmit,
        handleDispositionSubmit,
    } = useKelolaSuratState({
        letters,
        pendingDisposition,
        appliedFilters,
    });

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
                    onSubmit={handleComposeSubmit}
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

            <PendingDispositionPanel
                pendingDisposition={pendingDisposition}
                selectedIds={selectedDispositionIds}
                selectedCount={selectedPendingCount}
                headerCheckboxState={headerCheckboxState}
                isAllSelected={isAllPendingSelected}
                onHeaderCheckboxChange={handleHeaderCheckboxChange}
                onToggleSelect={handlePendingSelect}
                onOpenDialog={openDispositionDialog}
                onSelectAll={selectAllPending}
                onClearSelection={clearPendingSelection}
            />

            <LettersTabsPanel
                searchQuery={searchQuery}
                categoryFilter={categoryFilter}
                categories={options.categories}
                onSearchChange={setSearchQuery}
                onCategoryChange={setCategoryFilter}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                filteredLetters={filteredLetters}
                onSelectLetter={handleSelectLetter}
            />

            <LetterDetailDialog
                letter={selectedLetter}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />

            <DispositionDialog
                open={dispositionOpen}
                onOpenChange={handleDispositionDialogChange}
                targets={dispositionTargets}
                dispositionForm={dispositionForm}
                onSubmit={handleDispositionSubmit}
            />
        </SuperAdminLayout>
    );
}


