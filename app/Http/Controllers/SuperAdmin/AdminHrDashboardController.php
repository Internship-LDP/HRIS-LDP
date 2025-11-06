<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\StaffTermination;
use App\Models\Surat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class AdminHrDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        abort_unless(
            $user
            && (
                $user->role === User::ROLES['super_admin']
                || $user->isHumanCapitalAdmin()
            ),
            403
        );

        $now = Carbon::now();
        $currentMonthStart = $now->copy()->startOfMonth();
        $previousMonthStart = $currentMonthStart->copy()->subMonth();
        $previousMonthEnd = $currentMonthStart->copy()->subDay();

        $activeEmployees = User::where('status', 'Active')->count();
        $activeChange = $this->monthDelta(
            fn ($start, $end) => User::where('status', 'Active')
                ->whereBetween('created_at', [$start, $end])
                ->count(),
            $currentMonthStart,
            $now,
            $previousMonthStart,
            $previousMonthEnd
        );

        $openTerminationsQuery = StaffTermination::query()->whereIn('status', ['Diajukan', 'Proses']);
        $positionsOpen = $openTerminationsQuery->count();
        $positionsChange = $this->monthDelta(
            fn ($start, $end) => StaffTermination::whereIn('status', ['Diajukan', 'Proses'])
                ->whereBetween('request_date', [$start, $end])
                ->count(),
            $currentMonthStart,
            $now,
            $previousMonthStart,
            $previousMonthEnd
        );

        $newApplicants = Application::whereBetween('submitted_at', [$currentMonthStart, $now])->count();
        $newApplicantsChange = $this->monthDelta(
            fn ($start, $end) => Application::whereBetween('submitted_at', [$start, $end])->count(),
            $currentMonthStart,
            $now,
            $previousMonthStart,
            $previousMonthEnd
        );

        $incomingLetters = Surat::where('tipe_surat', 'masuk')
            ->whereBetween('tanggal_surat', [$currentMonthStart, $now])
            ->count();
        $lettersChange = $this->monthDelta(
            fn ($start, $end) => Surat::where('tipe_surat', 'masuk')
                ->whereBetween('tanggal_surat', [$start, $end])
                ->count(),
            $currentMonthStart,
            $now,
            $previousMonthStart,
            $previousMonthEnd
        );

        $activeComplaints = StaffTermination::where('type', 'PHK')
            ->whereIn('status', ['Diajukan', 'Proses'])
            ->count();
        $complaintsChange = $this->monthDelta(
            fn ($start, $end) => StaffTermination::where('type', 'PHK')
                ->whereIn('status', ['Diajukan', 'Proses'])
                ->whereBetween('request_date', [$start, $end])
                ->count(),
            $currentMonthStart,
            $now,
            $previousMonthStart,
            $previousMonthEnd
        );

        $stats = [
            $this->statCard('Karyawan Aktif', 'users', $activeEmployees, $activeChange),
            $this->statCard('Posisi Kosong', 'briefcase', $positionsOpen, $positionsChange),
            $this->statCard('Pelamar Baru', 'userPlus', $newApplicants, $newApplicantsChange),
            $this->statCard('Surat Masuk', 'mail', $incomingLetters, $lettersChange),
            $this->statCard('Keluhan Aktif', 'alert', $activeComplaints, $complaintsChange),
        ];

        $recruitmentData = collect(range(0, 5))->map(function ($index) use ($now) {
            $monthStart = $now->copy()->subMonths(5 - $index)->startOfMonth();
            $monthEnd = $monthStart->copy()->endOfMonth();

            $applied = Application::whereBetween('submitted_at', [$monthStart, $monthEnd])->count();
            $hired = Application::where('status', 'Hired')
                ->whereBetween('submitted_at', [$monthStart, $monthEnd])
                ->count();

            return [
                'month' => $monthStart->format('M'),
                'applied' => $applied,
                'hired' => $hired,
            ];
        });

        $turnoverData = [
            ['name' => 'Aktif', 'value' => $activeEmployees, 'color' => '#1e3a8a'],
            [
                'name' => 'Resign',
                'value' => StaffTermination::where('type', 'Resign')->where('status', 'Selesai')->count(),
                'color' => '#f59e0b',
            ],
            [
                'name' => 'PHK',
                'value' => StaffTermination::where('type', 'PHK')->where('status', 'Selesai')->count(),
                'color' => '#ef4444',
            ],
        ];

        $recentActivities = $this->recentActivities();

        $upcomingInterviews = Application::where('status', 'Interview')
            ->orderByDesc('submitted_at')
            ->take(5)
            ->get()
            ->map(function (Application $application) {
                $datetime = $application->submitted_at ?? $application->created_at;

                return [
                    'name' => $application->full_name,
                    'position' => $application->position ?? '-',
                    'time' => optional($datetime)->format('H:i') ?? '-',
                    'date' => optional($datetime)->format('d M Y') ?? '-',
                ];
            });

        return Inertia::render('SuperAdmin/AdminHR/Dashboard', [
            'stats' => $stats,
            'recruitmentData' => $recruitmentData,
            'turnoverData' => $turnoverData,
            'recentActivities' => $recentActivities,
            'upcomingInterviews' => $upcomingInterviews,
        ]);
    }

    private function statCard(string $label, string $icon, int $value, int $change): array
    {
        return [
            'label' => $label,
            'icon' => $icon,
            'value' => $value,
            'change' => $change,
            'trend' => $change >= 0 ? 'up' : 'down',
        ];
    }

    private function monthDelta(callable $callback, Carbon $currentStart, Carbon $now, Carbon $prevStart, Carbon $prevEnd): int
    {
        $current = $callback($currentStart, $now);
        $previous = $callback($prevStart, $prevEnd);

        return $current - $previous;
    }

    private function recentActivities(): Collection
    {
        $activities = collect();

        $activities = $activities->concat(
            Application::latest('submitted_at')
                ->take(5)
                ->get()
                ->map(function (Application $application) {
                    $timestamp = ($application->submitted_at ?? $application->created_at)?->timestamp ?? now()->timestamp;

                    return [
                        'title' => $application->status === 'Interview' ? 'Interview terjadwal' : 'Pelamar baru',
                        'desc' => "{$application->full_name} - {$application->position}",
                        'time' => optional($application->submitted_at ?? $application->created_at)->format('d M H:i'),
                        'type' => $application->status === 'Interview' ? 'interview' : 'applicant',
                        'timestamp' => $timestamp,
                    ];
                })
        );

        $activities = $activities->concat(
            Surat::latest('tanggal_surat')
                ->take(5)
                ->get()
                ->map(function (Surat $surat) {
                    return [
                        'title' => 'Surat masuk',
                        'desc' => $surat->perihal ?? 'Surat baru',
                        'time' => optional($surat->tanggal_surat)->format('d M Y') ?? '-',
                        'type' => 'mail',
                        'timestamp' => optional($surat->tanggal_surat)->timestamp ?? now()->timestamp,
                    ];
                })
        );

        $activities = $activities->concat(
            StaffTermination::latest('updated_at')
                ->take(5)
                ->get()
                ->map(function (StaffTermination $termination) {
                    return [
                        'title' => $termination->type === 'PHK' ? 'Keluhan aktif' : 'Offboarding',
                        'desc' => "{$termination->employee_name} - {$termination->type}",
                        'time' => optional($termination->updated_at)->diffForHumans() ?? '-',
                        'type' => $termination->type === 'PHK' ? 'complaint' : 'termination',
                        'timestamp' => optional($termination->updated_at)->timestamp ?? now()->timestamp,
                    ];
                })
        );

        return $activities
            ->sortByDesc('timestamp')
            ->take(5)
            ->map(fn ($activity) => collect($activity)->except('timestamp')->toArray())
            ->values();
    }
}
