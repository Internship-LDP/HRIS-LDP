<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\StaffTermination;
use App\Models\Surat;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $this->authorizeStaff($user);

        $complaintsQuery = Surat::query()
            ->where('user_id', $user->id)
            ->where('tipe_surat', 'keluar');

        $activeComplaints = (clone $complaintsQuery)
            ->whereIn('status_persetujuan', ['Menunggu HR', 'Diajukan', 'Proses']);

        $regulationsQuery = Surat::query()
            ->where('tipe_surat', 'masuk')
            ->when($user->division, fn ($query, $division) => $query->where('target_division', $division))
            ->whereIn('kategori', ['Internal', 'Kebijakan', 'Operasional']);

        $terminationQuery = StaffTermination::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at');

        $stats = [
            [
                'label' => 'Pengaduan Aktif',
                'value' => (clone $activeComplaints)->count(),
                'icon' => 'alert',
            ],
            [
                'label' => 'Total Pengaduan',
                'value' => (clone $complaintsQuery)->count(),
                'icon' => 'message',
            ],
            [
                'label' => 'Regulasi Terbaru',
                'value' => (clone $regulationsQuery)
                    ->where('tanggal_surat', '>=', now()->copy()->subMonths(3))
                    ->count(),
                'icon' => 'file',
            ],
            [
                'label' => 'Pengajuan Resign',
                'value' => (clone $terminationQuery)->count(),
                'icon' => 'briefcase',
            ],
        ];

        $recentComplaints = (clone $complaintsQuery)
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->take(5)
            ->get()
            ->map(fn (Surat $surat) => [
                'id' => $surat->surat_id,
                'subject' => $surat->perihal ?? '-',
                'status' => $surat->status_persetujuan ?? '-',
                'priority' => $surat->prioritas ?? 'medium',
                'date' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
            ])
            ->values();

        $regulations = (clone $regulationsQuery)
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->take(5)
            ->get()
            ->map(fn (Surat $surat) => [
                'id' => $surat->surat_id,
                'title' => $surat->perihal ?? 'Regulasi',
                'category' => $surat->kategori ?? '-',
                'date' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
                'attachmentUrl' => $surat->attachmentUrl(),
            ])
            ->values();

        $activeTermination = (clone $terminationQuery)->first();
        $terminationSummary = $activeTermination
            ? [
                'reference' => $activeTermination->reference,
                'status' => $activeTermination->status,
                'progress' => $activeTermination->progress,
                'effectiveDate' => optional($activeTermination->effective_date)->format('d M Y') ?? '-',
                'requestDate' => optional($activeTermination->request_date)->format('d M Y') ?? '-',
            ]
            : null;

        $terminationHistory = (clone $terminationQuery)
            ->take(5)
            ->get()
            ->map(fn (StaffTermination $termination) => [
                'reference' => $termination->reference,
                'type' => $termination->type,
                'status' => $termination->status,
                'requestDate' => optional($termination->request_date)->format('d M Y') ?? '-',
                'effectiveDate' => optional($termination->effective_date)->format('d M Y') ?? '-',
            ])
            ->values();

        return Inertia::render('Staff/Dashboard', [
            'stats' => $stats,
            'recentComplaints' => $recentComplaints,
            'regulations' => $regulations,
            'termination' => [
                'active' => $terminationSummary,
                'history' => $terminationHistory,
            ],
        ]);
    }

    private function authorizeStaff(?User $user): void
    {
        abort_unless($user && $user->role === User::ROLES['staff'], 403);
    }
}
