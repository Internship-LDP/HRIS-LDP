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

        if (!$latestApplication) {
            return Inertia::render('Pelamar/Dashboard', [
                'applicationStatus' => ['progress' => 0, 'stages' => []],
                'applications' => [],
                'stats' => ['totalApplications' => 0, 'latestStatus' => null],
                'upcomingInterview' => null,
            ]);
        }

        // Interview
        $upcomingInterview = $latestApplication->interview_date ? [
            'position'    => $latestApplication->position ?? '-',
            'date'        => optional($latestApplication->interview_date)->format('d M Y'),
            'time'        => $latestApplication->interview_time ?? '-',
            'mode'        => $latestApplication->interview_mode ?? '-',
            'interviewer' => $latestApplication->interviewer_name ?? '-',
            'link'        => $latestApplication->meeting_link ?? null,
            'notes'       => $latestApplication->interview_notes,
        ] : null;

        // Status index
        $statusIndex = array_search($latestApplication->status, $statusOrder, true);

        // Build stages
        $stages = [];
        $fallbackDate = $latestApplication->updated_at ?? $latestApplication->submitted_at;

        foreach ($statusOrder as $index => $status) {

            //
            if ($latestApplication->status === 'Rejected') {

                $completed = array_filter($stages, fn($s) =>
                    $s['status'] === 'completed'
                );

                // Hindari pembagian dengan nol
                $totalStages = max(count($stages) - 1, 1);

                $progress = round(count($completed) / $totalStages * 100);
            }



            $stageStatus = 'pending';
            if ($statusIndex !== false) {
                if ($index < $statusIndex) {
                    $stageStatus = 'completed';
                } elseif ($index === $statusIndex) {
                    $stageStatus = 'current';
                }
            }

            $date = match ($status) {
                'Applied'   => $latestApplication->submitted_at,
                'Screening' => $latestApplication->screening_at ?? $fallbackDate,
                'Interview' => $latestApplication->interview_date
                    ?? $latestApplication->interview_at
                    ?? $fallbackDate,
                'Rejected'  => $latestApplication->rejected_at ?? $fallbackDate,
                'Hired'     => $latestApplication->hired_at ?? $fallbackDate,
                default     => null,
            };

            $stages[] = [
                'name' => $status,
                'status' => $stageStatus,
                'date' => $stageStatus === 'pending'
                    ? '-'
                    : optional($date ?? $fallbackDate)->format('d M Y') ?? '-',
            ];
        }

        // Progress
        if ($latestApplication->status === 'Hired') {
            $progress = 100;
        } elseif ($statusIndex !== false && count($statusOrder) > 1) {
            $progress = round($statusIndex / (count($statusOrder) - 1) * 100);
        } else {
            $progress = 0;
        }

        // Applications render
        $applicationsData = $applications
            ->map(fn ($app) => [
                'id' => $app->id,
                'position' => $app->position,
                'division' => $app->division,
                'status' => $app->status,
                'submitted_at' => optional($app->submitted_at)->format('d M Y') ?? '-',
                'full_name' => $app->full_name,
                'email' => $app->email,
                'phone' => $app->phone,
                'education' => $app->education,
                'experience' => $app->experience,
                'skills' => $app->skills,
                'cv_file' => $app->cv_file,
                'notes' => $app->notes,
                'rejection_reason' => $app->rejection_reason,
            ])
            ->all();

        return Inertia::render('Pelamar/Dashboard', [
            'applicationStatus' => [
                'progress' => $progress,
                'stages' => $stages
            ],
            'applications' => $applicationsData,
            'stats' => [
                'totalApplications' => $applications->count(),
                'latestStatus' => $latestApplication->status,
                'rejectionReason' => $latestApplication->rejection_reason,
            ],
            'upcomingInterview' => $upcomingInterview,
        ]);
    }
}
