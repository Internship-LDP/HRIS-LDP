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

        // Prepare interview details
        $upcomingInterview = null;
        if ($latestApplication && $latestApplication->interview_date) {
            $upcomingInterview = [
                'position'    => $latestApplication->position ?? '-',
                'date'        => optional($latestApplication->interview_date)->format('d M Y'),
                'time'        => $latestApplication->interview_time ?? '-',
                'mode'        => $latestApplication->interview_mode ?? '-',
                'interviewer' => $latestApplication->interviewer_name ?? '-',
                'link'        => $latestApplication->meeting_link ?? null,
                'notes'       => $latestApplication->interview_notes,
            ];
        }

        // Determine current status index
        $statusIndex = $latestApplication
            ? array_search($latestApplication->status, $statusOrder, true)
            : null;

        if ($statusIndex === false) {
            $statusIndex = null;
        }

        // Build status timeline
        $stages = collect($statusOrder)->map(function ($status, $index) use ($statusIndex, $latestApplication) {

            $stageStatus = 'pending';
            if ($statusIndex !== null) {
                if ($index < $statusIndex) {
                    $stageStatus = 'completed';
                } elseif ($index === $statusIndex) {
                    $stageStatus = 'current';
                }
            }

            // Map timestamps per status
            $date = match ($status) {
                'Applied'   => $latestApplication?->submitted_at,
                'Screening' => $latestApplication?->screening_at,
                'Interview' => $latestApplication?->interview_at,
                'Hired'     => $latestApplication?->hired_at,
                'Rejected'  => $latestApplication?->rejected_at,
                default     => null
            };

            return [
                'name' => $status,
                'status' => $stageStatus,
                'date' => $stageStatus === 'pending'
                    ? '-'
                    : optional($date)->format('d M Y') ?? '-',
            ];
        })->all();

        if ($latestApplication === null) {
            $stages = [];
        }

        // Progress bar (100% if Hired or Rejected)
        $progress = match ($latestApplication?->status) {
            'Hired', 'Rejected' => 100,
            default => ($statusIndex !== null && count($statusOrder) > 1)
                ? (int) round(($statusIndex / (count($statusOrder) - 1)) * 100)
                : 0,
        };

        // Documents listing
        $documents = $applications
            ->filter(fn ($application) => filled($application->cv_file))
            ->map(function ($application) {
                return [
                    'name' => $application->cv_file ?? 'CV',
                    'status' => $application->status === 'Hired' ? 'approved' : 'pending',
                    'date' => optional($application->submitted_at)->format('d M Y') ?? '-',
                ];
            })->values()->all();

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
            'upcomingInterview' => $upcomingInterview,
        ]);
    }
}
