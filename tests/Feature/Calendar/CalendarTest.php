<?php

use App\Models\Content;
use App\Models\User;
use Carbon\Carbon;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('guests are redirected to the login page', function () {
    auth()->logout();
    $this->get(route('calendar.index'))->assertRedirect(route('login'));
});

test('authenticated users can visit the calendar page', function () {
    $this->get(route('calendar.index'))->assertOk();
});

test('events endpoint requires month parameter', function () {
    $this->getJson(route('calendar.events'))->assertStatus(400);
});

test('events endpoint returns formatted events for given month', function () {
    $deadline = Carbon::create(2026, 3, 15);
    Content::factory()->create([
        'user_id' => $this->user->id,
        'stage' => 'voice_over',
        'deadline' => $deadline,
        'mood' => 'blue',
    ]);

    Content::factory()->create([
        'user_id' => $this->user->id,
        'stage' => 'script',
        'deadline' => $deadline,
    ]);

    $response = $this->getJson(route('calendar.events', ['month' => '2026-03']));

    $response->assertSuccessful();
    $data = $response->json();
    expect($data)->toHaveCount(1);
    expect($data[0])->toHaveKeys(['id', 'userId', 'title', 'color', 'stage', 'endDate']);
    expect($data[0]['stage'])->toBe('voice_over');
    expect($data[0]['color'])->toBe('blue');
});

test('events endpoint excludes script stage content', function () {
    Content::factory()->create([
        'user_id' => $this->user->id,
        'stage' => 'script',
        'deadline' => Carbon::create(2026, 3, 15),
    ]);

    $response = $this->getJson(route('calendar.events', ['month' => '2026-03']));

    $response->assertSuccessful();
    expect($response->json())->toHaveCount(0);
});

test('updating an event works', function () {
    $content = Content::factory()->voiceOver()->create([
        'user_id' => $this->user->id,
    ]);

    $response = $this->patchJson(route('calendar.events.update', $content->id), [
        'title' => 'Updated Title',
        'generatedScript' => '<p>New script</p>',
    ]);

    $response->assertSuccessful();
    $data = $response->json();
    expect($data['title'])->toBe('Updated Title');
    expect($data['generatedScript'])->toBe('<p>New script</p>');
    expect($content->fresh()->title)->toBe('Updated Title');
    expect($content->fresh()->generated_script)->toBe('<p>New script</p>');
});

test('updating another users event returns 404', function () {
    $otherUser = User::factory()->create();
    $content = Content::factory()->voiceOver()->create([
        'user_id' => $otherUser->id,
    ]);

    $this->patchJson(route('calendar.events.update', $content->id), [
        'title' => 'Should not update',
    ])->assertNotFound();
});

test('deleting an event works', function () {
    $content = Content::factory()->voiceOver()->create([
        'user_id' => $this->user->id,
    ]);

    $this->deleteJson(route('calendar.events.destroy', $content->id))->assertSuccessful();
    expect(Content::find($content->id))->toBeNull();
});

test('deleting another users event returns 404', function () {
    $otherUser = User::factory()->create();
    $content = Content::factory()->voiceOver()->create([
        'user_id' => $otherUser->id,
    ]);

    $this->deleteJson(route('calendar.events.destroy', $content->id))->assertNotFound();
});
