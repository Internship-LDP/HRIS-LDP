<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecruitmentController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $this->ensureAuthorized($request->user());

        $applicationCollection = Application::latest('submitted_at')->get();

        $applications = $applicationCollection
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

        $interviews = $applicationCollection
            ->where('status', 'Interview')
            ->map(function (Application $application) {
                return [
                    'candidate' => $application->full_name,
                    'position' => $application->position,
                    'date' => optional($application->submitted_at)->format('d M Y') ?? '-',
                    'time' => optional($application->submitted_at)->format('H:i') ?? '09:00',
                    'mode' => 'Online',
                    'interviewer' => 'Tim HR',
                ];
            })
            ->values();

        $onboarding = $applicationCollection
            ->where('status', 'Hired')
            ->map(function (Application $application) {
                return [
                    'name' => $application->full_name,
                    'position' => $application->position ?? '-',
                    'startedAt' => optional($application->submitted_at)->format('d M Y') ?? '-',
                    'status' => 'In Progress',
                    'steps' => [
                        ['label' => 'Kontrak ditandatangani', 'complete' => false],
                        ['label' => 'Serah terima inventaris', 'complete' => false, 'pending' => true],
                        ['label' => 'Training & orientasi', 'complete' => false, 'pending' => true],
                    ],
                ];
            })
            ->values();

        return Inertia::render('SuperAdmin/KelolaRekrutmen/Index', [
            'applications' => $applications,
            'statusOptions' => Application::STATUSES,
            'interviews' => $interviews,
            'onboarding' => $onboarding,
        ]);
    }

    public function destroy(Request $request, Application $application): RedirectResponse
    {
        $this->ensureAuthorized($request->user());

        $application->delete();

        return redirect()
            ->route('super-admin.recruitment')
            ->with('success', 'Lamaran berhasil dihapus.');
    }

    private function ensureAuthorized(?User $user): void
    {
        abort_unless(
            $user
            && (
                $user->role === User::ROLES['super_admin']
                || $user->isHumanCapitalAdmin()
            ),
            403
        );
    }
}
