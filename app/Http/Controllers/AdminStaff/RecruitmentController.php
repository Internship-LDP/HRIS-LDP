<?php

namespace App\Http\Controllers\AdminStaff;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecruitmentController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        abort_unless($this->authorized($user), 403);

        $applications = Application::query()
            ->latest('submitted_at')
            ->limit(20)
            ->get()
            ->map(fn (Application $application) => [
                'id' => $application->id,
                'name' => $application->full_name,
                'position' => $application->position ?? '-',
                'status' => $application->status,
                'submittedAt' => optional($application->submitted_at)->format('d M Y') ?? '-',
                'email' => $application->email,
                'phone' => $application->phone,
            ]);

        $statusBreakdown = collect(Application::STATUSES)
            ->map(fn ($status) => [
                'status' => $status,
                'count' => Application::where('status', $status)->count(),
            ])
            ->values();

        return Inertia::render('AdminStaff/Recruitment', [
            'applications' => $applications,
            'statusBreakdown' => $statusBreakdown,
        ]);
    }

    private function authorized(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasRole(User::ROLES['admin'])
            && ! $user->belongsToHumanCapitalDivision();
    }
}
