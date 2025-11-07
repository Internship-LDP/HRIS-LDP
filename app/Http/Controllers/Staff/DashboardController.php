<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
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

        $complaintsQuery = Complaint::query()
            ->where('user_id', $user->id);

        $activeComplaints = (clone $complaintsQuery)
            ->whereIn('status', [Complaint::STATUS_NEW, Complaint::STATUS_IN_PROGRESS]);

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
            ->orderByDesc('submitted_at')
            ->orderByDesc('id')
            ->take(5)
            ->get()
            ->map(fn (Complaint $complaint) => [
                'id' => $complaint->id,
                'subject' => $complaint->subject ?? '-',
                'status' => $complaint->statusLabel(),
                'priority' => $complaint->priorityLabel(),
                'date' => optional($complaint->submitted_at)->format('d M Y') ?? '-',
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
        abort_unless($user && $user->hasRole(User::ROLES['staff']), 403);
    }
}
