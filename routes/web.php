<?php

use App\Http\Controllers\AdminStaff\DashboardController as AdminStaffDashboardController;
use App\Http\Controllers\AdminStaff\LetterController as AdminStaffLetterController;
use App\Http\Controllers\AdminStaff\RecruitmentController as AdminStaffRecruitmentController;
use App\Http\Controllers\Pelamar\ApplicationController as PelamarApplicationController;
use App\Http\Controllers\Pelamar\DashboardController as PelamarDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SuperAdmin\AccountController;
use App\Http\Controllers\SuperAdmin\AdminHrDashboardController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\LetterController;
use App\Http\Controllers\SuperAdmin\RecruitmentController;
use App\Http\Controllers\SuperAdmin\StaffTerminationController;
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
        return Inertia::render('Dashboard');
    })->name('admin.dashboard');

    Route::get('/staff/dashboard', AdminStaffDashboardController::class)->name('staff.dashboard');

    Route::get('/pelamar/dashboard', PelamarDashboardController::class)->name('pelamar.dashboard');

    Route::get('/pelamar/lamaran-saya', [PelamarApplicationController::class, 'index'])
        ->name('pelamar.applications');
    Route::post('/pelamar/lamaran-saya', [PelamarApplicationController::class, 'store'])
        ->name('pelamar.applications.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('super-admin')->name('super-admin.')->group(function () {
        Route::get('/dashboard', SuperAdminDashboardController::class)->name('dashboard');
        Route::get('/admin-hr/dashboard', AdminHrDashboardController::class)->name('admin-hr.dashboard');
        Route::get('/recruitment', RecruitmentController::class)->name('recruitment');
        Route::get('/kelola-surat', [LetterController::class, 'index'])->name('letters.index');
        Route::post('/kelola-surat', [LetterController::class, 'store'])->name('letters.store');
        Route::post('/kelola-surat/{surat}/disposition', [LetterController::class, 'disposition'])->name('letters.disposition');
        Route::get('/kelola-staff', [StaffTerminationController::class, 'index'])->name('staff.index');
        Route::post('/kelola-staff', [StaffTerminationController::class, 'store'])->name('staff.store');
        Route::resource('accounts', AccountController::class)
            ->parameters(['accounts' => 'user'])
            ->except(['show']);
        Route::post('accounts/{user}/toggle-status', [AccountController::class, 'toggleStatus'])->name('accounts.toggle-status');
        Route::post('accounts/{user}/reset-password', [AccountController::class, 'resetPassword'])->name('accounts.reset-password');
    });

    Route::prefix('admin-staff')->name('admin-staff.')->group(function () {
        Route::get('/dashboard', AdminStaffDashboardController::class)->name('dashboard');
        Route::get('/kelola-surat', [AdminStaffLetterController::class, 'index'])->name('letters');
        Route::post('/kelola-surat', [AdminStaffLetterController::class, 'store'])->name('letters.store');
        Route::get('/recruitment', AdminStaffRecruitmentController::class)->name('recruitment');
    });
});

require __DIR__.'/auth.php';
