import { useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SuperAdminLayout from '@/Pages/SuperAdmin/Layout';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { toast } from 'sonner';
import {
    AnnouncementRecord,
    ComplaintRecord,
    Option,
    PaginatedComplaints,
    RegulationRecord,
} from './types';
import ComplaintStats from './components/ComplaintStats';
import ComplaintFilters from './components/ComplaintFilters';
import ComplaintTable from './components/ComplaintTable';
import ComplaintDetailDialog from './components/ComplaintDetailDialog';
import RegulationList from './components/RegulationList';
import AnnouncementList from './components/AnnouncementList';
import { MessageSquarePlus } from 'lucide-react';
import type { PageProps } from '@/types';

type ComplaintsPageProps = PageProps<{
    filters: {
        search: string;
        status: string;
        priority: string;
        category: string;
    };
    stats: {
        total: number;
        new: number;
        in_progress: number;
        resolved: number;
    };
    complaints: PaginatedComplaints;
    statusOptions: Option[];
    priorityOptions: Option[];
    categoryOptions: string[];
    regulations: RegulationRecord[];
    announcements: AnnouncementRecord[];
    flash?: {
        success?: string;
    };
}>;

export default function KelolaPengaduanIndex(props: ComplaintsPageProps) {
    const {
        filters,
        stats,
        complaints,
        statusOptions,
        priorityOptions,
        categoryOptions,
        regulations,
        announcements,
        flash,
    } = props;

    const [activeTab, setActiveTab] = useState<'complaints' | 'regulations' | 'forum'>(
        'complaints',
    );
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [priority, setPriority] = useState(filters.priority ?? 'all');
    const [category, setCategory] = useState(filters.category ?? 'all');
    const [selectedComplaint, setSelectedComplaint] =
        useState<ComplaintRecord | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initialRender = useRef(true);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            router.visit(route('super-admin.complaints.index'), {
                method: 'get',
                data: {
                    search: search || undefined,
                    status: status !== 'all' ? status : undefined,
                    priority: priority !== 'all' ? priority : undefined,
                    category: category !== 'all' ? category : undefined,
                },
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['complaints', 'filters', 'stats'],
            });
        }, 250);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [search, status, priority, category]);

    useEffect(() => {
        setSearch(filters.search ?? '');
        setStatus(filters.status?.length ? filters.status : 'all');
        setPriority(filters.priority?.length ? filters.priority : 'all');
        setCategory(filters.category?.length ? filters.category : 'all');
    }, [filters.search, filters.status, filters.priority, filters.category]);

    useEffect(() => {
        if (!selectedComplaint) {
            return;
        }

        const updated = complaints.data.find(
            (item) => item.id === selectedComplaint.id,
        );

        if (updated) {
            setSelectedComplaint(updated);
        }
    }, [complaints.data, selectedComplaint?.id]);

    const handleSelectComplaint = (complaint: ComplaintRecord) => {
        setSelectedComplaint(complaint);
        setDetailOpen(true);
    };

    return (
        <SuperAdminLayout
            title="Kelola Pengaduan"
            description="Pantau dan tindaklanjuti pengaduan karyawan secara terpusat"
            breadcrumbs={[
                { label: 'Super Admin', href: route('super-admin.dashboard') },
                { label: 'Kelola Pengaduan' },
            ]}
            actions={
                <Button
                    type="button"
                    className="hidden items-center gap-2 bg-blue-900 hover:bg-blue-800 md:flex text-white"
                    onClick={() => setActiveTab('complaints')}
                >
                    <MessageSquarePlus className="h-4 w-4" />
                    Lihat Pengaduan
                </Button>
            }
        >
            <Head title="Kelola Pengaduan" />

            <ComplaintStats stats={stats} />

            <div className="mt-8">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                    <TabsList>
                        <TabsTrigger value="complaints">Pengaduan &amp; Saran</TabsTrigger>
                        <TabsTrigger value="regulations">Regulasi</TabsTrigger>
                        <TabsTrigger value="forum">Forum &amp; Pengumuman</TabsTrigger>
                    </TabsList>

                    <TabsContent value="complaints" className="mt-6 space-y-6">
                        <ComplaintFilters
                            search={search}
                            status={status}
                            priority={priority}
                            category={category}
                            statusOptions={statusOptions}
                            priorityOptions={priorityOptions}
                            categoryOptions={categoryOptions}
                            onSearchChange={setSearch}
                            onStatusChange={setStatus}
                            onPriorityChange={setPriority}
                            onCategoryChange={setCategory}
                        />

                        <ComplaintTable
                            complaints={complaints.data}
                            links={complaints.links}
                            onSelect={handleSelectComplaint}
                        />
                    </TabsContent>

                    <TabsContent value="regulations" className="mt-6">
                        <RegulationList regulations={regulations} />
                    </TabsContent>

                    <TabsContent value="forum" className="mt-6">
                        <AnnouncementList announcements={announcements} />
                    </TabsContent>
                </Tabs>
            </div>

            <ComplaintDetailDialog
                complaint={selectedComplaint}
                open={detailOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) {
                        setSelectedComplaint(null);
                    }
                }}
                statusOptions={statusOptions}
                priorityOptions={priorityOptions}
            />
        </SuperAdminLayout>
    );
}
