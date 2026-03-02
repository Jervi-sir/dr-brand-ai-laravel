<?php

use App\Models\Chat;
use App\Models\Message;
use App\Models\User;

test('guests are redirected from chat index', function () {
    $this->get(route('chat.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can visit the chat index', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('chat.index'))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('chat/index')
        );
});

test('authenticated users can view their own chat', function () {
    $user = User::factory()->create();
    $chat = Chat::factory()->for($user)->create();
    Message::factory()->for($chat)->fromUser()->create(['content' => 'Hello']);
    Message::factory()->for($chat)->fromAssistant()->create(['content' => 'Hi there!']);

    $this->actingAs($user);

    $this->get(route('chat.show', $chat))
        ->assertOk()
        ->assertInertia(
            fn ($page) => $page
                ->component('chat/index')
                ->has('chat')
                ->has('initialMessages', 2)
        );
});

test('users cannot view another users chat', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $chat = Chat::factory()->for($otherUser)->create();

    $this->actingAs($user);

    $this->get(route('chat.show', $chat))
        ->assertForbidden();
});

test('users can get their chat history', function () {
    $user = User::factory()->create();
    Chat::factory()->for($user)->count(3)->create();
    Chat::factory()->create(); // Another user's chat

    $this->actingAs($user);

    $this->getJson(route('chat.history'))
        ->assertSuccessful()
        ->assertJsonCount(3);
});

test('users can delete their own chat', function () {
    $user = User::factory()->create();
    $chat = Chat::factory()->for($user)->create();

    $this->actingAs($user);

    $this->deleteJson(route('chat.destroy', $chat))
        ->assertSuccessful();

    $this->assertSoftDeleted('chats', ['id' => $chat->id]);
});

test('users cannot delete another users chat', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $chat = Chat::factory()->for($otherUser)->create();

    $this->actingAs($user);

    $this->deleteJson(route('chat.destroy', $chat))
        ->assertForbidden();
});

test('send message requires a message body', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson(route('chat.send'), [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['message']);
});

test('send message creates a new chat when no chat_id is provided', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Mock OpenAI - we can't actually call the API in tests
    // Instead, just test the validation and initial chat creation path
    $this->assertDatabaseCount('chats', 0);

    // This will fail because OpenAI is not configured, but the chat should be created
    try {
        $response = $this->post(route('chat.send'), [
            'message' => 'Hello, how are you?',
            'model' => 'gpt-4o-mini',
            'visibility' => 'private',
        ]);
    } catch (\Throwable) {
        // Expected - OpenAI API key is not set in tests
    }

    // The chat should have been created before the API call
    $this->assertDatabaseHas('chats', [
        'user_id' => $user->id,
        'visibility' => 'private',
    ]);
});
