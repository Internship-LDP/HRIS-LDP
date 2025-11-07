import { useMemo, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { MessageSquare } from 'lucide-react';
import StaffLayout from '@/Pages/Staff/components/Layout';
import type { PageProps } from '@/types';
import ComplaintComposerDialog from './Complaints/components/ComplaintComposerDialog';
import ComplaintDetailDialog from './Complaints/components/ComplaintDetailDialog';
import ComplaintFilters from './Complaints/components/ComplaintFilters';
import ComplaintTable from './Complaints/components/ComplaintTable';
import AnnouncementList from './Complaints/components/AnnouncementList';
import OverviewCards from './Complaints/components/OverviewCards';
import RegulationList from './Complaints/components/RegulationList';
import type {
    ComplaintRecord,
    ComplaintsPageProps,
} from './Complaints/types';

export default function StaffComplaints() {
    const {
        props: { stats, complaints, filters, regulations, announcements },
    } = usePage<PageProps<ComplaintsPageProps>>();

    const [activeTab, setActiveTab] = useState<'complaints' | 'regulations' | 'forum'>('complaints');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [composerOpen, setComposerOpen] = useState(false);
    const [detailComplaint, setDetailComplaint] = useState<ComplaintRecord | null>(null);

    const filteredComplaints = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return complaints.filter((complaint) => {
            const matchesSearch =
                !normalizedSearch ||
                complaint.subject.toLowerCase().includes(normalizedSearch) ||
                (complaint.letterNumber ?? '').toLowerCase().includes(normalizedSearch) ||
                complaint.category.toLowerCase().includes(normalizedSearch);

            const matchesStatus =
                statusFilter === 'all' ||
                complaint.status.toLowerCase() === statusFilter.toLowerCase();

            const matchesCategory =
                categoryFilter === 'all' ||
                complaint.category.toLowerCase() === categoryFilter.toLowerCase();

            const matchesPriority =
                priorityFilter === 'all' ||
                complaint.priority.toLowerCase() === priorityFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
        });
    }, [complaints, searchTerm, statusFilter, categoryFilter, priorityFilter]);

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
                    <Button
                        className="bg-blue-900 hover:bg-blue-800 text-white"
                        onClick={() => setComposerOpen(true)}
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Buat Pengaduan/Saran
                    </Button>
                }
            >
                <OverviewCards stats={stats} />

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="mt-8">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="complaints">Pengaduan & Saran</TabsTrigger>
                        <TabsTrigger value="regulations">Regulasi</TabsTrigger>
                        <TabsTrigger value="forum">Forum & Pengumuman</TabsTrigger>
                    </TabsList>

                    <TabsContent value="complaints" className="mt-4">
                        <Card className="p-6">
                            <ComplaintFilters
                                searchTerm={searchTerm}
                                statusFilter={statusFilter}
                                categoryFilter={categoryFilter}
                                priorityFilter={priorityFilter}
                                filters={filters}
                                onSearchChange={setSearchTerm}
                                onStatusChange={setStatusFilter}
                                onCategoryChange={setCategoryFilter}
                                onPriorityChange={setPriorityFilter}
                            />

                            <ComplaintTable
                                complaints={filteredComplaints}
                                onSelect={setDetailComplaint}
                            />
                        </Card>
                    </TabsContent>

                    <TabsContent value="regulations" className="mt-4">
                        <RegulationList regulations={regulations} />
                    </TabsContent>

                    <TabsContent value="forum" className="mt-4">
                        <AnnouncementList announcements={announcements} />
                    </TabsContent>
                </Tabs>
            </StaffLayout>

            <ComplaintComposerDialog
                open={composerOpen}
                filters={filters}
                onOpenChange={setComposerOpen}
            />

            <ComplaintDetailDialog
                complaint={detailComplaint}
                onOpenChange={(open) => {
                    if (!open) {
                        setDetailComplaint(null);
                    }
                }}
            />
        </>
    );
}
