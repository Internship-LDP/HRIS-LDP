<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StoreResignationRequest;
use App\Models\StaffTermination;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResignationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $this->authorizeStaff($user);

        $terminations = StaffTermination::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $activeRequest = $terminations->first(fn (StaffTermination $termination) => in_array(
            $termination->status,
            ['Diajukan', 'Proses'],
            true
        ));

        return Inertia::render('Staff/Resignation', [
            'profile' => [
                'name' => $user->name,
                'employeeCode' => $user->employee_code,
                'division' => $user->division,
                'position' => $user->role,
                'joinedAt' => optional($user->registered_at)->format('Y-m-d'),
                'joinedDisplay' => optional($user->registered_at)->format('d M Y') ?? '-',
            ],
            'activeRequest' => $activeRequest ? $this->transformTermination($activeRequest) : null,
            'history' => $terminations
                ->map(fn (StaffTermination $termination) => $this->transformTermination($termination))
                ->values(),
        ]);
    }

    public function store(StoreResignationRequest $request): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeStaff($user);

        $hasActive = StaffTermination::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['Diajukan', 'Proses'])
            ->exists();

        if ($hasActive) {
            return redirect()
                ->back()
                ->withErrors([
                    'effective_date' => 'Anda masih memiliki pengajuan resign yang berjalan.',
                ]);
        }

        StaffTermination::create([
            'reference' => StaffTermination::generateReference(),
            'user_id' => $user->id,
            'requested_by' => $user->id,
            'employee_code' => $user->employee_code,
            'employee_name' => $user->name,
            'division' => $user->division,
            'position' => $user->role,
            'type' => 'Resign',
            'reason' => $request->input('reason'),
            'suggestion' => $request->input('suggestion'),
            'request_date' => now()->toDateString(),
            'effective_date' => $request->input('effective_date'),
            'status' => 'Diajukan',
            'progress' => 10,
            'checklist' => [],
        ]);

        return redirect()
            ->route('staff.resignation.index')
            ->with('success', 'Pengajuan resign berhasil dikirim ke HR.');
    }

    private function transformTermination(StaffTermination $termination): array
    {
        return [
            'reference' => $termination->reference,
            'type' => $termination->type,
            'status' => $termination->status,
            'progress' => $termination->progress,
            'requestDate' => optional($termination->request_date)->format('d M Y') ?? '-',
            'effectiveDate' => optional($termination->effective_date)->format('d M Y') ?? '-',
            'reason' => $termination->reason,
            'suggestion' => $termination->suggestion,
        ];
    }

    private function authorizeStaff(?User $user): void
    {
        abort_unless($user && $user->hasRole(User::ROLES['staff']), 403);
    }
}
