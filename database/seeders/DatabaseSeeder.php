<?php

namespace Database\Seeders;

use App\Models\User;
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
        // Seed a Super Admin for the application
        User::factory()->create([
            'employee_code' => 'SA001',
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'role' => User::ROLES['super_admin'],
            'status' => 'Active',
            'registered_at' => now()->format('Y-m-d'),
        ]);

        // Optionally seed supporting accounts
        User::factory(5)->create();
    }
}
