<?php

namespace App\Http\Middleware;

use App\Models\Application;
use App\Models\Complaint;
use App\Models\StaffTermination;
use App\Models\Surat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $profilePhotoUrl = null;

        // Get applicant profile photo if user is a pelamar
        if ($user && $user->role === User::ROLES['pelamar']) {
            $profile = $user->applicantProfile;
            if ($profile && $profile->profile_photo_path) {
                $profilePhotoUrl = $this->photoDataUri($profile->profile_photo_path);
            }
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
                'profilePhotoUrl' => $profilePhotoUrl,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'generated_password' => session('generated_password'),
            ],
            'sidebarNotifications' => $this->sidebarNotifications($user),
        ]);
    }

    /**
     * Hitung jumlah data baru yang relevan untuk panel navigasi super admin.
     */
    private function sidebarNotifications(?User $user): array
    {
        if (! $user) {
            return [];
        }

        if ($user->hasRole(User::ROLES['super_admin']) || $user->isHumanCapitalAdmin()) {
            return [
                'super-admin.letters.index' => $this->pendingLettersCount(),
                'super-admin.recruitment' => $this->pendingApplicationsCount(),
                'super-admin.staff.index' => $this->activeTerminationCount(),
                'super-admin.complaints.index' => $this->newComplaintsCount(),
            ];
        }

        if ($user->hasRole(User::ROLES['admin']) && ! $user->isHumanCapitalAdmin()) {
            return [
                'admin-staff.letters' => $this->pendingDivisionLettersCount($user),
            ];
        }

        return [];
    }

    private function pendingLettersCount(): int
    {
        $pendingStatuses = ['Menunggu HR', 'Diajukan', 'Diproses'];

        return Surat::query()
            ->where('current_recipient', 'hr')
            ->whereIn('status_persetujuan', $pendingStatuses)
            ->count();
    }

    private function pendingApplicationsCount(): int
    {
        return Application::query()
            ->whereIn('status', ['Applied', 'Screening'])
            ->count();
    }

    private function activeTerminationCount(): int
    {
        return StaffTermination::query()
            ->whereIn('status', ['Diajukan', 'Proses'])
            ->count();
    }

    private function newComplaintsCount(): int
    {
        return Complaint::query()
            ->where('status', Complaint::STATUS_NEW)
            ->count();
    }

    private function pendingDivisionLettersCount(User $user): int
    {
        if (! $user->division) {
            return 0;
        }

        return Surat::query()
            ->where('current_recipient', 'division')
            ->where('status_persetujuan', 'Didisposisi')
            ->where(function ($query) use ($user) {
                $query->where('target_division', $user->division)
                    ->orWhere('penerima', $user->division)
                    ->orWhere('user_id', $user->id);
            })
            ->count();
    }

    private function photoDataUri(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        $contents = Storage::disk('public')->get($path);
        $mime = Storage::disk('public')->mimeType($path) ?? 'image/jpeg';

        return 'data:' . $mime . ';base64,' . base64_encode($contents);
    }
}
