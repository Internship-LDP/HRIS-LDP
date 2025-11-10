<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Complaint extends Model
{
    use HasFactory;

    public const STATUS_NEW = 'new';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_ARCHIVED = 'archived';

    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_MEDIUM = 'medium';
    public const PRIORITY_LOW = 'low';

    public const STATUS_LABELS = [
        self::STATUS_NEW => 'Baru',
        self::STATUS_IN_PROGRESS => 'OnProgress',
        self::STATUS_RESOLVED => 'Selesai',
        self::STATUS_ARCHIVED => 'Diarsipkan',
    ];

    public const PRIORITY_LABELS = [
        self::PRIORITY_HIGH => 'Tinggi',
        self::PRIORITY_MEDIUM => 'Sedang',
        self::PRIORITY_LOW => 'Rendah',
    ];

    protected $fillable = [
        'complaint_code',
        'user_id',
        'handled_by_id',
        'category',
        'subject',
        'description',
        'status',
        'priority',
        'is_anonymous',
        'attachment_path',
        'attachment_name',
        'attachment_mime',
        'attachment_size',
        'submitted_at',
        'resolved_at',
        'resolution_notes',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'submitted_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Complaint $complaint) {
            if (empty($complaint->complaint_code)) {
                $complaint->complaint_code = static::generateCode();
            }

            if (empty($complaint->status)) {
                $complaint->status = self::STATUS_NEW;
            }

            if (empty($complaint->priority)) {
                $complaint->priority = self::PRIORITY_MEDIUM;
            }

            if (empty($complaint->submitted_at)) {
                $complaint->submitted_at = now();
            }
        });
    }

    public static function generateCode(): string
    {
        $sequence = (int) (self::query()->max('id') ?? 0) + 1;
        $code = sprintf('CPL%04d', $sequence);

        while (self::where('complaint_code', $code)->exists()) {
            $sequence++;
            $code = sprintf('CPL%04d', $sequence);
        }

        return $code;
    }

    public function scopeForManagement(Builder $query): Builder
    {
        return $query->with(['reporter', 'handler'])
            ->orderByDesc('submitted_at');
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by_id');
    }

    public function statusLabel(): string
    {
        return self::STATUS_LABELS[$this->status] ?? Str::title(str_replace('_', ' ', $this->status));
    }

    public function priorityLabel(): string
    {
        return self::PRIORITY_LABELS[$this->priority] ?? Str::title($this->priority);
    }

    public function attachmentUrl(): ?string
    {
        if (! $this->attachment_path) {
            return null;
        }

        return asset('storage/'.$this->attachment_path);
    }
}
