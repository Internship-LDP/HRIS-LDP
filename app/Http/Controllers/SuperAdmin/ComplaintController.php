<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Surat;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $this->authorizeManagement($user);

        $filters = [
            'search' => $request->string('search')->trim()->toString(),
            'status' => $request->string('status')->trim()->toString(),
            'priority' => $request->string('priority')->trim()->toString(),
            'category' => $request->string('category')->trim()->toString(),
        ];

        $complaintsQuery = Complaint::query()
            ->with(['reporter', 'handler'])
            ->orderByDesc('submitted_at');

        if ($filters['search'] !== '') {
            $searchTerm = '%'.$filters['search'].'%';
            $complaintsQuery->where(function ($query) use ($searchTerm) {
                $query
                    ->where('complaint_code', 'like', $searchTerm)
                    ->orWhere('subject', 'like', $searchTerm)
                    ->orWhere('description', 'like', $searchTerm);
            });
        }

        if ($filters['status'] && $filters['status'] !== 'all') {
            $complaintsQuery->where('status', $filters['status']);
        }

        if ($filters['priority'] && $filters['priority'] !== 'all') {
            $complaintsQuery->where('priority', $filters['priority']);
        }

        if ($filters['category'] && $filters['category'] !== 'all') {
            $complaintsQuery->where('category', $filters['category']);
        }

        $complaints = $complaintsQuery
            ->paginate(10)
            ->withQueryString()
            ->through(function (Complaint $complaint) {
                return [
                    'id' => $complaint->id,
                    'code' => $complaint->complaint_code,
                    'reporter' => $complaint->is_anonymous
                        ? 'Anonim'
                        : ($complaint->reporter?->name ?? 'Tidak diketahui'),
                    'reporterEmail' => $complaint->is_anonymous
                        ? null
                        : $complaint->reporter?->email,
                    'category' => $complaint->category,
                    'subject' => $complaint->subject,
                    'description' => $complaint->description,
                    'submittedAt' => optional($complaint->submitted_at)->format('d M Y H:i'),
                    'status' => $complaint->status,
                    'statusLabel' => $complaint->statusLabel(),
                    'priority' => $complaint->priority,
                    'priorityLabel' => $complaint->priorityLabel(),
                    'isAnonymous' => $complaint->is_anonymous,
                    'handler' => $complaint->handler?->name,
                    'resolutionNotes' => $complaint->resolution_notes,
                    'resolvedAt' => optional($complaint->resolved_at)->format('d M Y H:i'),
                    'attachment' => [
                        'name' => $complaint->attachment_name,
                        'url' => $complaint->attachmentUrl(),
                    ],
                ];
            });

        $stats = [
            'total' => Complaint::count(),
            'new' => Complaint::where('status', Complaint::STATUS_NEW)->count(),
            'in_progress' => Complaint::where('status', Complaint::STATUS_IN_PROGRESS)->count(),
            'resolved' => Complaint::where('status', Complaint::STATUS_RESOLVED)->count(),
        ];

        $categories = Complaint::query()
            ->select('category')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->map(fn ($value) => (string) $value)
            ->sort()
            ->values()
            ->all();

        $regulations = $this->regulations();
        $announcements = $this->announcements();

        return Inertia::render('SuperAdmin/KelolaPengaduan/Index', [
            'filters' => $filters,
            'stats' => $stats,
            'complaints' => $complaints,
            'statusOptions' => $this->statusOptions(),
            'priorityOptions' => $this->priorityOptions(),
            'categoryOptions' => $categories,
            'regulations' => $regulations,
            'announcements' => $announcements,
        ]);
    }

    public function update(Request $request, Complaint $complaint): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeManagement($user);

        $validated = $request->validate([
            'status' => ['required', Rule::in(array_keys(Complaint::STATUS_LABELS))],
            'priority' => ['required', Rule::in(array_keys(Complaint::PRIORITY_LABELS))],
            'resolution_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $complaint->fill([
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'resolution_notes' => $validated['resolution_notes'] ?? null,
            'handled_by_id' => $user->id,
        ]);

        if ($validated['status'] === Complaint::STATUS_RESOLVED && ! $complaint->resolved_at) {
            $complaint->resolved_at = now();
        }

        if ($validated['status'] !== Complaint::STATUS_RESOLVED) {
            $complaint->resolved_at = null;
        }

        $complaint->save();

        return redirect()
            ->back()
            ->with('success', "Pengaduan {$complaint->complaint_code} berhasil diperbarui.");
    }

    private function authorizeManagement(?User $user): void
    {
        abort_unless(
            $user
            && (
                $user->hasRole(User::ROLES['super_admin'])
                || $user->isHumanCapitalAdmin()
            ),
            403
        );
    }

    private function statusOptions(): array
    {
        return collect(Complaint::STATUS_LABELS)
            ->map(fn (string $label, string $value) => [
                'value' => $value,
                'label' => $label,
            ])
            ->values()
            ->all();
    }

    private function priorityOptions(): array
    {
        return collect(Complaint::PRIORITY_LABELS)
            ->map(fn (string $label, string $value) => [
                'value' => $value,
                'label' => $label,
            ])
            ->values()
            ->all();
    }

    private function regulations(): array
    {
        return Surat::query()
            ->where('tipe_surat', 'masuk')
            ->whereIn('kategori', ['Internal', 'Kebijakan', 'Operasional'])
            ->latest('tanggal_surat')
            ->limit(5)
            ->get()
            ->map(fn (Surat $surat) => [
                'id' => $surat->surat_id,
                'title' => $surat->perihal ?? 'Regulasi',
                'category' => $surat->kategori ?? '-',
                'uploadDate' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
                'fileName' => $surat->lampiran_nama,
                'fileUrl' => $surat->attachmentUrl(),
            ])
            ->all();
    }

    private function announcements(): array
    {
        return Surat::query()
            ->where('tipe_surat', 'masuk')
            ->where(fn ($query) => $query
                ->where('kategori', 'Internal')
                ->orWhere('jenis_surat', 'Pengumuman'))
            ->latest('tanggal_surat')
            ->limit(5)
            ->get()
            ->map(fn (Surat $surat) => [
                'id' => $surat->surat_id,
                'title' => $surat->perihal ?? 'Pengumuman',
                'date' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
                'content' => $surat->isi_surat ?? 'Tidak ada deskripsi',
            ])
            ->all();
    }
}
