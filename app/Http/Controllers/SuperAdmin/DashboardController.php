<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
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
            'totalUsers' => $countRegisteredInRange(null, $currentMonthStart, $now) - $countRegisteredInRange(null, $previousMonthStart, $previousMonthEnd),
            'superAdmins' => $countRegisteredInRange(User::ROLES['super_admin'], $currentMonthStart, $now) - $countRegisteredInRange(User::ROLES['super_admin'], $previousMonthStart, $previousMonthEnd),
            'admins' => $countRegisteredInRange(User::ROLES['admin'], $currentMonthStart, $now) - $countRegisteredInRange(User::ROLES['admin'], $previousMonthStart, $previousMonthEnd),
            'staff' => $countRegisteredInRange(User::ROLES['staff'], $currentMonthStart, $now) - $countRegisteredInRange(User::ROLES['staff'], $previousMonthStart, $previousMonthEnd),
            'pelamar' => $countRegisteredInRange(User::ROLES['pelamar'], $currentMonthStart, $now) - $countRegisteredInRange(User::ROLES['pelamar'], $previousMonthStart, $previousMonthEnd),
        ];

        $userDistribution = collect(User::ROLES)
            ->values()
            ->map(function ($role) use ($roleCounts) {
                return [
                    'name' => $role,
                    'value' => $roleCounts[$role] ?? 0,
                    'color' => match ($role) {
                        User::ROLES['super_admin'] => '#7c3aed',
                        User::ROLES['admin'] => '#3b82f6',
                        User::ROLES['staff'] => '#10b981',
                        User::ROLES['karyawan'] => '#f59e0b',
                        default => '#ef4444',
                    },
                ];
            })
            ->values();

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
        ]);
    }
}
