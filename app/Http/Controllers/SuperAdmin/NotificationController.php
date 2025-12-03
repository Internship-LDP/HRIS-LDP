<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Complaint;
use App\Models\StaffTermination;
use App\Models\Surat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || (!$user->hasRole('Super Admin') && !$user->isHumanCapitalAdmin())) {
            return response()->json(['data' => [], 'total' => 0], 403);
        }

        $page = $request->input('page', 1);
        $perPage = 5;

        // Kumpulkan semua notifikasi
        $notifications = collect();

        // 1. Letters/Surat
        $pendingLetters = Surat::query()
            ->where('current_recipient', 'hr')
            ->whereIn('status_persetujuan', ['Menunggu HR', 'Diajukan', 'Diproses'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($letter) {
                return [
                    'id' => 'letter-' . ($letter->id ?? uniqid()),
                    'type' => 'letter',
                    'title' => 'Surat Perlu Ditindaklanjuti',
                    'description' => "Surat {$letter->nomor_surat} - {$letter->perihal}",
                    'timestamp' => $letter->created_at->diffForHumans(),
                    'url' => route('super-admin.letters.index'),
                    'created_at' => $letter->created_at,
                ];
            });

        // 2. Applications/Recruitment
        $pendingApplications = Application::query()
            ->whereIn('status', ['Applied', 'Screening'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($app) {
                return [
                    'id' => 'application-' . ($app->id ?? uniqid()),
                    'type' => 'application',
                    'title' => 'Aplikasi Pelamar Baru',
                    'description' => "{$app->full_name} melamar posisi {$app->position}",
                    'timestamp' => $app->created_at->diffForHumans(),
                    'url' => route('super-admin.recruitment'),
                    'created_at' => $app->created_at,
                ];
            });

        // 3. Terminations/Offboarding
        $pendingTerminations = StaffTermination::query()
            ->whereIn('status', ['Diajukan', 'Proses'])
            ->orderBy('request_date', 'desc')
            ->get()
            ->map(function ($termination) {
                return [
                    'id' => 'termination-' . ($termination->id ?? uniqid()),
                    'type' => 'termination',
                    'title' => 'Pengajuan Offboarding',
                    'description' => "Pengajuan offboarding {$termination->employee_name}",
                    'timestamp' => \Carbon\Carbon::parse($termination->request_date)->diffForHumans(),
                    'url' => route('super-admin.staff.index'),
                    'created_at' => \Carbon\Carbon::parse($termination->request_date),
                ];
            });

        // 4. Complaints/Pengaduan
        $newComplaints = Complaint::query()
            ->where('status', Complaint::STATUS_NEW)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($complaint) {
                return [
                    'id' => 'complaint-' . ($complaint->id ?? uniqid()),
                    'type' => 'complaint',
                    'title' => 'Pengaduan Baru',
                    'description' => $complaint->subject ?? 'Pengaduan dari karyawan',
                    'timestamp' => $complaint->created_at->diffForHumans(),
                    'url' => route('super-admin.complaints.index'),
                    'created_at' => $complaint->created_at,
                ];
            });

        // Gabungkan semua notifikasi
        $notifications = $notifications
            ->concat($pendingLetters)
            ->concat($pendingApplications)
            ->concat($pendingTerminations)
            ->concat($newComplaints)
            ->sortByDesc('created_at')
            ->values();

        // Implementasi pagination manual
        $total = $notifications->count();
        $lastPage = (int) ceil($total / $perPage);
        $page = max(1, min($page, $lastPage ?: 1));
        
        $offset = ($page - 1) * $perPage;
        $paginatedData = $notifications->slice($offset, $perPage)->values();

        return response()->json([
            'data' => $paginatedData,
            'current_page' => $page,
            'last_page' => $lastPage,
            'total' => $total,
            'per_page' => $perPage,
        ]);
    }
}
