<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PromptHistory>
 */
class PromptHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'model_id' => \App\Models\AiModel::factory(),
            'prompt' => fake()->paragraph(),
            'userEmail' => fake()->safeEmail(),
        ];
    }
}
