<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Chat>
 */
class ChatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'visibility' => 'private',
        ];
    }

    /**
     * Set the chat visibility to public.
     */
    public function public(): static
    {
        return $this->state(fn(array $attributes) => [
            'visibility' => 'public',
        ]);
    }
}
