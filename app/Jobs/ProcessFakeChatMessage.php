<?php

namespace App\Jobs;

use App\Events\ChatContentReceived;
use App\Events\ChatStreamFinished;
use App\Models\Chat;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessFakeChatMessage implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $chatId,
        public int $userMessageId
    ) {}

    public function handle(): void
    {
        $chat = Chat::find($this->chatId);
        if (! $chat) {
            return;
        }

        $startTime = microtime(true);
        $lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
        $lorem = str_repeat($lorem.' ', 3); // Make it longer

        $words = explode(' ', $lorem);
        $fullContent = '';

        foreach ($words as $word) {
            $chunk = $word.' ';
            $fullContent .= $chunk;

            broadcast(new ChatContentReceived($this->chatId, $chunk));

            // Simulate typing latency: very fast, between 2ms and 10ms per word
            usleep(random_int(2000, 10000));
        }

        $userMessage = $chat->messages()->find($this->userMessageId);
        $modelId = $userMessage?->model_id;

        $duration = microtime(true) - $startTime;

        // Save the assistant message
        $assistantMessage = $chat->messages()->create([
            'role' => 'assistant',
            'content' => $fullContent,
            'model_id' => $modelId,
            'prompt_tokens' => 10,
            'completion_tokens' => count($words),
            'total_tokens' => 10 + count($words),
            'duration' => $duration,
        ]);

        // Auto-generate title logic
        if ($chat->messages()->count() <= 2) {
            $titleWords = array_slice($words, 0, 5);
            $title = 'Fake Title '.implode(' ', $titleWords);
            $chat->update(['title' => $title]);
        }

        // Emit final Done event
        broadcast(new ChatStreamFinished($this->chatId, $assistantMessage->id, $chat->fresh()->title));
    }
}
