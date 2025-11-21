<?php

namespace App\Support;

use App\Models\Surat;
use Illuminate\Support\Collection;

class LetterPresenter
{
    /**
     * Transform a collection of Surat models to the frontend payload shape.
     */
    public static function collection(Collection $letters): array
    {
        return $letters->map(fn (Surat $surat) => self::make($surat))
            ->values()
            ->toArray();
    }

    /**
     * Transform a single Surat model to the frontend payload shape.
     */
    public static function make(Surat $surat): array
    {
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
            'replyNote' => $surat->reply_note,
            'replyBy' => $surat->replyAuthor?->name,
            'replyAt' => optional($surat->reply_at)->format('d M Y H:i'),
            'replyHistory' => self::replyHistory($surat),
            'disposedBy' => $surat->disposer?->name,
            'disposedAt' => optional($surat->disposed_at)->format('d M Y H:i'),
            'approvalDate' => optional($surat->tanggal_persetujuan)->format('d M Y H:i'),
            'createdAt' => optional($surat->created_at)->format('d M Y H:i'),
            'updatedAt' => optional($surat->updated_at)->format('d M Y H:i'),
            'attachment' => $surat->lampiran_path
                ? [
                    'name' => $surat->lampiran_nama,
                    'size' => self::formatSize($surat->lampiran_size),
                    'url' => $surat->attachmentUrl(),
                    'mime' => $surat->lampiran_mime,
                ]
                : null,
        ];
    }

    private static function replyHistory(Surat $surat): array
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

    private static function formatSize(?int $bytes): string
    {
        if (! $bytes) {
            return '0 KB';
        }

        return number_format($bytes / 1024, 2) . ' KB';
    }
}
