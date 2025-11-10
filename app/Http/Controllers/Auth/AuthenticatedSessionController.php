<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($user->status === 'Inactive') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'account_status' => 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator untuk informasi lebih lanjut.',
            ]);
        }

        $intended = $request->session()->pull('url.intended');

        if ($intended && $this->intendedUrlMatchesRole($user, $intended)) {
            return redirect()->to($intended);
        }

        return redirect()->route($user->dashboardRouteName());
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function intendedUrlMatchesRole(User $user, string $url): bool
    {
        $path = parse_url($url, PHP_URL_PATH) ?? '/';

        $allowedPrefixes = $this->allowedPathPrefixesFor($user);

        foreach ($allowedPrefixes as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return true;
            }
        }

        return in_array($path, ['/', '/dashboard', '/profile'], true);
    }

    /**
     * Determine which path prefixes the user role is allowed to access during redirect.
     */
    private function allowedPathPrefixesFor(User $user): array
    {
        if ($user->isHumanCapitalAdmin()) {
            return ['/super-admin/admin-hr', '/super-admin'];
        }

        return match ($user->role) {
            User::ROLES['super_admin'] => ['/super-admin'],
            User::ROLES['admin'] => ['/admin-staff'],
            User::ROLES['staff'] => ['/staff'],
            User::ROLES['pelamar'] => ['/pelamar'],
            default => ['/'],
        };
    }
}
