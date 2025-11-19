<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RecruitmentController extends Controller
{
    /**
     * GET: Tampilkan daftar semua pelamar, interview, dan onboarding
     */
    public function __invoke(Request $request): Response
    {
        $this->ensureAuthorized($request->user());

        $applicationCollection = Application::latest('submitted_at')->get();

        // ============================
        // LIST SEMUA PELAMAR
        // ============================
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

                    // =========================
                    // CV FILE (gunakan URL storage public)
                    // =========================
                    'cv_file' => $application->cv_file,
                    'cv_url' => $application->cv_file
                        ? '/storage/' . ltrim($application->cv_file, '/')
                        : null,
                ];
            });

        // ============================
        // LIST INTERVIEW
        // ============================
        $interviews = $applicationCollection
            ->where('status', 'Interview')
            ->map(function (Application $application) {
                return [
                    'candidate' => $application->full_name,
                    'position' => $application->position,
                    'date' => optional($application->interview_date)->format('d M Y') ?? '-',
                    'time' => $application->interview_time ?? '-',
                    'mode' => $application->interview_mode ?? '-',
                    'interviewer' => $application->interviewer_name ?? '-',
                    'meeting_link' => $application->meeting_link,
                ];
            })
            ->values();

        // ============================
        // LIST ONBOARDING (HIRED)
        // ============================
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

    /**
     * PUT: Update status manual
     */
    public function updateStatus(Request $request, Application $application): RedirectResponse
    {
        $this->ensureAuthorized($request->user());

        try {
            $validated = $request->validate([
                'status' => ['required', 'string', 'in:' . implode(',', Application::STATUSES)],
            ]);

            if ($application->status !== $validated['status']) {
                $application->update(['status' => $validated['status']]);
                Log::info("Application ID {$application->id} status updated to {$validated['status']}");
            }

            return redirect()->back()->with('success', 'Status pelamar berhasil diperbarui.');

        } catch (ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        }
    }

    /**
     * POST: Jadwalkan interview
     */
    public function scheduleInterview(Request $request, Application $application): RedirectResponse
    {
        $this->ensureAuthorized($request->user());

        try {
            $validated = $request->validate([
                'date' => ['required', 'date', 'after_or_equal:today'],
                'time' => ['required', 'date_format:H:i'],
                'mode' => ['required', 'string', 'in:Online,Offline'],
                'interviewer' => ['required', 'string', 'max:100'],
                'meeting_link' => ['nullable', 'string', 'max:500'],
                'notes' => ['nullable', 'string', 'max:500'],
            ]);

            if ($validated['mode'] === 'Online' && empty($validated['meeting_link'])) {
                throw ValidationException::withMessages([
                    'meeting_link' => 'Link meeting wajib diisi untuk interview Online.',
                ]);
            }

            // SIMPAN JADWAL INTERVIEW + UPDATE STATUS
            $application->update([
                'interview_date' => $validated['date'],
                'interview_time' => $validated['time'],
                'interview_mode' => $validated['mode'],
                'interviewer_name' => $validated['interviewer'],
                'meeting_link' => $validated['meeting_link'] ?? null,
                'interview_notes' => $validated['notes'] ?? null,
                'interview_at' => now(),
                'status' => 'Interview',
            ]);

            return redirect()->back()->with('success', 'Jadwal interview berhasil disimpan.');

        } catch (ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        }
    }

    /**
     * DELETE: Hapus lamaran
     */
    public function destroy(Request $request, Application $application): RedirectResponse
    {
        $this->ensureAuthorized($request->user());
        $application->delete();

        return redirect()
            ->route('super-admin.recruitment')
            ->with('success', 'Lamaran berhasil dihapus.');
    }

    /**
     * Pastikan user berhak mengakses
     */
    private function ensureAuthorized(?User $user): void
    {
        abort_unless(
            $user &&
            ($user->role === User::ROLES['super_admin'] || $user->isHumanCapitalAdmin()),
            403
        );
    }
}
