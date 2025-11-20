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

        // Interview fields
        'interview_date',
        'interview_time',
        'interview_mode',
        'interviewer_name',
        'meeting_link',
        'interview_notes',

        'rejection_reason',//
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'interview_date' => 'date',
        'interview_time' => 'string',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
