<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $defaultRole = User::ROLES['pelamar'];

        $user = User::create([
            'employee_code' => User::generateEmployeeCode($defaultRole),
            'name' => $request->name,
            'email' => $request->email,
            'role' => $defaultRole,
            'status' => 'Active',
            'registered_at' => now()->format('Y-m-d'),
            'password' => Hash::make($request->password),
        ]);

        $user->ensureApplicantProfile();

        event(new Registered($user));

        return redirect()
            ->route('login')
            ->with('status', 'Akun Anda berhasil dibuat. Silakan masuk menggunakan email dan password yang telah didaftarkan.');
    }
}
