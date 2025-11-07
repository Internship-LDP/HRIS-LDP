<?php

namespace App\Http\Controllers\AdminStaff;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminStaff\StoreLetterRequest;
use App\Http\Controllers\SuperAdmin\LetterController as SuperAdminLetterController;
use App\Models\Application;
use App\Models\Departemen;
use App\Models\Surat;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LetterController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        if ($user && $user->isHumanCapitalAdmin()) {
            return app(SuperAdminLetterController::class)->index($request);
        }
        abort_unless($this->authorized($user), 403);

        $inboxLetters = $this->lettersForStaff($user)
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->get();

        $outboxLetters = Surat::query()
            ->where('user_id', $user->id)
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->get();

        $archiveLetters = Surat::query()
            ->where('target_division', $user->division)
            ->where('status_persetujuan', 'Diarsipkan')
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->get();

        $stats = [
            'inbox' => $inboxLetters->count(),
            'outbox' => $outboxLetters->count(),
            'pending' => $inboxLetters
                ->whereIn('status_persetujuan', ['Menunggu HR', 'Diajukan', 'Diproses'])
                ->count(),
            'archived' => $archiveLetters->count(),
        ];

        $recruitments = Application::query()
            ->whereIn('status', ['Applied', 'Screening'])
            ->latest('submitted_at')
            ->limit(10)
            ->get()
            ->map(fn (Application $application) => [
                'name' => $application->full_name,
                'position' => $application->position ?? '-',
                'date' => optional($application->submitted_at)->format('d M Y') ?? '-',
                'status' => $application->status,
                'education' => $application->education,
            ]);

        $divisionOptions = User::query()
            ->whereNotNull('division')
            ->distinct()
            ->pluck('division')
            ->filter()
            ->values()
            ->all();

        if (empty($divisionOptions)) {
            $divisionOptions = User::DIVISIONS;
        }

        $letterOptions = [
            'letterTypes' => [
                'Permohonan',
                'Undangan',
                'Laporan',
                'Pemberitahuan',
                'Surat Tugas',
                'Surat Cuti',
                'Surat Peringatan',
                'Surat Kerjasama',
            ],
            'categories' => [
                'Internal',
                'Eksternal',
                'Keuangan',
                'Operasional',
            ],
            'priorities' => [
                'high' => 'Tinggi',
                'medium' => 'Sedang',
                'low' => 'Rendah',
            ],
            'divisions' => $divisionOptions,
        ];

        $nextLetterNumber = Surat::generateNomorSurat($this->divisionCode($user->division));

        return Inertia::render('AdminStaff/Letters', [
            'letters' => [
                'inbox' => $this->transformLetters($inboxLetters),
                'outbox' => $this->transformLetters($outboxLetters),
                'archive' => $this->transformLetters($archiveLetters),
            ],
            'recruitments' => $recruitments,
            'stats' => $stats,
            'options' => $letterOptions,
            'nextLetterNumber' => $nextLetterNumber,
        ]);
    }

    public function store(StoreLetterRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($this->authorized($user), 403);

        $departemen = $this->resolveDepartemen($user->division);

        $data = [
            'user_id' => $user->id,
            'departemen_id' => $departemen?->id,
            'nomor_surat' => Surat::generateNomorSurat($departemen?->kode),
            'tipe_surat' => 'keluar',
            'jenis_surat' => $request->input('jenis_surat'),
            'tanggal_surat' => now()->toDateString(),
            'perihal' => $request->input('perihal'),
            'isi_surat' => $request->input('isi_surat') ?? '',
            'status_persetujuan' => 'Menunggu HR',
            'kategori' => $request->input('kategori'),
            'prioritas' => $request->input('prioritas'),
            'penerima' => $request->input('penerima') ?: 'Admin HR',
            'target_division' => $request->input('target_division'),
            'current_recipient' => 'hr',
        ];

        if ($request->hasFile('lampiran')) {
            $file = $request->file('lampiran');
            $path = $file->store('letters', 'public');
            $data['lampiran_path'] = $path;
            $data['lampiran_nama'] = $file->getClientOriginalName();
            $data['lampiran_mime'] = $file->getMimeType();
            $data['lampiran_size'] = $file->getSize();
        }

        Surat::create($data);

        return redirect()
            ->route('admin-staff.letters')
            ->with('success', 'Surat berhasil dikirim dan menunggu disposisi HR.');
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

    private function transformLetters(Collection $letters): array
    {
        return $letters
            ->map(fn (Surat $surat) => [
                'id' => $surat->surat_id,
                'letterNumber' => $surat->nomor_surat,
                'from' => $surat->departemen?->nama ?? $surat->user?->division ?? 'Internal',
                'sender' => $surat->user?->name ?? 'HRD',
                'subject' => $surat->perihal ?? '-',
                'category' => $surat->kategori ?? '-',
                'date' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
                'status' => $surat->status_persetujuan ?? '-',
                'priority' => $surat->prioritas ?? 'medium',
                'hasAttachment' => (bool) $surat->lampiran_path,
                'attachmentUrl' => $surat->attachmentUrl(),
                'content' => $surat->isi_surat,
            ])
            ->values()
            ->toArray();
    }

    private function authorized(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole(User::ROLES['admin'])
            && ! $user->belongsToHumanCapitalDivision();
    }

    private function divisionCode(?string $division): ?string
    {
        if (! $division) {
            return null;
        }

        $clean = preg_replace('/[^A-Za-z]/', '', $division) ?: '';

        if ($clean === '') {
            return null;
        }

        return strtoupper(substr($clean, 0, 3));
    }
}
