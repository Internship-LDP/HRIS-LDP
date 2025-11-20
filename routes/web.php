<?php

use App\Http\Controllers\AdminStaff\DashboardController as AdminStaffDashboardController;
use App\Http\Controllers\AdminStaff\LetterController as AdminStaffLetterController;
use App\Http\Controllers\AdminStaff\RecruitmentController as AdminStaffRecruitmentController;
use App\Http\Controllers\Pelamar\ApplicationController as PelamarApplicationController;
use App\Http\Controllers\Pelamar\DashboardController as PelamarDashboardController;
use App\Http\Controllers\Pelamar\ProfileController as PelamarProfileController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Staff\ComplaintController as StaffComplaintController;
use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Staff\ResignationController as StaffResignationController;
use App\Http\Controllers\SuperAdmin\AccountController;
use App\Http\Controllers\SuperAdmin\AdminHrDashboardController;
use App\Http\Controllers\SuperAdmin\ComplaintController as SuperAdminComplaintController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\DivisionController;
use App\Http\Controllers\SuperAdmin\LetterController;
use App\Http\Controllers\SuperAdmin\RecruitmentController; // Pastikan ini di-import
use App\Http\Controllers\SuperAdmin\StaffTerminationController;
use App\Models\User;
use App\Support\DivisionOverview;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $divisionData = DivisionOverview::build();

    $jobs = $divisionData['divisions']
        ->map(function (array $division) {
            return [
                'division' => $division['name'],
                'title' => $division['job_title'],
                'description' => $division['job_description'],
                'location' => 'Divisi ' . $division['name'],
                'type' => 'Full-time',
                'isHiring' => $division['is_hiring'],
                'availableSlots' => $division['available_slots'],
            ];
        })
        ->values()
        ->all();

    return Inertia::render('LandingPage/Index', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'jobs' => $jobs,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        /** @var User|null $user */
        $user = request()->user();

        if (! $user) {
            return redirect('/');
        }

        $routeName = $user->dashboardRouteName();

        return $routeName === 'dashboard'
            ? redirect('/')
            : redirect()->route($routeName);
    })->name('dashboard');

    Route::get('/admin/dashboard', function () {
        abort_unless(request()->user()?->role === User::ROLES['admin'], 403);
        return Inertia::render('Dashboard');
    })->name('admin.dashboard');

    Route::prefix('staff')
        ->name('staff.')
        ->group(function () {
            Route::get('/dashboard', StaffDashboardController::class)->name('dashboard');
            Route::get('/keluhan-dan-saran', [StaffComplaintController::class, 'index'])->name('complaints.index');
            Route::post('/keluhan-dan-saran', [StaffComplaintController::class, 'store'])->name('complaints.store');
            Route::get('/pengajuan-resign', [StaffResignationController::class, 'index'])->name('resignation.index');
            Route::post('/pengajuan-resign', [StaffResignationController::class, 'store'])->name('resignation.store');
        });

    Route::get('/pelamar/dashboard', PelamarDashboardController::class)->name('pelamar.dashboard');
    Route::get('/pelamar/profil', [PelamarProfileController::class, 'show'])->name('pelamar.profile');
    Route::post('/pelamar/profil', [PelamarProfileController::class, 'update'])->name('pelamar.profile.update');

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
        
         // RECRUITMENT ROUTES
        Route::get('/recruitment', RecruitmentController::class)
            ->name('recruitment');

        // UPDATE STATUS (PUT)
        Route::put('/recruitment/{application}/update-status', 
            [RecruitmentController::class, 'updateStatus'])
            ->name('recruitment.update-status');
            
        Route::post('/recruitment/{application}/reject',
            [RecruitmentController::class, 'reject'])
            ->name('recruitment.reject');

        Route::post('/recruitment/{application}/schedule-interview',
            [RecruitmentController::class, 'scheduleInterview'])
            ->name('recruitment.schedule-interview');

        Route::delete('/recruitment/{application}',
            [RecruitmentController::class, 'destroy'])
            ->name('recruitment.destroy');

        Route::get('/kelola-divisi', [DivisionController::class, 'index'])->name('divisions.index');
        Route::patch('/kelola-divisi/{division}', [DivisionController::class, 'update'])->name('divisions.update');
        Route::post('/kelola-divisi/{division}/open-job', [DivisionController::class, 'openJob'])->name('divisions.open-job');
        Route::delete('/kelola-divisi/{division}/open-job', [DivisionController::class, 'closeJob'])->name('divisions.close-job');
        Route::get('/kelola-surat', [LetterController::class, 'index'])->name('letters.index');
        Route::post('/kelola-surat', [LetterController::class, 'store'])->name('letters.store');
        Route::post('/kelola-surat/{surat}/archive', [LetterController::class, 'archive'])->name('letters.archive');
        Route::post('/kelola-surat/{surat}/unarchive', [LetterController::class, 'unarchive'])->name('letters.unarchive');
        Route::post('/kelola-surat/disposition/bulk', [LetterController::class, 'bulkDisposition'])->name('letters.disposition.bulk');
        Route::post('/kelola-surat/disposition/reject', [LetterController::class, 'rejectDisposition'])->name('letters.disposition.reject');
        Route::post('/kelola-surat/{surat}/disposition', [LetterController::class, 'disposition'])->name('letters.disposition');
        Route::get('/kelola-staff', [StaffTerminationController::class, 'index'])->name('staff.index');
        Route::post('/kelola-staff', [StaffTerminationController::class, 'store'])->name('staff.store');
        Route::patch('/kelola-staff/{termination}', [StaffTerminationController::class, 'update'])->name('staff.update');
        Route::delete('/kelola-staff/{termination}', [StaffTerminationController::class, 'destroy'])->name('staff.destroy');
        Route::get('/kelola-pengaduan', [SuperAdminComplaintController::class, 'index'])->name('complaints.index');
        Route::patch('/kelola-pengaduan/{complaint}', [SuperAdminComplaintController::class, 'update'])->name('complaints.update');
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
        Route::post('/kelola-surat/{surat}/reply', [AdminStaffLetterController::class, 'reply'])->name('letters.reply');
        Route::post('/kelola-surat/{surat}/archive', [AdminStaffLetterController::class, 'archive'])->name('letters.archive');
        Route::post('/kelola-surat/{surat}/unarchive', [AdminStaffLetterController::class, 'unarchive'])->name('letters.unarchive');
        Route::get('/recruitment', AdminStaffRecruitmentController::class)->name('recruitment');
    });
});

require __DIR__.'/auth.php';
