<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Departemen extends Model
{
    use HasFactory;

    protected $table = 'departemen';

    protected $fillable = [
        'nama',
        'kode',
    ];

    /**
     * Relasi ke surat.
     */
    public function surat(): HasMany
    {
        return $this->hasMany(Surat::class, 'departemen_id', 'id');
    }
}
