<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffProfile extends Model
{
    use HasFactory;

    public const RELIGIONS = [
        'Islam',
        'Kristen',
        'Katolik',
        'Hindu',
        'Buddha',
        'Kong Hu Chu',
        'Lainnya',
    ];

    public const GENDERS = [
        'Laki-laki',
        'Perempuan',
    ];

    public const EDUCATION_LEVELS = [
        'SMA/SMK',
        'D3',
        'S1',
        'S2',
        'S3',
        'Lainnya',
    ];

    protected $fillable = [
        'user_id',
        'religion',
        'gender',
        'education_level',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
