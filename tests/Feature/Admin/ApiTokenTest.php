<?php

use App\Models\ApiToken;
use App\Models\User;
use Database\Seeders\RoleSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\seed;

beforeEach(function () {
    seed(RoleSeeder::class);
    $this->admin = User::factory()->create(['role_id' => 1]); // admin
    $this->user = User::factory()->create(['role_id' => 2]); // user
});

test('admin can view api tokens page', function () {
    ApiToken::factory()->count(3)->create();

    actingAs($this->admin)
        ->get(route('admin.api-tokens.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('admin/api-tokens/index')
                ->has('tokens.data', 3)
        );
});

test('user cannot view api tokens page', function () {
    actingAs($this->user)
        ->get(route('admin.api-tokens.index'))
        ->assertForbidden();
});

test('guest cannot view api tokens page', function () {
    get(route('admin.api-tokens.index'))
        ->assertRedirect(route('login'));
});

test('admin can create api token', function () {
    $data = [
        'name' => 'My OpenAI Key',
        'provider' => 'openai',
        'token' => 'sk-1234567890',
        'is_active' => true,
    ];

    actingAs($this->admin)
        ->post(route('admin.api-tokens.store'), $data)
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('api_tokens', [
        'name' => 'My OpenAI Key',
        'provider' => 'openai',
        'token' => 'sk-1234567890',
        'is_active' => true,
    ]);
});

test('admin can update api token', function () {
    $token = ApiToken::factory()->create([
        'name' => 'Old Key',
        'is_active' => false,
    ]);

    $data = [
        'name' => 'New Key Title',
        'provider' => 'openai',
        'token' => 'sk-new123',
        'is_active' => true,
    ];

    actingAs($this->admin)
        ->put(route('admin.api-tokens.update', $token), $data)
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('api_tokens', [
        'id' => $token->id,
        'name' => 'New Key Title',
        'token' => 'sk-new123',
        'is_active' => true,
    ]);
});

test('admin can update api token without changing token string', function () {
    $token = ApiToken::factory()->create([
        'name' => 'Old Key',
        'token' => 'sk-old123',
    ]);

    $data = [
        'name' => 'New Key Title',
        'provider' => 'openai',
        'token' => '', // empty means don't change
        'is_active' => true,
    ];

    actingAs($this->admin)
        ->put(route('admin.api-tokens.update', $token), $data)
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('api_tokens', [
        'id' => $token->id,
        'name' => 'New Key Title',
        'token' => 'sk-old123',
    ]);
});

test('admin can delete api token', function () {
    $token = ApiToken::factory()->create();

    actingAs($this->admin)
        ->delete(route('admin.api-tokens.destroy', $token))
        ->assertRedirect();

    $this->assertDatabaseMissing('api_tokens', [
        'id' => $token->id,
    ]);
});

test('making a token active deactivates other tokens for the same provider', function () {
    $token1 = ApiToken::factory()->create([
        'provider' => 'openai',
        'is_active' => true,
    ]);

    $token2 = ApiToken::factory()->create([
        'provider' => 'openai',
        'is_active' => false,
    ]);

    $token3 = ApiToken::factory()->create([
        'provider' => 'anthropic',
        'is_active' => true,
    ]);

    // Update token 2 to be active
    actingAs($this->admin)
        ->put(route('admin.api-tokens.update', $token2), [
            'name' => 'New Key',
            'provider' => 'openai',
            'token' => 'sk-new',
            'is_active' => true,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    // token 1 should now be inactive, token 2 active, token 3 still active
    expect($token1->fresh()->is_active)->toBeFalse();
    expect($token2->fresh()->is_active)->toBeTrue();
    expect($token3->fresh()->is_active)->toBeTrue(); // different provider

    // Now create a new active openai token
    actingAs($this->admin)
        ->post(route('admin.api-tokens.store'), [
            'name' => 'Another Key',
            'provider' => 'openai',
            'token' => 'sk-another',
            'is_active' => true,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($token2->fresh()->is_active)->toBeFalse();

    $this->assertDatabaseHas('api_tokens', [
        'name' => 'Another Key',
        'is_active' => true,
    ]);
});

test('getActiveKey returns the currently active token key and updates last_used_at', function () {
    // Should be null initially
    expect(ApiToken::getActiveKey('openai'))->toBeNull();

    $token = ApiToken::factory()->create([
        'provider' => 'openai',
        'token' => 'sk-active123',
        'is_active' => true,
        'last_used_at' => null,
    ]);

    ApiToken::factory()->create([
        'provider' => 'openai',
        'token' => 'sk-inactive',
        'is_active' => false,
    ]);

    // Fast-forward so that `now()` works exactly and we can verify updating
    $now = now();
    $this->travelTo($now);

    $key = ApiToken::getActiveKey('openai');

    expect($key)->toBe('sk-active123');
    expect($token->fresh()->last_used_at->toDateTimeString())->toBe($now->toDateTimeString());
});
