<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\DivisionProfile;
use App\Models\User;
use App\Support\DivisionOverview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $divisionData = DivisionOverview::build();

        return Inertia::render('SuperAdmin/KelolaDivisi/Index', [
            'divisions' => $divisionData['divisions'],
            'stats' => $divisionData['stats'],
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

        $currentStaff = DivisionOverview::staffForDivision($division->name)->count();

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

        $currentStaff = DivisionOverview::staffForDivision($division->name)->count();
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
            'job_eligibility_criteria' => ['nullable', 'array'],
            'job_eligibility_criteria.min_age' => ['nullable', 'integer', 'min:17', 'max:65'],
            'job_eligibility_criteria.max_age' => ['nullable', 'integer', 'min:17', 'max:65'],
            'job_eligibility_criteria.gender' => ['nullable', 'string', 'max:50'],
            'job_eligibility_criteria.min_education' => ['nullable', 'string', 'max:50'],
            'job_eligibility_criteria.min_experience_years' => ['nullable', 'integer', 'min:0', 'max:50'],
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

        // Clean up eligibility criteria - remove empty/null values
        $eligibilityCriteria = $validated['job_eligibility_criteria'] ?? [];
        $eligibilityCriteria = array_filter($eligibilityCriteria, fn ($value) => $value !== null && $value !== '' && $value !== 'any');

        $division
            ->forceFill([
                'is_hiring' => true,
                'job_title' => $validated['job_title'],
                'job_description' => $validated['job_description'],
                'job_requirements' => $requirements,
                'job_eligibility_criteria' => empty($eligibilityCriteria) ? null : $eligibilityCriteria,
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
}
