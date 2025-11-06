<?php

namespace Database\Factories;

use App\Models\Complaint;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Complaint>
 */
class ComplaintFactory extends Factory
{
    protected $model = Complaint::class;

    public function definition(): array
    {
        $status = fake()->randomElement([
            Complaint::STATUS_NEW,
            Complaint::STATUS_IN_PROGRESS,
            Complaint::STATUS_RESOLVED,
        ]);

        $priority = fake()->randomElement([
            Complaint::PRIORITY_LOW,
            Complaint::PRIORITY_MEDIUM,
            Complaint::PRIORITY_HIGH,
        ]);

        $submittedAt = fake()->dateTimeBetween('-3 months', 'now');
        $resolvedAt = $status === Complaint::STATUS_RESOLVED
            ? fake()->dateTimeBetween($submittedAt, 'now')
            : null;

        return [
            'user_id' => User::factory(),
            'handled_by_id' => null,
            'category' => fake()->randomElement([
                'Lingkungan Kerja',
                'Kompensasi',
                'Relasi Kerja',
                'Fasilitas',
            ]),
            'subject' => fake()->sentence(6),
            'description' => fake()->paragraph(),
            'status' => $status,
            'priority' => $priority,
            'is_anonymous' => fake()->boolean(20),
            'submitted_at' => $submittedAt,
            'resolved_at' => $resolvedAt,
            'resolution_notes' => $resolvedAt ? fake()->paragraph() : null,
        ];
    }
}
