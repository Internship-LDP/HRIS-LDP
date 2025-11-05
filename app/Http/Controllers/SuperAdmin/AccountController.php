<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'role' => $request->string('role')->toString(),
            'status' => $request->string('status')->toString(),
        ];

        $query = User::query()->latest();

        if ($filters['search']) {
            $query->where(function ($builder) use ($filters) {
                $search = '%' . $filters['search'] . '%';
                $builder
                    ->where('name', 'like', $search)
                    ->orWhere('email', 'like', $search)
                    ->orWhere('employee_code', 'like', $search);
            });
        }

        if ($filters['role'] && $filters['role'] !== 'all') {
            $query->where('role', $filters['role']);
        }

        if ($filters['status'] && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        $users = $query
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'employee_code' => $user->employee_code,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'division' => $user->division,
                'status' => $user->status,
                'registered_at' => optional($user->registered_at)->format('Y-m-d'),
                'last_login_at' => optional($user->last_login_at)->toDateTimeString(),
                'created_at' => $user->created_at?->toDateTimeString(),
            ]);

        $stats = [
            'total' => User::count(),
            'super_admin' => User::where('role', User::ROLES['super_admin'])->count(),
            'admin' => User::where('role', User::ROLES['admin'])->count(),
            'staff' => User::where('role', User::ROLES['staff'])->count(),
            'karyawan' => User::where('role', User::ROLES['karyawan'])->count(),
            'external' => User::where('role', User::ROLES['external_sender'])->count(),
        ];

        return Inertia::render('SuperAdmin/KelolaAkun/Index', [
            'users' => $users,
            'filters' => $filters,
            'roleOptions' => array_values(User::ROLES),
            'statusOptions' => User::STATUSES,
            'divisionOptions' => User::DIVISIONS,
            'stats' => $stats,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('SuperAdmin/KelolaAkun/Create', [
            'roleOptions' => array_values(User::ROLES),
            'statusOptions' => User::STATUSES,
            'divisionOptions' => User::DIVISIONS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', Rule::in(array_values(User::ROLES))],
            'division' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', Rule::in(User::STATUSES)],
            'registered_at' => ['nullable', 'date'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $validated['division'] = $validated['division'] ?: null;

        if (!$this->roleRequiresDivision($validated['role'])) {
            $validated['division'] = null;
        }

        $validated['employee_code'] = User::generateEmployeeCode($validated['role']);
        $validated['registered_at'] = $validated['registered_at'] ?? now()->format('Y-m-d');
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()
            ->route('super-admin.accounts.index')
            ->with('success', 'Akun baru berhasil dibuat.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('SuperAdmin/KelolaAkun/Edit', [
            'user' => [
                'id' => $user->id,
                'employee_code' => $user->employee_code,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'division' => $user->division,
                'status' => $user->status,
                'registered_at' => optional($user->registered_at)->format('Y-m-d'),
            ],
            'roleOptions' => array_values(User::ROLES),
            'statusOptions' => User::STATUSES,
            'divisionOptions' => User::DIVISIONS,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'role' => ['required', 'string', Rule::in(array_values(User::ROLES))],
            'division' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', Rule::in(User::STATUSES)],
            'registered_at' => ['nullable', 'date'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $validated['division'] = $validated['division'] ?: null;

        if (!$this->roleRequiresDivision($validated['role'])) {
            $validated['division'] = null;
        }

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()
            ->route('super-admin.accounts.index')
            ->with('success', 'Akun berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()
            ->back()
            ->with('success', 'Akun berhasil dihapus.');
    }

    public function toggleStatus(User $user): RedirectResponse
    {
        $user->status = $user->status === 'Active' ? 'Inactive' : 'Active';
        $user->save();

        return redirect()
            ->back()
            ->with('success', "Status akun {$user->name} telah diperbarui.");
    }

    public function resetPassword(User $user): RedirectResponse
    {
        $plainPassword = Str::random(12);
        $user->forceFill([
            'password' => Hash::make($plainPassword),
        ])->save();

        return redirect()
            ->back()
            ->with([
                'success' => "Password baru untuk {$user->name} telah dibuat.",
                'generated_password' => $plainPassword,
            ]);
    }

    private function roleRequiresDivision(string $role): bool
    {
        return in_array(
            $role,
            [
                User::ROLES['admin'],
                User::ROLES['staff'],
                User::ROLES['karyawan'],
            ],
            true,
        );
    }
}
