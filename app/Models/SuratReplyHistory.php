<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SuratReplyHistory extends Model
{
    protected $fillable = [
        'surat_id',
        'replied_by',
        'from_division',
        'to_division',
        'note',
        'replied_at',
    ];

    protected $casts = [
        'replied_at' => 'datetime',
    ];

    public function surat(): BelongsTo
    {
        return $this->belongsTo(Surat::class, 'surat_id', 'surat_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replied_by');
    }
}
