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
    $this->get(route('todoList.index'))->assertRedirect(route('login'));
});

test('authenticated users can visit the todo list page', function () {
    $this->get(route('todoList.index'))->assertOk();
});

test('fetching tasks returns voice_over and creation tasks', function () {
    Content::factory()->voiceOver()->create(['user_id' => $this->user->id]);
    Content::factory()->creation()->create(['user_id' => $this->user->id]);
    Content::factory()->create(['user_id' => $this->user->id, 'stage' => 'script']);

    $response = $this->getJson(route('todoList.tasks'));

    $response->assertSuccessful();
    $data = $response->json();
    expect($data)->toHaveCount(2);
    expect(collect($data)->pluck('stage')->toArray())
        ->each->toBeIn(['voice_over', 'creation']);
});

test('fetching tasks excludes given IDs', function () {
    $task1 = Content::factory()->voiceOver()->create(['user_id' => $this->user->id]);
    $task2 = Content::factory()->creation()->create(['user_id' => $this->user->id]);

    $response = $this->getJson(route('todoList.tasks', ['exclude' => $task1->id]));

    $response->assertSuccessful();
    $data = $response->json();
    expect($data)->toHaveCount(1);
    expect($data[0]['id'])->toBe($task2->id);
});

test('fetching scripts returns paginated script-stage content', function () {
    Content::factory(15)->create(['user_id' => $this->user->id, 'stage' => 'script']);
    Content::factory()->voiceOver()->create(['user_id' => $this->user->id]);

    $response = $this->getJson(route('todoList.scripts', ['page' => 1, 'limit' => 10]));

    $response->assertSuccessful();
    $data = $response->json();
    expect($data['scripts'])->toHaveCount(10);
    expect($data['total'])->toBe(15);
    expect($data['page'])->toBe(1);
});

test('updating a content script works', function () {
    $content = Content::factory()->create([
        'user_id' => $this->user->id,
        'stage' => 'script',
    ]);

    $response = $this->putJson(route('todoList.scripts.update', $content->id), [
        'generated_script' => '<p>Updated content</p>',
    ]);

    $response->assertSuccessful();
    expect($content->fresh()->generated_script)->toBe('<p>Updated content</p>');
});

test('updating content for another user returns 404', function () {
    $otherUser = User::factory()->create();
    $content = Content::factory()->create([
        'user_id' => $otherUser->id,
        'stage' => 'script',
    ]);

    $this->putJson(route('todoList.scripts.update', $content->id), [
        'generated_script' => '<p>Hack attempt</p>',
    ])->assertNotFound();
});

test('deleting a content item works', function () {
    $content = Content::factory()->create([
        'user_id' => $this->user->id,
        'stage' => 'script',
    ]);

    $this->deleteJson(route('todoList.scripts.destroy', $content->id))->assertSuccessful();
    expect(Content::find($content->id))->toBeNull();
});

test('scheduling voice-overs sets deadlines', function () {
    $scripts = Content::factory(2)->create([
        'user_id' => $this->user->id,
        'stage' => 'script',
    ]);

    $response = $this->postJson(route('todoList.voiceOver'), [
        'contentIds' => $scripts->pluck('id')->toArray(),
    ]);

    $response->assertSuccessful();
    $data = $response->json();
    expect($data)->toHaveCount(2);
    foreach ($data as $item) {
        expect($item['stage'])->toBe('voice_over');
        expect($item['deadline'])->not->toBeNull();
    }
});

test('voice-over rejects empty content IDs', function () {
    $this->postJson(route('todoList.voiceOver'), [
        'contentIds' => [],
    ])->assertStatus(400);
});

test('rescheduling a task updates deadline', function () {
    $content = Content::factory()->voiceOver()->create([
        'user_id' => $this->user->id,
    ]);

    $newDeadline = Carbon::now()->addDays(5)->format('Y-m-d');

    $response = $this->postJson(route('todoList.reschedule'), [
        'contentId' => $content->id,
        'newDeadline' => $newDeadline,
    ]);

    $response->assertSuccessful();
    expect($content->fresh()->deadline->format('Y-m-d'))->toBe($newDeadline);
});

test('reschedule date endpoint returns a suggested date', function () {
    $response = $this->getJson(route('todoList.rescheduleDate'));

    $response->assertSuccessful();
    $data = $response->json();
    expect($data)->toHaveKey('suggestedDate');
});

test('fetching next content returns earliest available task', function () {
    $first = Content::factory()->voiceOver()->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subDay(),
    ]);
    Content::factory()->creation()->create([
        'user_id' => $this->user->id,
        'created_at' => now(),
    ]);

    $response = $this->getJson(route('todoList.nextContent'));

    $response->assertSuccessful();
    expect($response->json('id'))->toBe($first->id);
});
