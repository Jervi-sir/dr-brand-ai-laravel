<?php

use App\Models\PromptHistory;
use App\Models\User;
use Database\Seeders\RoleSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(RoleSeeder::class);
    $this->admin = User::factory()->create(['role_id' => 1]);
});

test('admin can view ai prompt history list', function () {
    PromptHistory::factory()->count(3)->create();

    actingAs($this->admin)
        ->get(route('admin.ai-prompt-history.index'))
        ->assertStatus(200)
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/ai-prompt-history/index')
                ->has('history.data', 3)
        );
});

test('admin can search prompt history', function () {
    PromptHistory::factory()->create([
        'userEmail' => 'search@example.com',
        'prompt' => 'Something unique',
    ]);
    PromptHistory::factory()->create([
        'userEmail' => 'other@example.com',
        'prompt' => 'Another thing',
    ]);

    actingAs($this->admin)
        ->get(route('admin.ai-prompt-history.index', ['search' => 'unique']))
        ->assertStatus(200)
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/ai-prompt-history/index')
                ->has('history.data', 1)
                ->where('history.data.0.prompt', 'Something unique')
        );

    actingAs($this->admin)
        ->get(route('admin.ai-prompt-history.index', ['search' => 'search@example.com']))
        ->assertStatus(200)
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/ai-prompt-history/index')
                ->has('history.data', 1)
                ->where('history.data.0.userEmail', 'search@example.com')
        );
});
