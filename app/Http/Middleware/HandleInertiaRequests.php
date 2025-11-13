<?php

namespace App\Http\Middleware;

use App\Models\Application;
use App\Models\Complaint;
use App\Models\StaffTermination;
use App\Models\Surat;
use App\Models\User;
use Illuminate\Http\Request;
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

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
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
        if (! $user || (! $user->hasRole(User::ROLES['super_admin']) && ! $user->isHumanCapitalAdmin())) {
            return [];
        }

        return [
            'super-admin.letters.index' => $this->pendingLettersCount(),
            'super-admin.recruitment' => $this->pendingApplicationsCount(),
            'super-admin.staff.index' => $this->activeTerminationCount(),
            'super-admin.complaints.index' => $this->newComplaintsCount(),
        ];
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
}
