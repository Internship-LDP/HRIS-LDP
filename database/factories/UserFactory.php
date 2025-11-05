<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories.Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password = null;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $role = fake()->randomElement(array_values(User::ROLES));
        $status = fake()->randomElement(User::STATUSES);
        $divisionEligible = in_array(
            $role,
            [
                User::ROLES['admin'],
                User::ROLES['staff'],
                User::ROLES['karyawan'],
            ],
            true,
        );
        $registeredAt = fake()->dateTimeBetween('-2 years', 'now');

        return [
            'employee_code' => User::generateEmployeeCode($role),
            'name' => fake()->name(),
            'email' => fake()
                ->unique()
                ->safeEmail(),
            'email_verified_at' => now(),
            'role' => $role,
            'division' => $divisionEligible
                ? fake()->randomElement(User::DIVISIONS)
                : null,
            'status' => $status,
            'registered_at' => $registeredAt->format('Y-m-d'),
            'last_login_at' => fake()
                ->optional(0.2)
                ->dateTimeBetween($registeredAt, 'now'),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
