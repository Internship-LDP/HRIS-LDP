<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingChecklist extends Model
{
    protected $fillable = [
        'application_id',
        'contract_signed',
        'inventory_handover',
        'training_orientation',
    ];

    protected $casts = [
        'contract_signed' => 'boolean',
        'inventory_handover' => 'boolean',
        'training_orientation' => 'boolean',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
