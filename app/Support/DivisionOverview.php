<?php

namespace App\Support;

use App\Models\DivisionProfile;
use App\Models\User;
use Illuminate\Support\Collection;

class DivisionOverview
{
    /**
     * Build division data and aggregated stats.
     *
     * @return array{divisions: \Illuminate\Support\Collection<int, array>, stats: array<string, int>}
     */
    public static function build(): array
    {
        $profiles = self::ensureDivisionProfiles();

        $divisions = $profiles->map(function (DivisionProfile $profile) {
            $staff = self::staffForDivision($profile->name);
            $currentStaff = $staff->count();

            if ($profile->capacity < $currentStaff) {
                $profile->forceFill(['capacity' => $currentStaff])->save();
            }

            $availableSlots = max(($profile->capacity ?? 0) - $currentStaff, 0);

            return [
                'id' => $profile->id,
                'name' => $profile->name,
                'description' => $profile->description,
                'manager_name' => $profile->manager_name,
                'capacity' => $profile->capacity,
                'current_staff' => $currentStaff,
                'available_slots' => $availableSlots,
                'is_hiring' => (bool) $profile->is_hiring,
                'job_title' => $profile->job_title,
                'job_description' => $profile->job_description,
                'job_requirements' => $profile->job_requirements ?? [],
                'staff' => $staff,
            ];
        })->values();

        $stats = [
            'total_divisions' => $divisions->count(),
            'total_staff' => (int) $divisions->sum('current_staff'),
            'active_vacancies' => $divisions->where('is_hiring', true)->count(),
            'available_slots' => (int) $divisions->sum(fn ($division) => $division['available_slots']),
        ];

        return [
            'divisions' => $divisions,
            'stats' => $stats,
        ];
    }

    /**
     * Retrieve staff info for a division.
     */
    public static function staffForDivision(string $division): Collection
    {
        return User::query()
            ->where('division', $division)
            ->whereIn('role', [
                User::ROLES['admin'],
                User::ROLES['staff'],
            ])
            ->orderBy('name')
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'position' => $user->role,
                    'join_date' => optional($user->registered_at ?? $user->created_at)->format('Y-m-d'),
                ];
            });
    }

    /**
     * Ensure each configured division has a profile row.
     *
     * @return \Illuminate\Support\Collection<int, \App\Models\DivisionProfile>
     */
    private static function ensureDivisionProfiles(): Collection
    {
        return collect(User::DIVISIONS)
            ->map(function (string $name) {
                return DivisionProfile::firstOrCreate(['name' => $name]);
            });
    }
}
