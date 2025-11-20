<?php

namespace App\Http\Controllers\Pelamar;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\DivisionProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->role === User::ROLES['pelamar'], 403);

        if ($user->needsApplicantProfileCompletion()) {
            return redirect()
                ->route('pelamar.profile')
                ->with('profile_reminder', 'Lengkapi data pribadi dan pendidikan Anda sebelum mengakses halaman lamaran.');
        }

        $profile = $user->ensureApplicantProfile();

        $applications = Application::where('user_id', $user->id)
            ->latest('submitted_at')
            ->get()
            ->map(function (Application $application) {
                return [
                    'id' => $application->id,
                    'position' => $application->position,
                    'division' => $application->division,
                    'status' => $application->status,
                    'submitted_at' => optional($application->submitted_at)->format('d M Y'),
                    'notes' => $application->notes,
                ];
            });

        return Inertia::render('Pelamar/Applications', [
            'applications' => $applications,
            'defaultForm' => [
                'full_name' => $profile->full_name ?? $user->name,
                'email' => $profile->email ?? $user->email,
                'phone' => $profile->phone ?? '',
            ],
            'divisions' => $this->divisionSummaries(),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->role === User::ROLES['pelamar'], 403);

        if ($user->needsApplicantProfileCompletion()) {
            return redirect()
                ->route('pelamar.profile')
                ->with('error', 'Lengkapi profil Anda sebelum mengirim lamaran.');
        }

        $validated = $request->validate([
            'division_id' => ['required', 'exists:division_profiles,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'education' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:255'],
            'skills' => ['nullable', 'string'],
            'cv' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ]);

        /** @var \App\Models\DivisionProfile $division */
        $division = DivisionProfile::findOrFail($validated['division_id']);

        if (! $division->is_hiring || empty($division->job_title)) {
            throw ValidationException::withMessages([
                'division_id' => 'Divisi ini tidak sedang membuka lowongan.',
            ]);
        }

        $cvPath = $request->file('cv')?->store('applications/cv', 'public');

        Application::create([
            'user_id' => $user->id,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'education' => $validated['education'] ?? null,
            'experience' => $validated['experience'] ?? null,
            'skills' => $validated['skills'] ?? null,
            'division' => $division->name,
            'position' => $division->job_title,
            'cv_file' => $cvPath,
            'status' => Application::STATUSES[0],
            'submitted_at' => now(),
        ]);

        return redirect()
            ->back()
            ->with('success', 'Lamaran Anda berhasil dikirim.');
    }

    private function divisionSummaries(): Collection
    {
        collect(User::DIVISIONS)->each(
            fn (string $name) => DivisionProfile::firstOrCreate(['name' => $name])
        );

        $profiles = DivisionProfile::orderBy('name')->get();

        return $profiles->map(function (DivisionProfile $profile) {
            $currentStaff = User::query()
                ->where('division', $profile->name)
                ->whereIn('role', [User::ROLES['admin'], User::ROLES['staff']])
                ->count();

            $availableSlots = max($profile->capacity - $currentStaff, 0);

            return [
                'id' => $profile->id,
                'name' => $profile->name,
                'description' => $profile->description,
                'manager_name' => $profile->manager_name,
                'capacity' => $profile->capacity,
                'current_staff' => $currentStaff,
                'available_slots' => $availableSlots,
                'is_hiring' => $profile->is_hiring && ! empty($profile->job_title),
                'job_title' => $profile->job_title,
                'job_description' => $profile->job_description,
                'job_requirements' => $profile->job_requirements ?? [],
            ];
        });
    }
}
