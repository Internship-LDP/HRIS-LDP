<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    public const ROLES = [
        'super_admin' => 'Super Admin',
        'admin' => 'Admin',
        'staff' => 'Staff',
        'karyawan' => 'Karyawan',
        'external_sender' => 'External Sender',
    ];

    public const DIVISIONS = [
        'Human Resources',
        'Finance',
        'IT & Technology',
        'Marketing',
        'Operations',
    ];

    public const STATUSES = [
        'Active',
        'Inactive',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'employee_code',
        'name',
        'email',
        'role',
        'division',
        'status',
        'registered_at',
        'last_login_at',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'registered_at' => 'date',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Generate a readable employee code.
     */
    public static function generateEmployeeCode(string $role): string
    {
        $prefix = match ($role) {
            self::ROLES['super_admin'] => 'SA',
            self::ROLES['admin'] => 'ADM',
            self::ROLES['staff'] => 'STF',
            self::ROLES['external_sender'] => 'EXT',
            default => 'EMP',
        };

        $increment = static::where('role', $role)->count() + 1;

        return sprintf('%s%03d', $prefix, $increment);
    }
}
