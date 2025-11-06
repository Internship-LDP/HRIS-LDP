<?php

namespace App\Http\Controllers\Pelamar;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user && $user->role === User::ROLES['pelamar'], 403);

        $applications = Application::where('user_id', $user->id)
            ->latest('submitted_at')
            ->get()
            ->map(function (Application $application) {
                return [
                    'id' => $application->id,
                    'position' => $application->position,
                    'status' => $application->status,
                    'submitted_at' => optional($application->submitted_at)->format('d M Y'),
                    'notes' => $application->notes,
                ];
            });

        return Inertia::render('Pelamar/Applications', [
            'applications' => $applications,
            'defaultForm' => [
                'full_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
            ],
            'positionOptions' => $this->positionOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->role === User::ROLES['pelamar'], 403);

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'position' => [
                'required',
                'string',
                'max:255',
                Rule::in($this->positionOptions()),
            ],
            'education' => ['nullable', 'string', 'max:255'],
            'experience' => ['nullable', 'string', 'max:255'],
            'skills' => ['nullable', 'string'],
        ]);

        Application::create([
            'user_id' => $user->id,
            ...$validated,
            'status' => Application::STATUSES[0],
            'submitted_at' => now(),
        ]);

        return redirect()
            ->back()
            ->with('success', 'Lamaran Anda berhasil dikirim.');
    }

    private function positionOptions(): array
    {
        return [
            'Software Engineer',
            'Marketing Manager',
            'Accountant',
            'HR Specialist',
        ];
    }
}
