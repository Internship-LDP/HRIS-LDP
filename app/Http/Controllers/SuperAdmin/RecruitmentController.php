<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use Carbon\Carbon;
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

        $applicationCollection = Application::with('user.applicantProfile')->latest('submitted_at')->get();

        // ============================
        // LIST SEMUA PELAMAR
        // ============================
        $applications = $applicationCollection
            ->map(function (Application $application) {
                $profile = $application->user?->applicantProfile;
                $interviewTime = $application->interview_time
                    ? substr((string) $application->interview_time, 0, 5)
                    : null;
                $interviewEndTime = $application->interview_end_time
                    ? substr((string) $application->interview_end_time, 0, 5)
                    : null;
                $hasInterview = (bool) ($application->interview_date || $interviewTime || $application->interview_mode);

                $profileFullName = $profile?->full_name ?: $application->full_name;
                $profileEmail = $profile?->email ?: $application->email;
                $profilePhone = $profile?->phone ?: $application->phone;
                $profileAddress = $profile?->address;
                $profileCity = $profile?->city;
                $profileProvince = $profile?->province;
                $profileGender = $profile?->gender;
                $profileReligion = $profile?->religion;
                $profileDateOfBirth = optional($profile?->date_of_birth)->format('Y-m-d');

                $educations = collect($profile?->educations ?? [])
                    ->map(function ($education) {
                        return [
                            'institution' => $education['institution'] ?? null,
                            'degree' => $education['degree'] ?? null,
                            'field_of_study' => $education['field_of_study'] ?? null,
                            'start_year' => $education['start_year'] ?? null,
                            'end_year' => $education['end_year'] ?? null,
                            'gpa' => $education['gpa'] ?? null,
                        ];
                    })
                    ->values()
                    ->all();

                $experiences = collect($profile?->experiences ?? [])
                    ->map(function ($experience) {
                        return [
                            'company' => $experience['company'] ?? null,
                            'position' => $experience['position'] ?? null,
                            'start_date' => $experience['start_date'] ?? null,
                            'end_date' => $experience['end_date'] ?? null,
                            'description' => $experience['description'] ?? null,
                            'is_current' => $experience['is_current'] ?? false,
                        ];
                    })
                    ->values()
                    ->all();

                $primaryEducation = collect($educations)->first();
                $primaryExperience = collect($experiences)->first();

                $educationSummary = $primaryEducation
                    ? trim(collect([
                        $primaryEducation['degree'] ?? null,
                        $primaryEducation['field_of_study'] ?? null,
                        $primaryEducation['institution'] ?? null,
                    ])->filter()->implode(' - '))
                    : null;

                $experienceSummary = $primaryExperience
                    ? trim(collect([
                        $primaryExperience['position'] ?? null,
                        $primaryExperience['company'] ?? null,
                    ])->filter()->implode(' @ '))
                    : null;

                return [
                    'id' => $application->id,
                    'name' => $application->full_name,
                    'position' => $application->position,
                    'education' => $educationSummary ?: $application->education,
                    'experience' => $experienceSummary ?: $application->experience,
                    'profile_name' => $profileFullName,
                    'profile_email' => $profileEmail,
                    'profile_phone' => $profilePhone,
                    'profile_address' => $profileAddress,
                    'profile_city' => $profileCity,
                    'profile_province' => $profileProvince,
                    'profile_gender' => $profileGender,
                    'profile_religion' => $profileReligion,
                    'profile_date_of_birth' => $profileDateOfBirth,
                    'educations' => $educations,
                    'experiences' => $experiences,
                    'interview_date' => optional($application->interview_date)->format('Y-m-d'),
                    'interview_time' => $interviewTime,
                    'interview_mode' => $application->interview_mode,
                    'interviewer_name' => $application->interviewer_name,
                    'meeting_link' => $application->meeting_link,
                    'interview_notes' => $application->interview_notes,
                    'interview_end_time' => $interviewEndTime,
                    'has_interview_schedule' => $hasInterview,
                    'status' => $application->status,
                    'date' => optional($application->submitted_at)->format('d M Y'),
                    'email' => $application->email,
                    'phone' => $application->phone,
                    'skills' => $application->skills,
                    'cv_file' => $application->cv_file,
                    'cv_url' => $application->cv_file
                        ? '/storage/' . ltrim($application->cv_file, '/')
                        : null,
                    'profile_photo_url' => $application->user?->applicantProfile?->profile_photo_path
                        ? '/storage/' . ltrim($application->user->applicantProfile->profile_photo_path, '/')
                        : null,
                    'rejection_reason' => $application->rejection_reason,
                ];
            });

        // ============================
        // LIST INTERVIEW
        // ============================
        $interviews = $applicationCollection
            ->where('status', 'Interview')
            ->map(function (Application $application) {
                $startTime = $application->interview_time
                    ? substr((string) $application->interview_time, 0, 5)
                    : null;
                $rawEndTime = $application->interview_end_time
                    ? substr((string) $application->interview_end_time, 0, 5)
                    : null;
                $endTime = $rawEndTime ?? ($startTime ? $this->addMinutesToTime($startTime, 30) : null);

                return [
                    'application_id' => $application->id,
                    'candidate' => $application->full_name,
                    'position' => $application->position,
                    'date' => optional($application->interview_date)->format('d M Y') ?? '-',
                    'date_value' => optional($application->interview_date)->format('Y-m-d'),
                    'time' => $startTime ?? '-',
                    'end_time' => $endTime,
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
                'rejection_reason' => ['nullable', 'string', 'max:500'],
            ]);

            // Jika status Rejected → alasan wajib
            if ($validated['status'] === 'Rejected') {
                if (empty($validated['rejection_reason'])) {
                    throw ValidationException::withMessages([
                        'rejection_reason' => 'Alasan penolakan wajib diisi.',
                    ]);
                }

                $application->update([
                    'status' => 'Rejected',
                    'rejection_reason' => $validated['rejection_reason'],
                    'rejected_at' => now(),
                ]);
            } else {
                // Jika status lain
                $application->update([
                    'status' => $validated['status'],
                    'rejection_reason' => null, // reset alasan
                ]);
            }

            return redirect()->back()->with('success', 'Status pelamar berhasil diperbarui.');

        } catch (ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        }
    }


    /**
     * POST: Tolak pelamar DENGAN alasan (opsional, jika tunai)
     */
    public function reject(Request $request, Application $application): RedirectResponse
    {
        $this->ensureAuthorized($request->user());

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $application->update([
            'status' => 'Rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'rejected_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Pelamar berhasil ditolak.');
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
                'end_time' => ['required', 'date_format:H:i', 'after:time'],
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

            $this->ensureScheduleAvailable(
                $application,
                $validated['date'],
                $validated['time'],
                $validated['end_time'],
            );

            // Simpan interview
            $application->update([
                'interview_date' => $validated['date'],
                'interview_time' => $validated['time'],
                'interview_end_time' => $validated['end_time'],
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

    private function ensureScheduleAvailable(Application $current, string $date, string $startTime, string $endTime): void
    {
        $start = Carbon::createFromFormat('H:i', $startTime);
        $end = Carbon::createFromFormat('H:i', $endTime);

        $conflict = Application::query()
            ->where('id', '!=', $current->id)
            ->whereDate('interview_date', $date)
            ->whereNotNull('interview_time')
            ->get()
            ->contains(function (Application $other) use ($start, $end) {
                $otherStartRaw = $other->interview_time
                    ? substr((string) $other->interview_time, 0, 5)
                    : null;
                if (!$otherStartRaw) {
                    return false;
                }
                $otherStart = Carbon::createFromFormat('H:i', $otherStartRaw);
                $otherEnd = $other->interview_end_time
                    ? Carbon::createFromFormat('H:i', substr((string) $other->interview_end_time, 0, 5))
                    : (clone $otherStart)->addMinutes(30);

                return $otherStart->lt($end) && $otherEnd->gt($start);
            });

        if ($conflict) {
            throw ValidationException::withMessages([
                'time' => 'Slot waktu ini sudah digunakan untuk interview lain pada tanggal tersebut.',
            ]);
        }
    }

    private function addMinutesToTime(?string $time, int $minutes): ?string
    {
        if (!$time) {
            return null;
        }

        try {
            return Carbon::createFromTimeString($time)->addMinutes($minutes)->format('H:i');
        } catch (\Throwable $e) {
            return null;
        }
    }
}
