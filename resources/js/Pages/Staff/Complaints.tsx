import { useMemo, useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { MessageSquare } from "lucide-react";
import StaffLayout from "@/Pages/Staff/components/Layout";
import type { PageProps } from "@/types";

import ComplaintComposerDialog from "./Complaints/components/ComplaintComposerDialog";
import ComplaintDetailDialog from "./Complaints/components/ComplaintDetailDialog";
import ComplaintFilters from "./Complaints/components/ComplaintFilters";
import ComplaintTable from "./Complaints/components/ComplaintTable";
import AnnouncementList from "./Complaints/components/AnnouncementList";
import RegulationList from "./Complaints/components/RegulationList";

import type { ComplaintRecord, ComplaintsPageProps } from "./Complaints/types";

export default function StaffComplaints() {
    const {
        props: { complaints, filters, regulations, announcements },
    } = usePage<PageProps<ComplaintsPageProps>>();

    const [activeTab, setActiveTab] = useState<
        "complaints" | "regulations" | "forum"
    >("complaints");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const [composerOpen, setComposerOpen] = useState(false);
    const [detailComplaint, setDetailComplaint] =
        useState<ComplaintRecord | null>(null);

    // Reset filter saat membuka popup composer
    useEffect(() => {
        if (composerOpen) {
            setSearchTerm("");
            setStatusFilter("all");
            setCategoryFilter("all");
            setPriorityFilter("all");
        }
    }, [composerOpen]);

    // Filter daftar complaint
    const filteredComplaints = useMemo(() => {
        const s = searchTerm.toLowerCase().trim();

        return complaints.filter((item) => {
            const matchSearch =
                !s ||
                item.subject.toLowerCase().includes(s) ||
                (item.letterNumber ?? "").toLowerCase().includes(s);

            const matchStatus =
                statusFilter === "all" ||
                item.status.toLowerCase() === statusFilter.toLowerCase();

            const matchCategory =
                categoryFilter === "all" ||
                item.category.toLowerCase() === categoryFilter.toLowerCase();

            const matchPriority =
                priorityFilter === "all" ||
                item.priority.toLowerCase() === priorityFilter.toLowerCase();

            return matchSearch && matchStatus && matchCategory && matchPriority;
        });
    }, [complaints, searchTerm, statusFilter, categoryFilter, priorityFilter]);

    return (
        <>
            <Head title="Keluhan & Saran" />

            <StaffLayout
                title="Keluhan & Saran"
                description="Kirim pengaduan dan pantau tindak lanjut HR secara real-time."
                breadcrumbs={[
                    { label: "Dashboard", href: route("staff.dashboard") },
                    { label: "Keluhan & Saran" },
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
                <div className="overflow-x-auto">
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) =>
                            setActiveTab(v as typeof activeTab)
                        }
                        className="mt-6 min-w-max"
                    >
                        <TabsList className="flex gap-2">
                            <TabsTrigger value="complaints">
                                Pengaduan
                            </TabsTrigger>
                            <TabsTrigger value="regulations">
                                Regulasi
                            </TabsTrigger>
                            <TabsTrigger value="forum">Forum</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <Tabs value={activeTab} className="mt-4">
                    <TabsContent value="complaints">
                        <Card className="p-4 md:p-6">
                            <ComplaintFilters
                                searchTerm={searchTerm}
                                statusFilter={statusFilter}
                                categoryFilter={categoryFilter}
                                priorityFilter={priorityFilter}
                                // 🔥 categories kosong supaya ComplaintFilters pakai fallback FE default
                                filters={{
                                    ...filters,
                                    categories: [], // <<— FIX UTAMA
                                }}
                                onSearchChange={setSearchTerm}
                                onStatusChange={setStatusFilter}
                                onCategoryChange={setCategoryFilter}
                                onPriorityChange={setPriorityFilter}
                            />

                            <div className="mt-4">
                                <ComplaintTable
                                    complaints={filteredComplaints}
                                    onSelect={setDetailComplaint}
                                />
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="regulations">
                        <RegulationList regulations={regulations} />
                    </TabsContent>

                    <TabsContent value="forum">
                        <AnnouncementList announcements={announcements} />
                    </TabsContent>
                </Tabs>
            </StaffLayout>

            {/* Composer dialog pakai kategori FE default */}
            <ComplaintComposerDialog
                open={composerOpen}
                filters={{
                    ...filters,
                    categories: [], // <<— FIX UTAMA
                }}
                onOpenChange={setComposerOpen}
            />

            <ComplaintDetailDialog
                complaint={detailComplaint}
                onOpenChange={(open) => !open && setDetailComplaint(null)}
            />
        </>
    );
}
