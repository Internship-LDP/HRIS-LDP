<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
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

        $stats = [
            'totalUsers' => array_sum($roleCounts),
            'admins' => $roleCounts[User::ROLES['admin']] ?? 0,
            'superAdmins' => $roleCounts[User::ROLES['super_admin']] ?? 0,
            'staff' => $roleCounts[User::ROLES['staff']] ?? 0,
            'activeSessions' => max(1, (array_sum($roleCounts) * 3)),
            'pendingIssues' => 3,
            'systemModules' => 6,
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
            ->map(function ($index) use ($stats) {
                $month = now()
                    ->subMonths(5 - $index)
                    ->format('M');
                $base = max(200, $stats['totalUsers'] * 5);

                return [
                    'month' => $month,
                    'logins' => $base + ($index * 45),
                    'actions' => ($base * 2) + ($index * 65),
                ];
            })
            ->values();

        $recentSystemActivities = [
            ['title' => 'Account created', 'desc' => '5 akun baru ditambahkan oleh Admin', 'time' => '10:30 AM', 'type' => 'success'],
            ['title' => 'System backup completed', 'desc' => 'Backup harian selesai dibuat', 'time' => '02:00 AM', 'type' => 'success'],
            ['title' => 'Security alert', 'desc' => 'Percobaan login gagal terdeteksi', 'time' => 'Yesterday', 'type' => 'warning'],
            ['title' => 'Module updated', 'desc' => 'Modul recruitment diperbarui ke v2.1', 'time' => '2 days ago', 'type' => 'info'],
        ];

        $systemHealth = [
            ['name' => 'Server', 'status' => 'Excellent', 'value' => 98],
            ['name' => 'Database', 'status' => 'Good', 'value' => 95],
            ['name' => 'API', 'status' => 'Good', 'value' => 97],
            ['name' => 'Storage', 'status' => 'Warning', 'value' => 78],
        ];

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => $stats,
            'userDistribution' => $userDistribution,
            'activityData' => $activityData,
            'recentSystemActivities' => $recentSystemActivities,
            'systemHealth' => $systemHealth,
        ]);
    }
}
