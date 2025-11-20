<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'religion',
        'address',
        'city',
        'province',
        'profile_photo_path',
        'educations',
        'experiences',
        'completed_at',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'educations' => 'array',
        'experiences' => 'array',
        'completed_at' => 'datetime',
    ];

    protected $appends = ['is_complete'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getIsCompleteAttribute(): bool
    {
        return $this->hasMinimumRequiredFields();
    }

    public function syncCompletionFlag(): void
    {
        $isComplete = $this->hasMinimumRequiredFields();

        if ($isComplete && ! $this->completed_at) {
            $this->completed_at = now();
        }

        if (! $isComplete) {
            $this->completed_at = null;
        }
    }

    private function hasMinimumRequiredFields(): bool
    {
        return filled($this->phone)
            && filled($this->date_of_birth)
            && filled($this->gender)
            && filled($this->religion)
            && filled($this->address)
            && filled($this->city)
            && filled($this->province)
            && ! empty($this->educations);
    }
}
