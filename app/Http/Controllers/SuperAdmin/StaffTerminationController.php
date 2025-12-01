<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\StoreStaffTerminationRequest;
use App\Models\StaffTermination;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class StaffTerminationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAccess($request->user());

        $terminations = StaffTermination::query()
            ->with('employee')
            ->latest('effective_date')
            ->get();

        $active = $terminations->whereIn('status', ['Diajukan', 'Proses']);
        $archive = $terminations->where('status', 'Selesai');

        $stats = [
            'newRequests' => $terminations->where('status', 'Diajukan')->count(),
            'inProcess' => $terminations->where('status', 'Proses')->count(),
            'completedThisMonth' => StaffTermination::query()
                ->where('status', 'Selesai')
                ->whereBetween('effective_date', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
            'archived' => $terminations->count(),
        ];

        $inactiveEmployees = $archive
            ->take(10)
            ->map(fn (StaffTermination $termination) => [
                'id' => $termination->id,
                'name' => $termination->employee_name,
                'employeeCode' => $termination->employee_code,
                'division' => $termination->division,
                'position' => $termination->position,
                'joinDate' => optional($termination->employee?->registered_at)->format('d M Y'),
                'exitDate' => optional($termination->effective_date)->format('d M Y'),
                'exitReason' => $termination->reason,
                'type' => $termination->type,
            ])
            ->values();

        $checklistTemplate = [
            'Surat resign diterima',
            'Persetujuan atasan',
            'Serah terima pekerjaan',
            'Pengembalian inventaris (laptop, ID card, dll)',
            'Clearance dari Finance',
            'Dokumen kelengkapan (BPJS, pajak, dll)',
            'Data arsip ke sistem',
        ];

        return Inertia::render('SuperAdmin/KelolaStaff/Index', [
            'stats' => $stats,
            'terminations' => [
                'active' => $this->transformTerminations($active),
                'archive' => $this->transformTerminations($archive),
            ],
            'inactiveEmployees' => $inactiveEmployees,
            'checklistTemplate' => $checklistTemplate,
        ]);
    }

    public function store(StoreStaffTerminationRequest $request): RedirectResponse
    {
        $user = User::where('employee_code', $request->input('employee_code'))->firstOrFail();

        // Validasi: Hanya karyawan dengan role "Staff" yang bisa diajukan termination
        if ($user->role !== User::ROLES['staff']) {
            return redirect()
                ->back()
                ->withErrors(['employee_code' => 'ID Karyawan yang dimasukkan bukan staff. Hanya staff yang dapat diajukan untuk termination.'])
                ->withInput();
        }

        StaffTermination::create([
            'reference' => StaffTermination::generateReference(),
            'user_id' => $user->id,
            'requested_by' => $request->user()->id,
            'employee_code' => $user->employee_code,
            'employee_name' => $user->name,
            'division' => $user->division,
            'position' => $user->role,
            'type' => $request->input('type'),
            'reason' => $request->input('reason'),
            'suggestion' => $request->input('suggestion'),
            'request_date' => now()->toDateString(),
            'effective_date' => $request->input('effective_date'),
            'status' => 'Diajukan',
            'progress' => 10,
        ]);

        return redirect()
            ->route('super-admin.staff.index')
            ->with('success', 'Pengajuan termination berhasil dibuat.');
    }

    public function update(Request $request, StaffTermination $termination): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        $data = $request->validate([
            'status' => ['required', 'string', 'in:Diajukan,Proses,Selesai'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'checklist' => ['nullable', 'array'],
            'checklist.*' => ['boolean'],
        ]);

        $incomingChecklist = $data['checklist'] ?? [];
        $mergedChecklist = array_replace($termination->checklist ?? [], $incomingChecklist);

        $totalItems = count($mergedChecklist);
        $completedItems = collect($mergedChecklist)->filter()->count();
        $calculatedProgress = $totalItems > 0
            ? (int) round(($completedItems / $totalItems) * 100)
            : $termination->progress;

        if ($data['status'] === 'Selesai') {
            $calculatedProgress = 100;
        }

        $termination
            ->forceFill([
                'status' => $data['status'],
                'notes' => $data['notes'] ?? null,
                'checklist' => $mergedChecklist,
                'progress' => $calculatedProgress,
            ])
            ->save();

        // Jika status Selesai, nonaktifkan user
        if ($termination->status === 'Selesai' && $termination->employee) {
            $termination->employee->update([
                'status' => 'Inactive',
                'inactive_at' => now(),
            ]);
        }

        return redirect()
            ->back()
            ->with('success', 'Progress offboarding berhasil diperbarui.');
    }

    public function destroy(Request $request, StaffTermination $termination): RedirectResponse
    {
        $this->authorizeAccess($request->user());

        $employeeName = $termination->employee_name;
        $termination->delete();

        return redirect()
            ->route('super-admin.staff.index')
            ->with('success', "Offboarding {$employeeName} berhasil dibatalkan.");
    }

    private function transformTerminations(Collection $terminations): array
    {
        return $terminations
            ->map(function (StaffTermination $termination) {
                return [
                    'id' => $termination->id,
                    'reference' => $termination->reference,
                    'employeeName' => $termination->employee_name,
                    'employeeCode' => $termination->employee_code,
                    'division' => $termination->division,
                    'position' => $termination->position,
                    'type' => $termination->type,
                    'reason' => $termination->reason,
                    'suggestion' => $termination->suggestion,
                    'notes' => $termination->notes,
                    'checklist' => $termination->checklist ?? [],
                    'status' => $termination->status,
                    'progress' => $termination->progress,
                    'requestDate' => optional($termination->request_date)->format('d M Y'),
                    'effectiveDate' => optional($termination->effective_date)->format('d M Y'),
                ];
            })
            ->values()
            ->toArray();
    }

    private function authorizeAccess(?User $user): void
    {
        abort_unless(
            $user && in_array($user->role, [User::ROLES['super_admin'], User::ROLES['admin']], true),
            403
        );
    }
}
