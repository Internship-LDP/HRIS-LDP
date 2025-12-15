<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Complaint;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
{
    // Seed hanya satu akun Super Admin
    User::factory()->create([
        'employee_code' => 'SA001',
        'name' => 'Super Admin',
        'email' => 'superadmin@example.com',
        'role' => User::ROLES['super_admin'],
        'division' => null,
        'status' => 'Active',
        'registered_at' => now()->format('Y-m-d'),
    ]);
}

}
