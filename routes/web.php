<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SuperAdmin\AccountController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        /** @var User|null $user */
        $user = request()->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $routeName = $user->dashboardRouteName();

        if ($routeName !== 'dashboard') {
            return redirect()->route($routeName);
        }

        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/admin/dashboard', function () {
        abort_unless(request()->user()?->role === User::ROLES['admin'], 403);
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    Route::get('/staff/dashboard', function () {
        abort_unless(request()->user()?->role === User::ROLES['staff'], 403);
        return Inertia::render('Staff/Dashboard');
    })->name('staff.dashboard');

    Route::get('/pelamar/dashboard', function () {
        abort_unless(request()->user()?->role === User::ROLES['pelamar'], 403);
        return Inertia::render('Pelamar/Dashboard');
    })->name('pelamar.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('super-admin')->name('super-admin.')->group(function () {
        Route::get('/dashboard', SuperAdminDashboardController::class)->name('dashboard');
        Route::resource('accounts', AccountController::class)->except(['show']);
        Route::post('accounts/{user}/toggle-status', [AccountController::class, 'toggleStatus'])->name('accounts.toggle-status');
        Route::post('accounts/{user}/reset-password', [AccountController::class, 'resetPassword'])->name('accounts.reset-password');
    });
});

require __DIR__.'/auth.php';
