<?php

namespace App\Http\Controllers\Pelamar;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\DivisionProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
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

        $existingApplication = Application::where('user_id', $user->id)
            ->where('division', $division->name)
            ->where('position', $division->job_title)
            ->exists();

        if ($existingApplication) {
            throw ValidationException::withMessages([
                'division_id' => 'Anda sudah melamar untuk posisi ini.',
            ]);
        }

        $cvPath = $request->file('cv')?->store('applications/cv', 'public');

        Application::create([
            'user_id' => $user->id,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
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

    /**
     * Check if applicant meets eligibility criteria for a job posting.
     */
    public function checkEligibility(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user && $user->role === User::ROLES['pelamar'], 403);

        $validated = $request->validate([
            'division_id' => ['required', 'exists:division_profiles,id'],
        ]);

        $division = DivisionProfile::findOrFail($validated['division_id']);
        $criteria = $division->job_eligibility_criteria;

        // No criteria set - allow all
        if (empty($criteria)) {
            return response()->json([
                'eligible' => true,
                'failures' => [],
                'passed' => [],
            ]);
        }

        $profile = $user->ensureApplicantProfile();
        $failures = [];
        $passed = [];

        // Check age
        if (! empty($criteria['min_age']) || ! empty($criteria['max_age'])) {
            $age = $this->calculateAge($profile->date_of_birth);
            $ageRequirement = $this->formatAgeRequirement($criteria);
            
            if ($age === null) {
                $failures[] = [
                    'field' => 'umur',
                    'message' => 'Tanggal lahir Anda belum diisi di profil.',
                ];
            } else {
                $ageFailed = false;
                if (! empty($criteria['min_age']) && $age < $criteria['min_age']) {
                    $failures[] = [
                        'field' => 'umur',
                        'message' => "Umur Anda ({$age} tahun) tidak memenuhi kriteria minimal {$criteria['min_age']} tahun.",
                    ];
                    $ageFailed = true;
                }
                if (! empty($criteria['max_age']) && $age > $criteria['max_age']) {
                    $failures[] = [
                        'field' => 'umur',
                        'message' => "Umur Anda ({$age} tahun) tidak memenuhi kriteria maksimal {$criteria['max_age']} tahun.",
                    ];
                    $ageFailed = true;
                }
                if (! $ageFailed) {
                    $passed[] = [
                        'field' => 'umur',
                        'message' => "Umur Anda ({$age} tahun) memenuhi kriteria ({$ageRequirement}).",
                    ];
                }
            }
        }

        // Check gender
        if (! empty($criteria['gender']) && $criteria['gender'] !== 'any') {
            if (empty($profile->gender)) {
                $failures[] = [
                    'field' => 'jenis_kelamin',
                    'message' => 'Jenis kelamin Anda belum diisi di profil.',
                ];
            } elseif ($profile->gender !== $criteria['gender']) {
                $failures[] = [
                    'field' => 'jenis_kelamin',
                    'message' => "Lowongan ini hanya untuk {$criteria['gender']}.",
                ];
            } else {
                $passed[] = [
                    'field' => 'jenis_kelamin',
                    'message' => "Jenis kelamin Anda ({$profile->gender}) sesuai dengan kriteria.",
                ];
            }
        }

        // Check education level
        if (! empty($criteria['min_education'])) {
            $applicantEducation = $this->getHighestEducationLevel($profile->educations ?? []);
            $requiredLevel = $this->educationLevelRank($criteria['min_education']);
            $applicantLevel = $this->educationLevelRank($applicantEducation);

            if ($applicantEducation === null) {
                $failures[] = [
                    'field' => 'pendidikan',
                    'message' => 'Data pendidikan Anda belum diisi di profil.',
                ];
            } elseif ($applicantLevel < $requiredLevel) {
                $failures[] = [
                    'field' => 'pendidikan',
                    'message' => "Tingkat pendidikan Anda ({$applicantEducation}) tidak memenuhi kriteria minimal {$criteria['min_education']}.",
                ];
            } else {
                $passed[] = [
                    'field' => 'pendidikan',
                    'message' => "Tingkat pendidikan Anda ({$applicantEducation}) memenuhi kriteria minimal {$criteria['min_education']}.",
                ];
            }
        }

        // Check experience years
        if (! empty($criteria['min_experience_years'])) {
            $totalExperience = $this->calculateTotalExperienceYears($profile->experiences ?? []);

            if ($totalExperience < $criteria['min_experience_years']) {
                $failures[] = [
                    'field' => 'pengalaman',
                    'message' => "Pengalaman kerja Anda ({$totalExperience} tahun) tidak memenuhi kriteria minimal {$criteria['min_experience_years']} tahun.",
                ];
            } else {
                $passed[] = [
                    'field' => 'pengalaman',
                    'message' => "Pengalaman kerja Anda ({$totalExperience} tahun) memenuhi kriteria minimal {$criteria['min_experience_years']} tahun.",
                ];
            }
        }

        return response()->json([
            'eligible' => empty($failures),
            'failures' => $failures,
            'passed' => $passed,
        ]);
    }

    private function formatAgeRequirement(array $criteria): string
    {
        $minAge = $criteria['min_age'] ?? null;
        $maxAge = $criteria['max_age'] ?? null;

        if ($minAge && $maxAge) {
            return "{$minAge}-{$maxAge} tahun";
        } elseif ($minAge) {
            return "minimal {$minAge} tahun";
        } elseif ($maxAge) {
            return "maksimal {$maxAge} tahun";
        }

        return '';
    }

    private function calculateAge(?Carbon $dateOfBirth): ?int
    {
        if (! $dateOfBirth) {
            return null;
        }

        return $dateOfBirth->age;
    }

    private function getHighestEducationLevel(array $educations): ?string
    {
        if (empty($educations)) {
            return null;
        }

        $highestRank = -1;
        $highestDegree = null;

        foreach ($educations as $education) {
            $degree = $education['degree'] ?? null;
            if ($degree) {
                $rank = $this->educationLevelRank($degree);
                if ($rank > $highestRank) {
                    $highestRank = $rank;
                    $highestDegree = $degree;
                }
            }
        }

        return $highestDegree;
    }

    private function educationLevelRank(?string $level): int
    {
        $ranks = [
            'SMA' => 1,
            'SMK' => 1,
            'D1' => 2,
            'D2' => 3,
            'D3' => 4,
            'D4' => 5,
            'S1' => 5,
            'S2' => 6,
            'S3' => 7,
        ];

        return $ranks[strtoupper($level ?? '')] ?? 0;
    }

    private function calculateTotalExperienceYears(array $experiences): float
    {
        $totalMonths = 0;

        foreach ($experiences as $experience) {
            $startYear = (int) ($experience['start_year'] ?? 0);
            $endYear = (int) ($experience['end_year'] ?? date('Y'));
            $isCurrentJob = $experience['is_current'] ?? false;

            if ($isCurrentJob) {
                $endYear = (int) date('Y');
            }

            if ($startYear > 0) {
                $totalMonths += max(($endYear - $startYear) * 12, 0);
            }
        }

        return round($totalMonths / 12, 1);
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
                'job_eligibility_criteria' => $profile->job_eligibility_criteria,
            ];
        })->filter(function ($summary) {
            return $summary['is_hiring'];
        })->values();
    }
}
