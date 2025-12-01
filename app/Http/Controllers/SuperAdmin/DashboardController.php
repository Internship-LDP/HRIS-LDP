<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\StaffProfile;
use App\Models\User;
use App\Models\DivisionProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $roleCounts = User::query()
            ->select('role')
            ->selectRaw('count(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role')
            ->all();

        $now = now();
        $currentMonthStart = $now->copy()->startOfMonth();
        $previousMonthStart = $now->copy()->subMonth()->startOfMonth();
        $previousMonthEnd = $now->copy()->subMonth()->endOfMonth();
        $registrationDate = DB::raw('COALESCE(registered_at, created_at)');

        $countRegisteredInRange = function (?string $role, Carbon $start, Carbon $end) use ($registrationDate) {
            return User::query()
                ->when($role, fn ($query) => $query->where('role', $role))
                ->whereBetween($registrationDate, [$start, $end])
                ->count();
        };

        $stats = [
            'totalUsers' => array_sum($roleCounts),
            'superAdmins' => $roleCounts[User::ROLES['super_admin']] ?? 0,
            'admins' => $roleCounts[User::ROLES['admin']] ?? 0,
            'staff' => $roleCounts[User::ROLES['staff']] ?? 0,
            'pelamar' => $roleCounts[User::ROLES['pelamar']] ?? 0,
        ];

        $statChanges = [
            'totalUsers' => $countRegisteredInRange(null, $currentMonthStart, $now),
            'superAdmins' => $countRegisteredInRange(User::ROLES['super_admin'], $currentMonthStart, $now),
            'admins' => $countRegisteredInRange(User::ROLES['admin'], $currentMonthStart, $now),
            'staff' => $countRegisteredInRange(User::ROLES['staff'], $currentMonthStart, $now),
            'pelamar' => $countRegisteredInRange(User::ROLES['pelamar'], $currentMonthStart, $now),
        ];

        $distributionRoles = [
            User::ROLES['super_admin'] => '#7c3aed',
            User::ROLES['admin'] => '#3b82f6',
            User::ROLES['staff'] => '#10b981',
            User::ROLES['pelamar'] => '#f97316',
        ];

        $userDistribution = collect($distributionRoles)
            ->map(function (string $color, string $role) use ($roleCounts) {
                return [
                    'name' => $role,
                    'value' => $roleCounts[$role] ?? 0,
                    'color' => $color,
                ];
            })
            ->values();

        $staffBaseQuery = User::query()->where('role', User::ROLES['staff']);

        $staffStats = [
            'total' => (clone $staffBaseQuery)->count(),
            'active' => (clone $staffBaseQuery)->where('status', 'Active')->count(),
            'inactive' => (clone $staffBaseQuery)->where('status', 'Inactive')->count(),
        ];

        $profileBaseQuery = StaffProfile::query()->whereHas(
            'user',
            fn ($query) => $query->where('role', User::ROLES['staff'])
        );

        $profileCounts = static function (string $column) use ($profileBaseQuery): array {
            return (clone $profileBaseQuery)
                ->select($column)
                ->selectRaw('count(*) as total')
                ->groupBy($column)
                ->pluck('total', $column)
                ->all();
        };

        $religionCounts = $profileCounts('religion');
        $genderCounts = $profileCounts('gender');
        $educationCounts = $profileCounts('education_level');

        $divisionApplicants = Application::query()
            ->select('division')
            ->selectRaw('count(*) as total')
            ->groupBy('division')
            ->orderBy('division')
            ->get()
            ->map(function ($row) {
                $divisionName = $row->division ?? 'Tidak ada divisi';
                return [
                    'id' => md5($divisionName),
                    'name' => $divisionName,
                    'count' => (int) $row->total,
                    'new' => (int) Application::where('division', $row->division)
                        ->whereBetween('submitted_at', [now()->startOfMonth(), now()])
                        ->count(),
                ];
            })
            ->values();

        $religionColors = [
            '#0ea5e9',
            '#6366f1',
            '#f97316',
            '#22c55e',
            '#eab308',
            '#ec4899',
            '#14b8a6',
        ];

        $religionData = collect(StaffProfile::RELIGIONS)
            ->map(function (string $religion, int $index) use ($religionCounts, $religionColors) {
                return [
                    'name' => $religion,
                    'value' => $religionCounts[$religion] ?? 0,
                    'color' => $religionColors[$index % count($religionColors)],
                ];
            })
            ->values()
            ->all();

        if (array_key_exists(null, $religionCounts) && $religionCounts[null] > 0) {
            $religionData[] = [
                'name' => 'Belum Diisi',
                'value' => $religionCounts[null],
                'color' => '#94a3b8',
            ];
        }

        $genderColors = ['#2563eb', '#f97316'];
        $totalStaff = max($staffStats['total'], 1);

        $genderData = collect(StaffProfile::GENDERS)
            ->map(function (string $gender, int $index) use ($genderCounts, $genderColors, $totalStaff) {
                $value = $genderCounts[$gender] ?? 0;

                return [
                    'name' => $gender,
                    'value' => $value,
                    'percentage' => round(($value / $totalStaff) * 100),
                    'color' => $genderColors[$index % count($genderColors)],
                ];
            })
            ->values()
            ->all();

        if (array_key_exists(null, $genderCounts) && $genderCounts[null] > 0) {
            $genderData[] = [
                'name' => 'Belum Diisi',
                'value' => $genderCounts[null],
                'percentage' => round(($genderCounts[null] / $totalStaff) * 100),
                'color' => '#94a3b8',
            ];
        }

        $educationData = collect(StaffProfile::EDUCATION_LEVELS)
            ->map(function (string $level) use ($educationCounts) {
                return [
                    'level' => $level,
                    'value' => $educationCounts[$level] ?? 0,
                ];
            })
            ->values()
            ->all();

        if (array_key_exists(null, $educationCounts) && $educationCounts[null] > 0) {
            $educationData[] = [
                'level' => 'Belum Diisi',
                'value' => $educationCounts[null],
            ];
        }

        $activityData = collect(range(0, 5))
            ->map(function ($index) use ($registrationDate) {
                $monthStart = now()->copy()->subMonths(5 - $index)->startOfMonth();
                $monthEnd = $monthStart->copy()->endOfMonth();

                $registrations = User::query()
                    ->whereBetween($registrationDate, [$monthStart, $monthEnd])
                    ->count();

                $applications = Application::query()
                    ->whereBetween(DB::raw('COALESCE(submitted_at, created_at)'), [$monthStart, $monthEnd])
                    ->count();

                return [
                    'month' => $monthStart->format('M'),
                    'registrations' => $registrations,
                    'applications' => $applications,
                ];
            })
            ->values();

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => $stats,
            'statChanges' => $statChanges,
            'userDistribution' => $userDistribution,
            'activityData' => $activityData,
            'staffStats' => $staffStats,
            'religionData' => $religionData,
            'genderData' => $genderData,
            'educationData' => $educationData,
            'divisionApplicants' => $divisionApplicants,
        ]);
    }
}
