<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Content>
 */
class ContentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'title' => fake()->sentence(3),
            'user_prompt' => fake()->paragraph(),
            'generated_script' => '<p>'.fake()->paragraphs(3, true).'</p>',
            'stage' => 'script',
            'mood' => fake()->randomElement(['blue', 'green', 'red', 'yellow', 'purple']),
            'scheduled_date' => null,
            'deadline' => null,
        ];
    }

    public function voiceOver(): static
    {
        return $this->state(fn () => [
            'stage' => 'voice_over',
            'deadline' => fake()->dateTimeBetween('+1 day', '+14 days'),
        ]);
    }

    public function creation(): static
    {
        return $this->state(fn () => [
            'stage' => 'creation',
            'deadline' => fake()->dateTimeBetween('+1 day', '+14 days'),
        ]);
    }

    public function done(): static
    {
        return $this->state(fn () => [
            'stage' => 'done',
            'deadline' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function withDeadline(\DateTimeInterface|string|null $deadline = null): static
    {
        return $this->state(fn () => [
            'deadline' => $deadline ?? fake()->dateTimeBetween('+1 day', '+14 days'),
        ]);
    }
}
