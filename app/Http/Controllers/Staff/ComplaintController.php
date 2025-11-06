<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StoreComplaintRequest;
use App\Models\Departemen;
use App\Models\Surat;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $this->authorizeStaff($user);

        $complaints = Surat::query()
            ->with(['departemen', 'user'])
            ->where('user_id', $user->id)
            ->where('tipe_surat', 'keluar')
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->get();

        $stats = [
            'new' => $complaints
                ->whereIn('status_persetujuan', ['Menunggu HR', 'Diajukan'])
                ->count(),
            'inProgress' => $complaints
                ->whereIn('status_persetujuan', ['Proses', 'Diproses'])
                ->count(),
            'resolved' => $complaints
                ->whereIn('status_persetujuan', ['Selesai', 'Diarsipkan'])
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

        $categoryOptions = $this->deriveOptions($complaints->pluck('kategori'));
        $statusOptions = $this->deriveOptions($complaints->pluck('status_persetujuan'));
        $priorityOptions = $this->deriveOptions($complaints->pluck('prioritas'));

        return Inertia::render('Staff/Complaints', [
            'stats' => $stats,
            'complaints' => $complaints
                ->map(fn (Surat $surat) => [
                    'id' => $surat->surat_id,
                    'letterNumber' => $surat->nomor_surat,
                    'from' => $surat->user?->name ?? '-',
                    'category' => $surat->kategori ?? '-',
                    'subject' => $surat->perihal ?? '-',
                    'date' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
                    'status' => $surat->status_persetujuan ?? '-',
                    'priority' => $surat->prioritas ?? 'medium',
                    'description' => $surat->isi_surat,
                    'attachment' => [
                        'name' => $surat->lampiran_nama,
                        'url' => $surat->attachmentUrl(),
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

        $departemen = $this->resolveDepartemen($user->division);

        $data = [
            'user_id' => $user->id,
            'departemen_id' => $departemen?->id,
            'nomor_surat' => Surat::generateNomorSurat($departemen?->kode),
            'tipe_surat' => 'keluar',
            'jenis_surat' => 'Pengaduan',
            'tanggal_surat' => now()->toDateString(),
            'perihal' => $request->input('subject'),
            'isi_surat' => $request->input('description'),
            'status_persetujuan' => 'Menunggu HR',
            'kategori' => $request->input('category'),
            'prioritas' => $request->input('priority'),
            'penerima' => 'Admin HR',
            'target_division' => 'Human Capital/HR',
            'current_recipient' => 'hr',
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('complaints', 'public');
            $data['lampiran_path'] = $path;
            $data['lampiran_nama'] = $file->getClientOriginalName();
            $data['lampiran_mime'] = $file->getMimeType();
            $data['lampiran_size'] = $file->getSize();
        }

        Surat::create($data);

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

    private function deriveOptions(Collection $values): array
    {
        return $values
            ->filter()
            ->map(fn ($value) => (string) $value)
            ->unique()
            ->values()
            ->all();
    }

    private function resolveDepartemen(?string $division): ?Departemen
    {
        if (! $division) {
            return null;
        }

        $code = preg_replace('/[^A-Za-z]/', '', $division) ?: 'GEN';

        return Departemen::firstOrCreate(
            ['nama' => $division],
            ['kode' => strtoupper(substr($code, 0, 3))]
        );
    }

    private function authorizeStaff(?User $user): void
    {
        abort_unless($user && $user->role === User::ROLES['staff'], 403);
    }
}
