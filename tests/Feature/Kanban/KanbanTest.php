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
    $this->get(route('kanban.index'))->assertRedirect(route('login'));
});

test('authenticated users can visit the kanban page', function () {
    $this->get(route('kanban.index'))->assertOk();
});

test('board endpoint returns tasks within date range', function () {
    $inRange = Content::factory()->create([
        'user_id' => $this->user->id,
        'stage' => 'voice_over',
        'deadline' => Carbon::today()->addDays(2),
    ]);

    $outOfRange = Content::factory()->create([
        'user_id' => $this->user->id,
        'stage' => 'creation',
        'deadline' => Carbon::today()->addDays(30),
    ]);

    $from = Carbon::today()->toISOString();
    $to = Carbon::today()->addDays(6)->toISOString();

    $response = $this->getJson(route('kanban.board', ['from' => $from, 'to' => $to]));

    $response->assertSuccessful();
    $ids = collect($response->json())->pluck('id')->toArray();
    expect($ids)->toContain($inRange->id);
    expect($ids)->not->toContain($outOfRange->id);
});

test('board defaults to current week when no params given', function () {
    Content::factory()->create([
        'user_id' => $this->user->id,
        'stage' => 'voice_over',
        'deadline' => Carbon::today()->addDays(2),
    ]);

    $response = $this->getJson(route('kanban.board'));

    $response->assertSuccessful();
});

test('only includes voice_over, creation, and done stages', function () {
    Content::factory()->create([
        'user_id' => $this->user->id,
        'stage' => 'script',
        'deadline' => Carbon::today()->addDays(2),
    ]);
    Content::factory()->create([
        'user_id' => $this->user->id,
        'stage' => 'voice_over',
        'deadline' => Carbon::today()->addDays(2),
    ]);

    $response = $this->getJson(route('kanban.board', [
        'from' => Carbon::today()->toISOString(),
        'to' => Carbon::today()->addDays(6)->toISOString(),
    ]));

    $data = $response->json();
    expect($data)->toHaveCount(1);
    expect($data[0]['stage'])->toBe('voice_over');
});

test('scripts endpoint returns paginated script content', function () {
    Content::factory(5)->create(['user_id' => $this->user->id, 'stage' => 'script']);
    Content::factory()->voiceOver()->create(['user_id' => $this->user->id]);

    $response = $this->getJson(route('kanban.scripts', ['page' => 1, 'limit' => 3]));

    $response->assertSuccessful();
    $data = $response->json();
    expect($data['scripts'])->toHaveCount(3);
    expect($data['total'])->toBe(5);
});

test('updating content stage works', function () {
    $content = Content::factory()->voiceOver()->create([
        'user_id' => $this->user->id,
    ]);

    $response = $this->putJson(route('kanban.content.update', $content->id), [
        'stage' => 'creation',
    ]);

    $response->assertSuccessful();
    expect($content->fresh()->stage)->toBe('creation');
});

test('deleting content works', function () {
    $content = Content::factory()->voiceOver()->create([
        'user_id' => $this->user->id,
    ]);

    $this->deleteJson(route('kanban.content.destroy', $content->id))->assertSuccessful();
    expect(Content::find($content->id))->toBeNull();
});

test('scheduling voice-overs assigns deadlines', function () {
    $scripts = Content::factory(2)->create([
        'user_id' => $this->user->id,
        'stage' => 'script',
    ]);

    $response = $this->postJson(route('kanban.voiceOver'), [
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

test('rescheduling content updates the deadline', function () {
    $content = Content::factory()->voiceOver()->create([
        'user_id' => $this->user->id,
    ]);

    $newDeadline = Carbon::now()->addDays(5)->format('Y-m-d');

    $response = $this->postJson(route('kanban.reschedule'), [
        'contentId' => $content->id,
        'newDeadline' => $newDeadline,
    ]);

    $response->assertSuccessful();
    expect($content->fresh()->deadline->format('Y-m-d'))->toBe($newDeadline);
});

test('reschedule date suggests a future date', function () {
    $response = $this->getJson(route('kanban.rescheduleDate'));

    $response->assertSuccessful();
    expect($response->json())->toHaveKey('suggestedDate');
});
