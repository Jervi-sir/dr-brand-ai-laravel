<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ApiToken>
 */
class ApiTokenFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word().' Key',
            'provider' => fake()->randomElement(['openai', 'anthropic', 'google', 'cohere', 'mistral', 'groq', 'other']),
            'token' => 'sk-'.fake()->password(32, 32),
            'is_active' => fake()->boolean(80),
            'last_used_at' => fake()->optional()->dateTime(),
        ];
    }
}
