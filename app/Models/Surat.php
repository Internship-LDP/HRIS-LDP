<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class Surat extends Model
{
    use HasFactory;

    protected $table = 'surat';

    protected $primaryKey = 'surat_id';

    protected $fillable = [
        'user_id',
        'departemen_id',
        'nomor_surat',
        'tipe_surat',
        'jenis_surat',
        'tanggal_surat',
        'perihal',
        'isi_surat',
        'status_persetujuan',
        'tanggal_persetujuan',
        'kategori',
        'prioritas',
        'penerima',
        'target_division',
        'current_recipient',
        'disposed_by',
        'disposed_at',
        'disposition_note',
        'alamat_pengirim',
        'lampiran_path',
        'lampiran_nama',
        'lampiran_mime',
        'lampiran_size',
    ];

    protected $casts = [
        'tanggal_surat' => 'date',
        'tanggal_persetujuan' => 'date',
        'disposed_at' => 'datetime',
    ];

    /**
     * Relasi user pembuat surat.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi departemen pengirim surat.
     */
    public function departemen(): BelongsTo
    {
        return $this->belongsTo(Departemen::class, 'departemen_id');
    }

    /**
     * Generate nomor surat dengan format 001/HRD/2025.
     */
    public static function generateNomorSurat(?string $departmentCode = null, ?Carbon $date = null): string
    {
        $date ??= now();
        $year = $date->format('Y');
        $countThisYear = static::whereYear('tanggal_surat', $year)->count() + 1;
        $code = $departmentCode
            ? Str::upper($departmentCode)
            : 'GEN';

        return sprintf('%03d/%s/%s', $countThisYear, $code, $year);
    }

    /**
     * URL lampiran jika tersedia.
     */
    public function attachmentUrl(): ?string
    {
        if (! $this->lampiran_path) {
            return null;
        }

        return asset('storage/'.$this->lampiran_path);
    }
}
