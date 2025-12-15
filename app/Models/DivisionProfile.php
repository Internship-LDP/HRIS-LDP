<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DivisionProfile extends Model
{
    protected $fillable = [
        'name',
        'description',
        'manager_name',
        'capacity',
        'is_hiring',
        'job_title',
        'job_description',
        'job_requirements',
        'job_eligibility_criteria',
        'hiring_opened_at',
    ];

    protected $casts = [
        'is_hiring' => 'boolean',
        'job_requirements' => 'array',
        'job_eligibility_criteria' => 'array',
        'hiring_opened_at' => 'datetime',
    ];
}
