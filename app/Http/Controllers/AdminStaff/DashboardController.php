<?php

namespace App\Http\Controllers\AdminStaff;

use App\Http\Controllers\Controller;
use App\Http\Controllers\SuperAdmin\AdminHrDashboardController as SuperAdminAdminHrDashboardController;
use App\Models\Application;
use App\Models\Surat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        abort_unless($this->authorized($user), 403);
        if ($user->isHumanCapitalAdmin()) { return app(SuperAdminAdminHrDashboardController::class)($request); }

        $lettersQuery = $this->lettersForStaff($user);

        $stats = [
            'inbox' => (clone $lettersQuery)->count(),
            'activeTasks' => (clone $lettersQuery)
                ->whereIn('status_persetujuan', ['Diajukan', 'Proses'])
                ->count(),
            'completedTasks' => (clone $lettersQuery)
                ->where('status_persetujuan', 'Selesai')
                ->count(),
        ];

        $incomingMails = (clone $lettersQuery)
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->limit(5)
            ->get()
            ->map(fn (Surat $surat) => [
                'id' => $surat->surat_id,
                'from' => $surat->departemen?->nama ?? $surat->user?->division ?? 'Internal',
                'sender' => $surat->user?->name ?? 'HRD',
                'subject' => $surat->perihal ?? '-',
                'date' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
                'status' => $surat->status_persetujuan ?? '-',
                'hasAttachment' => (bool) $surat->lampiran_path,
            ]);

        $recentTasks = (clone $lettersQuery)
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get()
            ->map(fn (Surat $surat) => [
                'task' => $surat->perihal ?? 'Surat masuk',
                'deadline' => optional($surat->tanggal_persetujuan ?? $surat->tanggal_surat)->format('d M Y') ?? '-',
                'status' => $this->mapStatus($surat->status_persetujuan),
            ]);

        $announcements = Surat::query()
            ->where('kategori', 'Internal')
            ->orderByDesc('tanggal_surat')
            ->limit(3)
            ->get()
            ->map(fn (Surat $surat) => [
                'title' => $surat->perihal ?? 'Pengumuman',
                'date' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
            ]);

        return Inertia::render('AdminStaff/Dashboard', [
            'stats' => $stats,
            'incomingMails' => $incomingMails,
            'recentTasks' => $recentTasks,
            'announcements' => $announcements,
        ]);
    }

    private function lettersForStaff(User $user)
    {
        return Surat::query()
            ->where('tipe_surat', 'masuk')
            ->where('current_recipient', 'division')
            ->where('target_division', $user->division);
    }

    private function mapStatus(?string $status): string
    {
        return match (Str::lower($status ?? '')) {
            'diajukan' => 'pending',
            'proses' => 'in-progress',
            'selesai' => 'done',
            default => 'pending',
        };
    }

    private function authorized(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->role === User::ROLES['staff']) {
            return true;
        }

        return $user->role === User::ROLES['admin']
            && ! $user->belongsToHumanCapitalDivision();
    }
}
