<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\StoreSuratRequest;
use App\Models\Departemen;
use App\Models\Surat;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LetterController extends Controller
{
    private const ALL_DIVISIONS_VALUE = '__all_divisions__';

    /**
     * Tampilkan dashboard kelola surat.
     */
    public function index(Request $request): Response
    {
        $this->authorizeAccess($request->user());

        $filters = [
            'search' => $request->string('search')->toString(),
            'category' => $request->string('category')->toString(),
            'tab' => $request->string('tab')->toString() ?: 'inbox',
        ];

        $lettersQuery = Surat::query()->with([
            'user:id,name,division,role',
            'departemen:id,nama,kode',
        ]);

        if ($filters['search']) {
            $lettersQuery->where(function ($query) use ($filters) {
                $search = '%'.$filters['search'].'%';
                $query
                    ->where('nomor_surat', 'like', $search)
                    ->orWhere('perihal', 'like', $search)
                    ->orWhere('penerima', 'like', $search);
            });
        }

        if ($filters['category'] && $filters['category'] !== 'all') {
            $lettersQuery->where('kategori', $filters['category']);
        }

        $letters = $lettersQuery
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->get();

        $inbox = $letters->where('tipe_surat', 'masuk');
        $outbox = $letters->where('tipe_surat', 'keluar');
        $archive = $letters->where('status_persetujuan', 'Diarsipkan');

        $pendingDisposition = $letters->where('current_recipient', 'hr');

        $stats = [
            'inbox' => $inbox->count(),
            'outbox' => $outbox->count(),
            'pending' => $letters->where('status_persetujuan', 'Diproses')->count(),
            'archived' => $archive->count(),
        ];

        $divisionCode = $this->departmentCodeFromDivision($request->user()?->division);
        $divisionOptions = $this->divisionOptions()->all();

        return Inertia::render('SuperAdmin/KelolaSurat/Index', [
            'stats' => $stats,
            'filters' => $filters,
            'letters' => [
                'inbox' => $this->transformLetters($inbox),
                'outbox' => $this->transformLetters($outbox),
                'archive' => $this->transformLetters($archive),
            ],
            'pendingDisposition' => $this->transformLetters($pendingDisposition),
            'options' => [
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
                    'Kepegawaian',
                    'Keuangan',
                    'Operasional',
                ],
                'priorities' => [
                    'high' => 'Tinggi',
                    'medium' => 'Sedang',
                    'low' => 'Rendah',
                ],
                'divisions' => $divisionOptions,
            ],
            'nextLetterNumber' => Surat::generateNomorSurat($divisionCode),
        ]);
    }

    /**
     * Simpan surat keluar baru.
     */
    public function store(StoreSuratRequest $request): Response
    {
        $this->authorizeAccess($request->user());

        /** @var User $user */
        $user = $request->user();

        $departemen = $this->resolveDepartemen($user->division);

        $data = $request->validated();
        $data['user_id'] = $user->id;
        $data['departemen_id'] = $departemen?->id;
        $data['tipe_surat'] = $data['tipe_surat'] ?? 'keluar';
        $data['tanggal_surat'] = now()->toDateString();
        $data['status_persetujuan'] = 'Terkirim';

        if ($request->hasFile('lampiran')) {
            $file = $request->file('lampiran');
            $path = $file->store('letters', 'public'); //server/storage/letters
            $data['lampiran_path'] = $path;
            $data['lampiran_nama'] = $file->getClientOriginalName();
            $data['lampiran_mime'] = $file->getMimeType();
            $data['lampiran_size'] = $file->getSize();
        }

        $targetDivisions = $data['target_division'] === self::ALL_DIVISIONS_VALUE
            ? $this->divisionOptions()
            : collect([$data['target_division']]);

        if ($targetDivisions->isEmpty()) {
            return redirect()
                ->back()
                ->with('error', 'Divisi tujuan tidak tersedia.');
        }

        foreach ($targetDivisions as $divisionName) {
            $payload = $data;
            $payload['target_division'] = $divisionName;
            $payload['nomor_surat'] = Surat::generateNomorSurat($departemen?->kode);
            Surat::create($payload);
        }

        return redirect()
            ->route('super-admin.letters.index')
            ->with(
                'success',
                $targetDivisions->count() > 1
                    ? 'Surat berhasil dikirim ke '.$targetDivisions->count().' divisi.'
                    : 'Surat berhasil dikirim.'
            );
    }

    public function disposition(Request $request, Surat $surat): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        abort_unless($surat->current_recipient === 'hr', 400, 'Surat sudah didisposisi.');

        $validated = $request->validate([
            'disposition_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $surat->forceFill([
            'current_recipient' => 'division',
            'penerima' => $surat->target_division ?? $surat->penerima,
            'status_persetujuan' => 'Didisposisi',
            'disposition_note' => $validated['disposition_note'] ?? null,
            'disposed_by' => $request->user()->id,
            'disposed_at' => now(),
        ])->save();

        return redirect()
            ->back()
            ->with('success', 'Surat berhasil didisposisi ke divisi tujuan.');
    }

    public function bulkDisposition(Request $request): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        $validated = $request->validate([
            'letter_ids' => ['required', 'array', 'min:1'],
            'letter_ids.*' => ['integer', 'exists:surat,surat_id'],
            'disposition_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $letters = Surat::whereIn('surat_id', $validated['letter_ids'])->get();

        if ($letters->isEmpty()) {
            return redirect()
                ->back()
                ->with('error', 'Surat tidak ditemukan atau sudah diproses.');
        }

        $invalidLetters = $letters->filter(
            fn (Surat $surat) => $surat->current_recipient !== 'hr'
        );

        if ($invalidLetters->isNotEmpty()) {
            return redirect()
                ->back()
                ->with('error', 'Sebagian surat sudah diproses, segarkan data Anda.');
        }

        $userId = $request->user()?->id;

        foreach ($letters as $surat) {
            $surat->forceFill([
                'current_recipient' => 'division',
                'penerima' => $surat->target_division ?? $surat->penerima,
                'status_persetujuan' => 'Didisposisi',
                'disposition_note' => $validated['disposition_note'] ?? null,
                'disposed_by' => $userId,
                'disposed_at' => now(),
            ])->save();
        }

        return redirect()
            ->route('super-admin.letters.index')
            ->with(
                'success',
                $letters->count().' surat berhasil didisposisi ke divisi tujuan.'
            );
    }

    public function rejectDisposition(Request $request): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        $validated = $request->validate([
            'letter_ids' => ['required', 'array', 'min:1'],
            'letter_ids.*' => ['integer', 'exists:surat,surat_id'],
            'disposition_note' => ['required', 'string', 'max:2000'],
        ]);

        $letters = Surat::whereIn('surat_id', $validated['letter_ids'])->get();

        if ($letters->isEmpty()) {
            return redirect()
                ->back()
                ->with('error', 'Surat tidak ditemukan atau sudah diproses.');
        }

        $invalidLetters = $letters->filter(
            fn (Surat $surat) => $surat->current_recipient !== 'hr'
        );

        if ($invalidLetters->isNotEmpty()) {
            return redirect()
                ->back()
                ->with('error', 'Sebagian surat sudah diproses, segarkan data Anda.');
        }

        $userId = $request->user()?->id;

        foreach ($letters as $surat) {
            $originDivision = $surat->departemen?->nama
                ?? $surat->user?->division
                ?? $surat->penerima;

            $surat->forceFill([
                'current_recipient' => 'division',
                'penerima' => $originDivision,
                'target_division' => $originDivision,
                'status_persetujuan' => 'Ditolak HR',
                'disposition_note' => $validated['disposition_note'],
                'disposed_by' => $userId,
                'disposed_at' => now(),
            ])->save();
        }

        return redirect()
            ->route('super-admin.letters.index')
            ->with(
                'success',
                $letters->count().' surat ditolak dan dikembalikan ke divisi pengirim.'
            );
    }

    /**
     * Transform collection surat untuk frontend.
     */
    private function transformLetters(Collection $letters): array
    {
        return $letters->map(function (Surat $surat) {
            return [
                'id' => $surat->surat_id,
                'letterNumber' => $surat->nomor_surat,
                'senderName' => $surat->user?->name,
                'senderDivision' => $surat->departemen?->nama ?? $surat->user?->division,
                'senderPosition' => $surat->user?->role,
                'recipientName' => $surat->penerima,
                'subject' => $surat->perihal,
                'letterType' => $surat->jenis_surat,
                'category' => $surat->kategori,
                'priority' => $surat->prioritas,
                'date' => optional($surat->tanggal_surat)->format('d M Y'),
                'status' => $surat->status_persetujuan,
                'content' => $surat->isi_surat,
                'type' => $surat->tipe_surat,
                'targetDivision' => $surat->target_division,
                'currentRecipient' => $surat->current_recipient,
                'dispositionNote' => $surat->disposition_note,
                'attachment' => $surat->lampiran_path
                    ? [
                        'name' => $surat->lampiran_nama,
                        'size' => $this->formatSize($surat->lampiran_size),
                        'url' => $surat->attachmentUrl(),
                        'mime' => $surat->lampiran_mime,
                    ]
                    : null,
            ];
        })->values()->toArray();
    }

    private function formatSize(?int $bytes): string
    {
        if (! $bytes) {
            return '0 KB';
        }

        return number_format($bytes / 1024, 2).' KB';
    }

    private function resolveDepartemen(?string $division): ?Departemen
    {
        if (! $division) {
            return null;
        }

        $code = $this->departmentCodeFromDivision($division) ?? 'GEN';

        return Departemen::firstOrCreate(
            ['nama' => $division],
            ['kode' => $code]
        );
    }

    private function departmentCodeFromDivision(?string $division): ?string
    {
        if (! $division) {
            return null;
        }

        $clean = preg_replace('/[^A-Za-z]/', '', $division) ?? '';

        if ($clean === '') {
            return null;
        }

        return Str::upper(Str::substr($clean, 0, 3));
    }

    private function authorizeAccess(?User $user): void
    {
        abort_unless(
            $user
            && (
                $user->role === User::ROLES['super_admin']
                || $user->isHumanCapitalAdmin()
            ),
            403
        );
    }

    private function divisionOptions(): Collection
    {
        $divisions = User::query()
            ->whereNotNull('division')
            ->distinct()
            ->pluck('division')
            ->filter()
            ->values();

        if ($divisions->isEmpty()) {
            $divisions = collect(User::DIVISIONS);
        }

        return $divisions;
    }
}
