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

        // Interview
        $upcomingInterview = ($latestApplication && $latestApplication->interview_date) ? [
            'position'    => $latestApplication->position ?? '-',
            'date'        => optional($latestApplication->interview_date)->format('d M Y'),
            'time'        => $latestApplication->interview_time ?? '-',
            'mode'        => $latestApplication->interview_mode ?? '-',
            'interviewer' => $latestApplication->interviewer_name ?? '-',
            'link'        => $latestApplication->meeting_link ?? null,
            'notes'       => $latestApplication->interview_notes,
        ] : null;

        $applicationsStatus = $applications->map(function ($application) use ($statusOrder) {
            $statusIndex = array_search($application->status, $statusOrder, true);
            $stages = [];
            $fallbackDate = $application->updated_at ?? $application->submitted_at;

            foreach ($statusOrder as $index => $status) {
                $stageStatus = 'pending';
                if ($statusIndex !== false) {
                    if ($index < $statusIndex) {
                        $stageStatus = 'completed';
                    } elseif ($index === $statusIndex) {
                        $stageStatus = 'current';
                    }
                }

                $date = match ($status) {
                    'Applied'   => $application->submitted_at,
                    'Screening' => $application->screening_at ?? $fallbackDate,
                    'Interview' => $application->interview_date
                        ?? $application->interview_at
                        ?? $fallbackDate,
                    'Rejected'  => $application->rejected_at ?? $fallbackDate,
                    'Hired'     => $application->hired_at ?? $fallbackDate,
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

            // Progress Calculation
            $progress = 0;
            if ($application->status === 'Hired') {
                $progress = 100;
            } elseif ($application->status === 'Rejected') {
                // Calculate progress based on completed stages excluding 'Rejected' itself
                $completed = array_filter($stages, fn($s) => $s['status'] === 'completed');
                // Total stages excluding Rejected (assuming Rejected is last)
                $totalStages = max(count($statusOrder) - 1, 1); 
                $progress = round(count($completed) / $totalStages * 100);
            } elseif ($statusIndex !== false && count($statusOrder) > 1) {
                $progress = round($statusIndex / (count($statusOrder) - 1) * 100);
            }

            return [
                'id' => $application->id,
                'position' => $application->position,
                'division' => $application->division,
                'status' => $application->status,
                'progress' => $progress,
                'stages' => $stages,
                'rejection_reason' => $application->rejection_reason,
            ];
        });

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
            'applicationsStatus' => $applicationsStatus,
            'applications' => $applicationsData,
            'stats' => [
                'totalApplications' => $applications->count(),
                'latestStatus' => $latestApplication->status ?? null,
                'rejectionReason' => $latestApplication->rejection_reason ?? null,
            ],
            'upcomingInterview' => $upcomingInterview,
        ]);
    }
}
