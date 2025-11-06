<?php

namespace App\Http\Controllers\SuperAdmin;

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
        abort_unless($user && $user->role === User::ROLES['super_admin'], 403);

        $applications = Application::latest('submitted_at')
            ->get()
            ->map(function (Application $application) {
                return [
                    'id' => $application->id,
                    'name' => $application->full_name,
                    'position' => $application->position,
                    'education' => $application->education,
                    'experience' => $application->experience,
                    'status' => $application->status,
                    'date' => optional($application->submitted_at)->format('d M Y'),
                    'email' => $application->email,
                    'phone' => $application->phone,
                    'skills' => $application->skills,
                ];
            });

        return Inertia::render('SuperAdmin/Rekrutmen/Index', [
            'applications' => $applications,
            'statusOptions' => Application::STATUSES,
        ]);
    }
}
