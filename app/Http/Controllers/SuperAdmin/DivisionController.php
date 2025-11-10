<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\DivisionProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DivisionController extends Controller
{
    /**
     * Display division overview & controls.
     */
    public function index(Request $request): Response
    {
        $this->ensureAuthorized($request->user());

        $profiles = $this->ensureDivisionProfiles();

        $divisions = $profiles->map(function (DivisionProfile $profile) {
            $staff = $this->staffForDivision($profile->name);
            $currentStaff = $staff->count();

            if ($profile->capacity < $currentStaff) {
                $profile->forceFill(['capacity' => $currentStaff])->save();
            }

            $availableSlots = max($profile->capacity - $currentStaff, 0);

            return [
                'id' => $profile->id,
                'name' => $profile->name,
                'description' => $profile->description,
                'manager_name' => $profile->manager_name,
                'capacity' => $profile->capacity,
                'current_staff' => $currentStaff,
                'available_slots' => $availableSlots,
                'is_hiring' => $profile->is_hiring,
                'job_title' => $profile->job_title,
                'job_description' => $profile->job_description,
                'job_requirements' => $profile->job_requirements ?? [],
                'staff' => $staff,
            ];
        })->values();

        $stats = [
            'total_divisions' => $divisions->count(),
            'total_staff' => $divisions->sum('current_staff'),
            'active_vacancies' => $divisions->where('is_hiring', true)->count(),
            'available_slots' => $divisions->sum(fn ($division) => $division['available_slots']),
        ];

        return Inertia::render('SuperAdmin/KelolaDivisi/Index', [
            'divisions' => $divisions,
            'stats' => $stats,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Update division settings (description, manager, capacity).
     */
    public function update(Request $request, DivisionProfile $division): RedirectResponse
    {
        $this->ensureAuthorized($request->user());

        $currentStaff = $this->staffForDivision($division->name)->count();

        $validated = $request->validate([
            'description' => ['nullable', 'string', 'max:2000'],
            'manager_name' => ['nullable', 'string', 'max:255'],
            'capacity' => ['required', 'integer', 'min:' . $currentStaff],
        ]);

        $division->fill($validated)->save();

        return back()->with('success', 'Divisi berhasil diperbarui.');
    }

    /**
     * Publish or update an active job vacancy for the division.
     */
    public function openJob(Request $request, DivisionProfile $division): RedirectResponse
    {
        $this->ensureAuthorized($request->user());

        $currentStaff = $this->staffForDivision($division->name)->count();
        $availableSlots = max($division->capacity - $currentStaff, 0);

        if ($availableSlots <= 0) {
            throw ValidationException::withMessages([
                'capacity' => 'Kapasitas divisi saat ini penuh. Tingkatkan kapasitas sebelum membuka lowongan.',
            ]);
        }

        $validated = $request->validate([
            'job_title' => ['required', 'string', 'max:255'],
            'job_description' => ['required', 'string', 'max:5000'],
            'job_requirements' => ['required', 'array', 'min:1'],
            'job_requirements.*' => ['required', 'string', 'max:500'],
        ]);

        $requirements = collect($validated['job_requirements'])
            ->map(fn ($requirement) => trim($requirement))
            ->filter()
            ->values()
            ->all();

        if (empty($requirements)) {
            throw ValidationException::withMessages([
                'job_requirements' => 'Mohon tambahkan minimal satu persyaratan yang valid.',
            ]);
        }

        $division
            ->forceFill([
                'is_hiring' => true,
                'job_title' => $validated['job_title'],
                'job_description' => $validated['job_description'],
                'job_requirements' => $requirements,
                'hiring_opened_at' => now(),
            ])
            ->save();

        return back()->with('success', 'Lowongan pekerjaan berhasil dipublikasikan.');
    }

    /**
     * Close the active vacancy for a division.
     */
    public function closeJob(Request $request, DivisionProfile $division): RedirectResponse
    {
        $this->ensureAuthorized($request->user());

        $division
            ->forceFill([
                'is_hiring' => false,
                'job_title' => null,
                'job_description' => null,
                'job_requirements' => null,
                'hiring_opened_at' => null,
            ])
            ->save();

        return back()->with('success', 'Lowongan pekerjaan telah ditutup.');
    }

    /**
     * Ensure the authenticated user may manage divisions.
     */
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

    /**
     * Make sure every configured division has a profile row.
     *
     * @return \Illuminate\Support\Collection<int, \App\Models\DivisionProfile>
     */
    private function ensureDivisionProfiles(): Collection
    {
        return collect(User::DIVISIONS)
            ->map(function (string $name) {
                return DivisionProfile::firstOrCreate(['name' => $name]);
            });
    }

    /**
     * Retrieve staff info for a division.
     */
    private function staffForDivision(string $division): Collection
    {
        return User::query()
            ->where('division', $division)
            ->whereIn('role', [
                User::ROLES['admin'],
                User::ROLES['staff'],
            ])
            ->orderBy('name')
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'position' => $user->role,
                    'join_date' => optional($user->registered_at ?? $user->created_at)->format('Y-m-d'),
                ];
            });
    }
}
