<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LetterTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'file_path',
        'file_name',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the full storage path.
     */
    public function getFullPathAttribute(): string
    {
        return storage_path('app/' . $this->file_path);
    }

    /**
     * Available placeholders for templates.
     */
    public static function placeholders(): array
    {
        return [
            '{{nomor_surat}}' => 'Nomor Surat',
            '{{tanggal}}' => 'Tanggal Surat',
            '{{pengirim}}' => 'Nama Pengirim',
            '{{divisi_pengirim}}' => 'Divisi Pengirim',
            '{{penerima}}' => 'Penerima / Divisi Tujuan',
            '{{perihal}}' => 'Perihal',
            '{{isi_surat}}' => 'Isi Surat',
            '{{prioritas}}' => 'Prioritas',
            '{{catatan_disposisi}}' => 'Catatan Disposisi',
            '{{tanggal_disposisi}}' => 'Tanggal Disposisi',
            '{{oleh}}' => 'HR yang Mendisposisi',
        ];
    }
}
