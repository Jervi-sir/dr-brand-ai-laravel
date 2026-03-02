<?php

use App\Jobs\ProcessChatMessage;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

it('creates a new chat and queues ProcessChatMessage', function () {
    Queue::fake();

    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/chat/send', [
        'message' => 'Hello, AI!',
        'model' => 'gpt-4o-mini',
        'visibility' => 'private',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['chat_id', 'user_message_id']);

    $chat = Chat::where('user_id', $user->id)->first();
    expect($chat)->not()->toBeNull()
        ->and($chat->messages)->toHaveCount(1)
        ->and($chat->messages[0]->content)->toBe('Hello, AI!');

    Queue::assertPushed(ProcessChatMessage::class, function ($job) use ($chat) {
        return $job->chatId === $chat->id && $job->userMessageId === $chat->messages->last()->id;
    });
});

it('appends to an existing chat and queues ProcessChatMessage', function () {
    Queue::fake();

    $user = User::factory()->create();
    $chat = Chat::forceCreate(['user_id' => $user->id, 'title' => 'Old Title', 'visibility' => 'private']);

    $response = $this->actingAs($user)->postJson('/chat/send', [
        'chat_id' => $chat->id,
        'message' => 'I am back!',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['chat_id', 'user_message_id']);

    $chat = $chat->fresh();
    expect($chat->messages)->toHaveCount(1)
        ->and($chat->messages->last()->content)->toBe('I am back!');

    Queue::assertPushed(ProcessChatMessage::class, function ($job) use ($chat) {
        return $job->chatId === $chat->id && $job->userMessageId === $chat->messages->last()->id;
    });
});
