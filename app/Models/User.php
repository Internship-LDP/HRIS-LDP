<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public const ROLES = [
        'super_admin' => 'Super Admin',
        'admin' => 'Admin',
        'staff' => 'Staff',
        'pelamar' => 'Pelamar',
    ];

    public const DIVISIONS = [
        'Finance',
        'Corporate',
        'Government and Partner',
        'Human Capital/HR',
        'Infra and Backbone',
        'IPrime',
        'NOC',
    ];

    public const STATUSES = [
        'Active',
        'Inactive',
    ];

    protected $fillable = [
        'employee_code',
        'name',
        'email',
        'role',
        'division',
        'status',
        'registered_at',
        'inactive_at',
        'last_login_at',
        'password',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $appends = [
        'has_completed_applicant_profile',
        'needs_applicant_profile',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'registered_at' => 'date',
            'inactive_at' => 'date',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public static function generateEmployeeCode(string $role): string
{
    $prefix = match ($role) {
        self::ROLES['super_admin'] => 'SA',
        self::ROLES['admin']       => 'ADM',
        self::ROLES['staff']       => 'STF',
        self::ROLES['pelamar']     => 'PEL',
        default                    => 'EMP',
    };

    // Cari employee_code terbesar berdasarkan prefix
    $lastCode = self::where('employee_code', 'LIKE', $prefix . '%')
        ->orderBy('employee_code', 'desc')
        ->value('employee_code');

    // Jika belum ada data sama sekali
    if (!$lastCode) {
        return $prefix . '001';
    }

    // Ambil angka dari employee_code
    $number = intval(substr($lastCode, strlen($prefix)));

    // Naikkan angka +1
    $next = $number + 1;

    // Hasil akhir
    return $prefix . str_pad($next, 3, '0', STR_PAD_LEFT);
}


    /**
     * Route dashboard berdasarkan role.
     */
    public function dashboardRouteName(): string
    {
        if ($this->isHumanCapitalAdmin()) {
            return 'super-admin.admin-hr.dashboard';
        }

        if ($this->role === self::ROLES['admin']) {
            return 'admin-staff.dashboard';
        }

        return match ($this->role) {
            self::ROLES['super_admin'] => 'super-admin.dashboard',
            self::ROLES['staff'] => 'staff.dashboard',
            self::ROLES['pelamar'] => 'pelamar.dashboard',
            default => 'dashboard',
        };
    }

    public function belongsToHumanCapitalDivision(): bool
    {
        if (! $this->division) {
            return false;
        }

        $division = strtolower($this->division);

        return str_contains($division, 'human capital') || str_contains($division, 'human resources');
    }

    public function isHumanCapitalAdmin(): bool
    {
        return $this->role === self::ROLES['admin'] && $this->belongsToHumanCapitalDivision();
    }

    public function hasRole(string $role): bool
    {
        return strcasecmp($this->role ?? '', $role) === 0;
    }

    public function staffProfile(): HasOne
    {
        return $this->hasOne(StaffProfile::class);
    }

    public function applicantProfile(): HasOne
    {
        return $this->hasOne(ApplicantProfile::class);
    }

    public function ensureApplicantProfile(): ApplicantProfile
    {
        return $this->applicantProfile()->firstOrCreate([], [
            'full_name' => $this->name,
            'email' => $this->email,
        ]);
    }

    public function hasCompletedApplicantProfile(): bool
    {
        return $this->applicantProfile?->is_complete ?? false;
    }

    public function getHasCompletedApplicantProfileAttribute(): bool
    {
        return $this->hasCompletedApplicantProfile();
    }

    public function needsApplicantProfileCompletion(): bool
    {
        return $this->role === self::ROLES['pelamar'] && ! $this->hasCompletedApplicantProfile();
    }

    public function getNeedsApplicantProfileAttribute(): bool
    {
        return $this->needsApplicantProfileCompletion();
    }

    // Relation to applications
    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

}
