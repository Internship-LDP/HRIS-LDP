<?php

namespace App\Http\Controllers\Pelamar;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user && $user->role === User::ROLES['pelamar'], 403);

        $applications = Application::where('user_id', $user->id)
            ->latest('submitted_at')
            ->get();

        $latestApplication = $applications->first();
        $statusOrder = Application::STATUSES;

        $statusIndex = $latestApplication
            ? array_search($latestApplication->status, $statusOrder, true)
            : null;
        $statusIndex = $statusIndex === false ? null : $statusIndex;

        $stages = collect($statusOrder)->map(function (string $status, int $index) use ($statusIndex, $latestApplication) {
            $stageStatus = 'pending';
            if ($statusIndex !== null) {
                if ($index < $statusIndex) {
                    $stageStatus = 'completed';
                } elseif ($index === $statusIndex) {
                    $stageStatus = 'current';
                }
            }

            return [
                'name' => $status,
                'status' => $stageStatus,
                'date' => $stageStatus === 'pending'
                    ? '-'
                    : optional($latestApplication?->submitted_at)->format('d M Y') ?? '-',
            ];
        })->all();

        if ($latestApplication === null) {
            $stages = [];
        }

        $progress = ($statusIndex !== null && count($statusOrder) > 1)
            ? (int) round(($statusIndex / (count($statusOrder) - 1)) * 100)
            : 0;

        $documents = $applications
            ->filter(fn (Application $application) => filled($application->cv_file))
            ->map(function (Application $application) {
                return [
                    'name' => $application->cv_file ?? 'CV',
                    'status' => $application->status === 'Hired' ? 'approved' : 'pending',
                    'date' => optional($application->submitted_at)->format('d M Y') ?? '-',
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Pelamar/Dashboard', [
            'applicationStatus' => [
                'progress' => $progress,
                'stages' => $stages,
            ],
            'documents' => $documents,
            'stats' => [
                'totalApplications' => $applications->count(),
                'latestStatus' => $latestApplication?->status,
            ],
            'upcomingInterview' => null,
        ]);
    }
}
