<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StoreComplaintRequest;
use App\Models\Complaint;
use App\Models\Surat;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $this->authorizeStaff($user);

        $complaints = Complaint::query()
            ->where('user_id', $user->id)
            ->with(['handler'])
            ->orderByDesc('submitted_at')
            ->orderByDesc('id')
            ->get();

        $stats = [
            'new' => $complaints
                ->where('status', Complaint::STATUS_NEW)
                ->count(),
            'inProgress' => $complaints
                ->where('status', Complaint::STATUS_IN_PROGRESS)
                ->count(),
            'resolved' => $complaints
                ->where('status', Complaint::STATUS_RESOLVED)
                ->count(),
        ];

        $regulationsQuery = $this->regulationQuery($user);
        $announcementsQuery = $this->announcementQuery($user);

        $regulations = (clone $regulationsQuery)
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->take(10)
            ->get();

        $announcements = (clone $announcementsQuery)
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->take(5)
            ->get();

        $stats['regulations'] = $regulationsQuery->count();

        $categoryOptions = $complaints
            ->pluck('category')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $statusOptions = collect(Complaint::STATUS_LABELS)->values()->all();
        $priorityOptions = collect(Complaint::PRIORITY_LABELS)->values()->all();

        return Inertia::render('Staff/Complaints', [
            'stats' => $stats,
            'complaints' => $complaints
                ->map(fn (Complaint $complaint) => [
                    'id' => $complaint->id,
                    'letterNumber' => $complaint->complaint_code,
                    'from' => $complaint->is_anonymous
                        ? 'Anonim'
                        : ($complaint->reporter?->name ?? '-'),
                    'category' => $complaint->category,
                    'subject' => $complaint->subject,
                    'date' => optional($complaint->submitted_at)->format('d M Y') ?? '-',
                    'status' => $complaint->statusLabel(),
                    'priority' => $complaint->priorityLabel(),
                    'description' => $complaint->description,
                    'handler' => $complaint->handler?->name,
                    'resolutionNotes' => $complaint->resolution_notes,
                    'attachment' => [
                        'name' => $complaint->attachment_name,
                        'url' => $complaint->attachmentUrl(),
                    ],
                ])
                ->values(),
            'filters' => [
                'categories' => $categoryOptions,
                'statuses' => $statusOptions,
                'priorities' => $priorityOptions,
            ],
            'regulations' => $regulations
                ->map(fn (Surat $surat) => [
                    'id' => $surat->surat_id,
                    'title' => $surat->perihal ?? 'Regulasi',
                    'category' => $surat->kategori ?? '-',
                    'uploadDate' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
                    'fileName' => $surat->lampiran_nama,
                    'fileUrl' => $surat->attachmentUrl(),
                ])
                ->values(),
            'announcements' => $announcements
                ->map(fn (Surat $surat) => [
                    'id' => $surat->surat_id,
                    'title' => $surat->perihal ?? 'Pengumuman',
                    'date' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
                    'content' => $surat->isi_surat ?? 'Tidak ada deskripsi',
                ])
                ->values(),
        ]);
    }

    public function store(StoreComplaintRequest $request): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeStaff($user);

        $complaint = new Complaint([
            'user_id' => $user->id,
            'category' => $request->input('category'),
            'subject' => $request->input('subject'),
            'description' => $request->input('description'),
            'priority' => $request->input('priority'),
            'is_anonymous' => $request->boolean('anonymous'),
        ]);

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('complaints', 'public');
            $complaint->fill([
                'attachment_path' => $path,
                'attachment_name' => $file->getClientOriginalName(),
                'attachment_mime' => $file->getMimeType(),
                'attachment_size' => $file->getSize(),
            ]);
        }

        $complaint->save();

        return redirect()
            ->route('staff.complaints.index')
            ->with('success', 'Pengaduan berhasil dikirim dan menunggu tindak lanjut HR.');
    }

    private function regulationQuery(User $user)
    {
        return Surat::query()
            ->where('tipe_surat', 'masuk')
            ->when($user->division, fn ($query, $division) => $query->where('target_division', $division))
            ->whereIn('kategori', ['Internal', 'Kebijakan', 'Operasional']);
    }

    private function announcementQuery(User $user)
    {
        return Surat::query()
            ->where('tipe_surat', 'masuk')
            ->when($user->division, fn ($query, $division) => $query->where('target_division', $division))
            ->where(function ($query) {
                $query
                    ->where('kategori', 'Internal')
                    ->orWhere('jenis_surat', 'Pengumuman');
            });
    }

    private function authorizeStaff(?User $user): void
    {
        abort_unless($user && $user->hasRole(User::ROLES['staff']), 403);
    }
}
