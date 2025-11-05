<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SuperAdmin\AccountController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('super-admin')
        ->name('super-admin.')
        ->group(function () {
            Route::get('/dashboard', SuperAdminDashboardController::class)->name('dashboard');

            Route::resource('accounts', AccountController::class)->except(['show']);
            Route::post('accounts/{user}/toggle-status', [AccountController::class, 'toggleStatus'])
                ->name('accounts.toggle-status');
            Route::post('accounts/{user}/reset-password', [AccountController::class, 'resetPassword'])
                ->name('accounts.reset-password');
        });
});

require __DIR__.'/auth.php';
