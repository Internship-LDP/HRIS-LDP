<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class StaffTermination extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'user_id',
        'requested_by',
        'employee_code',
        'employee_name',
        'division',
        'position',
        'type',
        'reason',
        'suggestion',
        'request_date',
        'effective_date',
        'status',
        'progress',
        'checklist',
        'exit_interview_at',
        'notes',
    ];

    protected $casts = [
        'request_date' => 'date',
        'effective_date' => 'date',
        'checklist' => 'array',
        'exit_interview_at' => 'datetime',
    ];

    public static function generateReference(): string
    {
        $prefix = 'OFF';
        $sequence = static::max('id') + 1;
        return sprintf('%s-%s', $prefix, Str::padLeft((string) $sequence, 4, '0'));
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
