<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\StoreSuratRequest;
use App\Events\LetterUpdated;
use App\Models\Departemen;
use App\Models\Surat;
use App\Models\User;
use App\Support\LetterPresenter;
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
            'category' => $request->string('category')->toString() ?: 'all',
            'tab' => $request->string('tab')->toString() ?: 'inbox',
        ];

        $lettersQuery = Surat::query()->with([
            'user:id,name,division,role',
            'departemen:id,nama,kode',
            'replyAuthor:id,name',
            'replyHistories' => function ($query) {
                $query->with('author:id,name,division')->orderBy('replied_at');
            },
            'disposer:id,name',
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

        $archive = $letters->where('status_persetujuan', 'Diarsipkan');
        $activeLetters = $letters->reject(
            static fn (Surat $surat) => $surat->status_persetujuan === 'Diarsipkan'
        );

        $inbox = $activeLetters->filter(
            static fn (Surat $surat) => $surat->current_recipient === 'hr'
        );
        $outbox = $activeLetters->filter(
            static fn (Surat $surat) => $surat->current_recipient === 'division'
        );

        $pendingStatuses = ['Menunggu HR', 'Diajukan', 'Diproses'];
        $pendingDisposition = $inbox->filter(
            static fn (Surat $surat) => in_array($surat->status_persetujuan, $pendingStatuses, true)
        );

        $stats = [
            'inbox' => $inbox->count(),
            'outbox' => $outbox->count(),
            'pending' => $pendingDisposition->count(),
            'archived' => $archive->count(),
        ];

        $divisionCode = $this->departmentCodeFromDivision($request->user()?->division);
        $divisionOptions = $this->divisionOptions()->all();

        return Inertia::render('SuperAdmin/KelolaSurat/Index', [
            'stats' => $stats,
            'filters' => $filters,
            'letters' => [
                'inbox' => LetterPresenter::collection($inbox),
                'outbox' => LetterPresenter::collection($outbox),
                'archive' => LetterPresenter::collection($archive),
            ],
            'pendingDisposition' => LetterPresenter::collection($pendingDisposition),
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
    public function store(StoreSuratRequest $request): RedirectResponse
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
        $data['previous_division'] = $user->division ?? 'Super Admin';

        // Super Admin letters go directly to target division (skip disposition)
        $data['status_persetujuan'] = 'Didisposisi';
        $data['disposed_at'] = now();
        $data['disposed_by'] = $user->id;
        $data['disposition_note'] = 'Dikirim langsung oleh Super Admin';

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
            // For Super Admin, set current_recipient directly to target division
            $payload['current_recipient'] = $divisionName;
            $payload['nomor_surat'] = Surat::generateNomorSurat($departemen?->kode);
            $newSurat = Surat::create($payload);

            LetterUpdated::dispatch($newSurat, 'created');
        }

        return redirect()
            ->route('super-admin.letters.index')
            ->with(
                'success',
                $targetDivisions->count() > 1
                    ? 'Surat berhasil dikirim langsung ke '.$targetDivisions->count().' divisi.'
                    : 'Surat berhasil dikirim langsung ke divisi tujuan.'
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

        LetterUpdated::dispatch($surat->fresh(), 'disposed');

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

            LetterUpdated::dispatch($surat->fresh(), 'disposed');
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

            LetterUpdated::dispatch($surat->fresh(), 'rejected');
        }

        return redirect()
            ->route('super-admin.letters.index')
            ->with(
                'success',
                $letters->count().' surat ditolak dan dikembalikan ke divisi pengirim.'
            );
    }

    /**
     * Final disposition - marks letters as finalized (recipient cannot reply).
     */
    public function finalDisposition(Request $request): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        $validated = $request->validate([
            'disposition_note' => ['nullable', 'string', 'max:2000'],
            'letter_ids' => ['required', 'array', 'min:1'],
            'letter_ids.*' => ['integer', 'exists:surat,surat_id'],
        ]);

        $letters = Surat::query()
            ->whereIn('surat_id', $validated['letter_ids'])
            ->where('current_recipient', 'hr')
            ->get();

        if ($letters->isEmpty()) {
            return redirect()
                ->back()
                ->with('error', 'Surat tidak ditemukan atau sudah diproses.');
        }

        $userId = $request->user()?->id;
        $wordService = new \App\Services\DispositionWordService();

        foreach ($letters as $surat) {
            // Update disposition note first so it's included in the document
            $surat->disposition_note = $validated['disposition_note'] ?? $surat->disposition_note;
            $surat->disposed_by = $userId;
            $surat->disposed_at = now();

            // Generate the disposition Word document
            $tempFile = $wordService->generate($surat);
            $fileName = 'disposisi_final_' . $surat->nomor_surat . '_' . now()->format('Ymd_His') . '.docx';
            $fileName = preg_replace('/[^a-zA-Z0-9_\-.]/', '_', $fileName);
            $storagePath = 'disposition_documents/' . $fileName;

            // Store the file
            \Illuminate\Support\Facades\Storage::disk('public')->put($storagePath, file_get_contents($tempFile));

            // Clean up temp file
            @unlink($tempFile);

            $surat->forceFill([
                'current_recipient' => 'division',
                'penerima' => $surat->target_division ?? $surat->penerima,
                'status_persetujuan' => 'Didisposisi',
                'is_finalized' => true,
                'disposition_document_path' => $storagePath,
                'disposition_document_name' => $fileName,
            ])->save();

            LetterUpdated::dispatch($surat->fresh(), 'finalized');
        }

        return redirect()
            ->route('super-admin.letters.index')
            ->with(
                'success',
                $letters->count().' surat didisposisi final. Penerima tidak dapat membalas.'
            );
    }

    public function archive(Request $request, Surat $surat): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        if ($surat->status_persetujuan === 'Diarsipkan') {
            return redirect()
                ->back()
                ->with('info', 'Surat sudah berada di arsip.');
        }

        if ($surat->status_persetujuan !== 'Didisposisi') {
            return redirect()
                ->back()
                ->with('error', 'Hanya surat yang sudah didisposisi yang dapat diarsipkan.');
        }

        $surat->forceFill([
            'status_persetujuan' => 'Diarsipkan',
            'current_recipient' => 'archive',
        ])->save();

        LetterUpdated::dispatch($surat->fresh(), 'archived');

        return redirect()
            ->route('super-admin.letters.index')
            ->with('success', 'Surat dipindahkan ke arsip.');
    }

    public function unarchive(Request $request, Surat $surat): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        if ($surat->status_persetujuan !== 'Diarsipkan') {
            return redirect()
                ->back()
                ->with('info', 'Surat tidak berada di arsip.');
        }

        $surat->forceFill([
            'status_persetujuan' => 'Didisposisi',
            'current_recipient' => 'division',
        ])->save();

        LetterUpdated::dispatch($surat->fresh(), 'unarchived');

        return redirect()
            ->route('super-admin.letters.index')
            ->with('success', 'Surat dikembalikan ke daftar aktif.');
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

    /**
     * Export disposition as Word document and mark as finalized.
     */
    public function exportDispositionWord(Request $request, Surat $surat): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $this->authorizeAccess($request->user());

        // Mark letter as disposed and finalized
        $surat->forceFill([
            'current_recipient' => 'division',
            'penerima' => $surat->target_division ?? $surat->penerima,
            'status_persetujuan' => 'Didisposisi',
            'disposed_by' => $request->user()->id,
            'disposed_at' => now(),
            'is_finalized' => true,
        ])->save();

        LetterUpdated::dispatch($surat->fresh(), 'disposed');

        // Generate Word document
        $service = new \App\Services\DispositionWordService();
        $filePath = $service->generate($surat);
        $filename = $service->getFilename($surat);

        return response()->download($filePath, $filename)->deleteFileAfterSend(true);
    }

    /**
     * Export FINAL disposition as Word document - recipient cannot reply.
     * Uses custom template if available.
     */
    public function exportFinalDisposition(Request $request, Surat $surat): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $this->authorizeAccess($request->user());

        // Mark letter as disposed, finalized (no reply allowed)
        $surat->forceFill([
            'current_recipient' => 'division',
            'penerima' => $surat->target_division ?? $surat->penerima,
            'status_persetujuan' => 'Didisposisi',
            'disposed_by' => $request->user()->id,
            'disposed_at' => now(),
            'is_finalized' => true, // This prevents replies
        ])->save();

        LetterUpdated::dispatch($surat->fresh(), 'finalized');

        // Generate Word document (will use custom template if active)
        $service = new \App\Services\DispositionWordService();
        $filePath = $service->generate($surat);
        $filename = $service->getFilename($surat);

        return response()->download($filePath, $filename)->deleteFileAfterSend(true);
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
        // Only return divisions that have an Admin account
        return User::query()
            ->where('role', User::ROLES['admin'])
            ->whereNotNull('division')
            ->where('status', 'Active')
            ->distinct()
            ->pluck('division')
            ->filter()
            ->values();
    }
}
