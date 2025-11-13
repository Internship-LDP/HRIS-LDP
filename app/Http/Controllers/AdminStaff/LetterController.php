<?php

namespace App\Http\Controllers\AdminStaff;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminStaff\StoreLetterRequest;
use App\Http\Controllers\SuperAdmin\LetterController as SuperAdminLetterController;
use App\Models\Application;
use App\Models\Departemen;
use App\Models\Surat;
use App\Models\User;
use App\Models\SuratReplyHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LetterController extends Controller
{
    private const ALL_DIVISIONS_VALUE = '__all_divisions__';
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
            ->with($this->letterRelations())
            ->where('user_id', $user->id)
            ->orderByDesc('tanggal_surat')
            ->orderByDesc('surat_id')
            ->get();

        $archiveLetters = Surat::query()
            ->with($this->letterRelations())
            ->where(function ($query) use ($user) {
                $query->where('target_division', $user->division)
                    ->orWhere('penerima', $user->division)
                    ->orWhere('user_id', $user->id);
            })
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

        $divisionOptions = $this->divisionOptions()->all();

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
            'previous_division' => $user->division ?? $departemen?->nama,
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

        $targetDivisions = $data['target_division'] === self::ALL_DIVISIONS_VALUE
            ? $this->divisionOptions()
            : collect([$data['target_division']])->filter();

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
            ->route('admin-staff.letters')
            ->with(
                'success',
                $targetDivisions->count() > 1
                    ? 'Surat berhasil dikirim ke seluruh divisi dan menunggu disposisi HR.'
                    : 'Surat berhasil dikirim dan menunggu disposisi HR.'
            );
    }

    public function reply(Request $request, Surat $surat): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($this->authorized($user), 403);

        abort_unless(
            $surat->current_recipient === 'division'
                && (
                    $surat->target_division === $user->division
                    || $surat->penerima === $user->division
                ),
            403
        );

        abort_if($surat->status_persetujuan === 'Diarsipkan', 403);

        $validated = $request->validate([
            'reply_note' => ['required', 'string', 'max:2000'],
        ]);

        $originDivision = $surat->departemen?->nama
            ?? $surat->user?->division
            ?? $surat->penerima
            ?? 'Admin HR';

        $currentDivision = $user->division ?? $surat->target_division ?? $originDivision;
        $nextTarget = $surat->previous_division;

        if (! $nextTarget || $nextTarget === $currentDivision) {
            $nextTarget = $originDivision;
        }
        if (! $nextTarget) {
            $nextTarget = 'Admin HR';
        }

        $surat->forceFill([
            'reply_note' => $validated['reply_note'],
            'reply_by' => $user->id,
            'reply_at' => now(),
            'current_recipient' => 'hr',
            'penerima' => 'Admin HR',
            'target_division' => $nextTarget,
            'previous_division' => $currentDivision,
            'status_persetujuan' => 'Menunggu HR',
        ])->save();

        SuratReplyHistory::create([
            'surat_id' => $surat->surat_id,
            'replied_by' => $user->id,
            'from_division' => $currentDivision,
            'to_division' => $nextTarget,
            'note' => $validated['reply_note'],
            'replied_at' => $surat->reply_at,
        ]);

        return redirect()
            ->route('admin-staff.letters')
            ->with('success', 'Balasan surat dikirim ke HR untuk diteruskan.');
    }

    public function archive(Request $request, Surat $surat): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($this->authorized($user), 403);

        $belongsToDivision = $surat->target_division === $user->division
            || $surat->penerima === $user->division;

        $canArchiveInbox = $surat->current_recipient === 'division' && $belongsToDivision;
        $canArchiveOutbox = (int) $surat->user_id === (int) $user->id;

        abort_unless($canArchiveInbox || $canArchiveOutbox, 403);

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

        return redirect()
            ->route('admin-staff.letters')
            ->with('success', 'Surat berhasil dipindahkan ke arsip.');
    }

    public function unarchive(Request $request, Surat $surat): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($this->authorized($user), 403);

        $belongsToDivision = $surat->target_division === $user->division
            || $surat->penerima === $user->division;

        $canUnarchiveInbox = $belongsToDivision;
        $canUnarchiveOutbox = (int) $surat->user_id === (int) $user->id;

        abort_unless($canUnarchiveInbox || $canUnarchiveOutbox, 403);

        if ($surat->status_persetujuan !== 'Diarsipkan') {
            return redirect()
                ->back()
                ->with('info', 'Surat tidak berada di arsip.');
        }

        $surat->forceFill([
            'status_persetujuan' => 'Didisposisi',
            'current_recipient' => 'division',
        ])->save();

        return redirect()
            ->route('admin-staff.letters')
            ->with('success', 'Surat dikembalikan ke daftar aktif.');
    }

    private function lettersForStaff(User $user)
    {
        return Surat::query()
            ->with($this->letterRelations())
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
                'dispositionNote' => $surat->disposition_note,
                'replyNote' => $surat->reply_note,
                'replyBy' => $surat->replyAuthor?->name,
                'replyAt' => optional($surat->reply_at)->format('d M Y H:i'),
                'replyHistory' => $this->replyHistoryPayload($surat),
                'canReply' => $this->canReply($surat),
                'targetDivision' => $surat->target_division ?? $surat->penerima,
                'recipient' => $surat->penerima,
                'currentRecipient' => $surat->current_recipient,
                'disposedBy' => $surat->disposer?->name,
                'disposedAt' => optional($surat->disposed_at)->format('d M Y H:i'),
                'approvalDate' => optional($surat->tanggal_persetujuan)->format('d M Y H:i'),
                'createdAt' => optional($surat->created_at)->format('d M Y H:i'),
                'updatedAt' => optional($surat->updated_at)->format('d M Y H:i'),
            ])
            ->values()
            ->toArray();
    }

    private function replyHistoryPayload(Surat $surat): array
    {
        $histories = $surat->replyHistories
            ? $surat->replyHistories->map(function ($history) {
                return [
                    'id' => $history->id,
                    'note' => $history->note,
                    'author' => $history->author?->name,
                    'division' => $history->from_division,
                    'toDivision' => $history->to_division,
                    'timestamp' => optional($history->replied_at)->format('d M Y H:i'),
                ];
            })->values()->toArray()
            : [];

        if (empty($histories) && $surat->reply_note) {
            $histories[] = [
                'id' => null,
                'note' => $surat->reply_note,
                'author' => $surat->replyAuthor?->name,
                'division' => $surat->previous_division,
                'toDivision' => $surat->target_division,
                'timestamp' => optional($surat->reply_at)->format('d M Y H:i'),
            ];
        }

        return $histories;
    }

    private function authorized(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole(User::ROLES['admin'])
            && ! $user->belongsToHumanCapitalDivision();
    }

    private function canReply(Surat $surat): bool
    {
        return $surat->current_recipient === 'division'
            && $surat->status_persetujuan !== 'Diarsipkan';
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

    private function letterRelations(): array
    {
        return [
            'departemen:id,nama',
            'user:id,name,division',
            'replyAuthor:id,name',
            'disposer:id,name',
            'replyHistories' => function ($query) {
                $query->with('author:id,name,division')->orderBy('replied_at');
            },
        ];
    }
}
