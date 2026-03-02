<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(RoleSeeder::class);
    $this->admin = User::factory()->create(['role_id' => 1]); // Assuming role_id 1 is admin
});

test('admin can view users list', function () {
    User::factory()->count(3)->create();

    actingAs($this->admin)
        ->get(route('admin.users.index'))
        ->assertStatus(200)
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/users/index')
                ->has('users.data', 4) // 3 + 1 admin
        );
});

test('admin can search users', function () {
    User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
    User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);

    actingAs($this->admin)
        ->get(route('admin.users.index', ['search' => 'John']))
        ->assertStatus(200)
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/users/index')
                ->has('users.data', 1)
                ->where('users.data.0.name', 'John Doe')
        );
});

test('admin can approve a user', function () {
    $user = User::factory()->pending()->create();

    actingAs($this->admin)
        ->post(route('admin.users.approve', $user))
        ->assertRedirect();

    expect($user->fresh()->is_verified)->toBeTrue();
});

test('admin can delete a user', function () {
    $user = User::factory()->create();

    actingAs($this->admin)
        ->delete(route('admin.users.destroy', $user))
        ->assertRedirect();

    expect(User::find($user->id))->toBeNull();
});
