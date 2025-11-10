<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;

    public const STATUSES = [
        'Applied',
        'Screening',
        'Interview',
        'Hired',
        'Rejected',
    ];

    protected $fillable = [
        'user_id',
        'full_name',
        'email',
        'phone',
        'position',
        'division',
        'education',
        'experience',
        'skills',
        'cv_file',
        'status',
        'notes',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
