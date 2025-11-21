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

        // Jika tidak ada lamaran
        if (!$latestApplication) {
            return Inertia::render('Pelamar/Dashboard', [
                'applicationStatus' => ['progress' => 0, 'stages' => []],
                'documents' => [],
                'stats' => ['totalApplications' => 0, 'latestStatus' => null],
                'upcomingInterview' => null,
            ]);
        }

        // Prepare interview details
        $upcomingInterview = null;
        if ($latestApplication->interview_date) {
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

        // Tentukan index status
        $statusIndex = array_search($latestApplication->status, $statusOrder, true);

        // Build stages
        $stages = [];
        foreach ($statusOrder as $index => $status) {
            // Jika status Rejected, hentikan sebelum Hired
            if ($latestApplication->status === 'Rejected' && $status === 'Hired') {
                break;
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
                'Screening' => $latestApplication->screening_at,
                'Interview' => $latestApplication->interview_at,
                'Hired'     => $latestApplication->hired_at,
                'Rejected'  => $latestApplication->rejected_at,
                default     => null
            };

            $stages[] = [
                'name' => $status,
                'status' => $stageStatus,
                'date' => $stageStatus === 'pending' ? '-' : optional($date)->format('d M Y') ?? '-',
            ];
        }

        // Hitung progress
        $progress = 0;
        if ($latestApplication->status === 'Hired') {
            $progress = 100;
        } elseif ($latestApplication->status === 'Rejected') {
            // Progress sampai tahap sebelum Hired
            $completedStages = array_filter($stages, fn($s) => $s['status'] === 'completed' || $s['status'] === 'current');
            $progress = count($completedStages) / max(count($stages), 1) * 100;
        } elseif ($statusIndex !== false && count($statusOrder) > 1) {
            $progress = (int) round($statusIndex / (count($statusOrder) - 1) * 100);
        }

        // Dokumen
        $documents = $applications
            ->filter(fn ($app) => filled($app->cv_file))
            ->map(fn ($app) => [
                'name' => $app->cv_file ?? 'CV',
                'status' => $app->status === 'Hired' ? 'approved' : 'pending',
                'date' => optional($app->submitted_at)->format('d M Y') ?? '-',
            ])
            ->values()
            ->all();

        return Inertia::render('Pelamar/Dashboard', [
            'applicationStatus' => ['progress' => $progress, 'stages' => $stages],
            'documents' => $documents,
            'stats' => [
                'totalApplications' => $applications->count(),
                'latestStatus' => $latestApplication->status,
                'rejectionReason' => $latestApplication->rejection_reason,
            ],
            'upcomingInterview' => $upcomingInterview,
        ]);
    }
}
