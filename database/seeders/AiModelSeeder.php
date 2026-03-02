<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AiModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\AiModel::create([
            'name' => 'gpt-4o',
            'display_name' => 'GPT-4o',
            'provider' => 'openai',
            'type' => 'chat',
            'is_active' => true,
            'capability' => 'Most advanced model',
        ]);

        \App\Models\AiModel::create([
            'name' => 'gpt-4o-mini',
            'display_name' => 'GPT-4o Mini',
            'provider' => 'openai',
            'type' => 'chat',
            'is_active' => true,
            'capability' => 'Fast and efficient',
        ]);
    }
}
