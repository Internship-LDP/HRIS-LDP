<?php

namespace App\Http\Controllers\AdminStaff;

use App\Http\Controllers\Controller;
use App\Http\Controllers\SuperAdmin\AdminHrDashboardController as SuperAdminAdminHrDashboardController;
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
        abort_unless($this->authorized($user), 403);
        if ($user->isHumanCapitalAdmin()) { return app(SuperAdminAdminHrDashboardController::class)($request); }

        $lettersQuery = $this->lettersForStaff($user);
        $outgoingQuery = $this->outboxForStaff($user);

        $stats = [
            'inbox' => (clone $lettersQuery)->count(),
            'outbox' => (clone $outgoingQuery)->count(),
            'pending' => (clone $lettersQuery)
                ->whereIn('status_persetujuan', ['Menunggu HR', 'Diajukan', 'Diproses'])
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

        $outgoingMails = (clone $outgoingQuery)
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->limit(5)
            ->get()
            ->map(fn (Surat $surat) => [
                'id' => $surat->surat_id,
                'to' => $surat->target_division ?? $surat->penerima ?? 'HRD',
                'subject' => $surat->perihal ?? '-',
                'date' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
                'status' => $surat->status_persetujuan ?? '-',
                'hasAttachment' => (bool) $surat->lampiran_path,
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
            'outgoingMails' => $outgoingMails,
            'announcements' => $announcements,
        ]);
    }

    private function lettersForStaff(User $user)
    {
        return Surat::query()
            ->where('current_recipient', 'division')
            ->where(function ($query) use ($user) {
                $query->where('target_division', $user->division)
                    ->orWhere('penerima', $user->division);
            });
    }

    private function outboxForStaff(User $user)
    {
        return Surat::query()
            ->where('user_id', $user->id);
    }

    private function authorized(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole(User::ROLES['admin'])
            && ! $user->belongsToHumanCapitalDivision();
    }
}
