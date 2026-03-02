<?php

namespace App\Jobs;

use App\Events\ChatContentReceived;
use App\Events\ChatErrorReceived;
use App\Events\ChatStreamFinished;
use App\Models\Chat;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Streaming\Events\StreamEnd;
use Laravel\Ai\Streaming\Events\TextDelta;

use function Laravel\Ai\agent;

class ProcessChatMessage implements ShouldQueue
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

        $userMessage = $chat->messages()->find($this->userMessageId);
        if (! $userMessage) {
            return;
        }

        $modelId = $userMessage->model_id;
        $aiModel = \App\Models\AiModel::find($modelId);
        $modelName = $aiModel?->name ?? 'gpt-4o-mini';

        // Build the conversation history for Laravel AI
        $history = $chat->messages()
            ->where('id', '<', $this->userMessageId)
            ->orderBy('created_at')
            ->get()
            ->map(fn (\App\Models\Message $msg) => new \Laravel\Ai\Messages\Message(
                $msg->role,
                is_array($msg->content) ? implode('', $msg->content) : (string) $msg->content
            ))
            ->toArray();

        $fullContent = '';
        $promptTokens = 0;
        $completionTokens = 0;
        $startTime = microtime(true);

        if ($key = \App\Models\ApiToken::getActiveKey('openai')) {
            config(['ai.providers.openai.key' => $key]);
        }

        try {
            $stream = agent(messages: $history)->stream($userMessage->content, model: $modelName);

            foreach ($stream as $event) {
                if ($event instanceof TextDelta) {
                    $delta = $event->delta;
                    if ($delta !== '') {
                        $fullContent .= $delta;
                        broadcast(new ChatContentReceived($this->chatId, $delta));
                    }
                } elseif ($event instanceof StreamEnd) {
                    if (isset($event->usage)) {
                        $promptTokens = $event->usage->promptTokens ?? 0;
                        $completionTokens = $event->usage->completionTokens ?? 0;
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error('Chat generating error: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
            broadcast(new ChatErrorReceived($this->chatId, 'Error: '.$e->getMessage()));

            return;
        }

        $duration = microtime(true) - $startTime;

        // Save the assistant message
        $assistantMessage = $chat->messages()->create([
            'role' => 'assistant',
            'content' => $fullContent,
            'model_id' => $modelId,
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'total_tokens' => $promptTokens + $completionTokens,
            'duration' => $duration,
        ]);

        // Auto-generate title logic
        if ($chat->messages()->count() <= 2) {
            $this->generateTitle($chat, $fullContent);
        }

        // Emit final Done event
        broadcast(new ChatStreamFinished(
            $this->chatId,
            $assistantMessage->id,
            $chat->fresh()->title,
            $promptTokens,
            $completionTokens,
            $promptTokens + $completionTokens,
            $duration
        ));
    }

    private function generateTitle(Chat $chat, string $assistantResponse): void
    {
        try {
            $result = agent(
                instructions: 'Generate a very short title (max 6 words) for this conversation. Return only the title, no quotes.',
                messages: [
                    new \Laravel\Ai\Messages\Message('user', $chat->messages()->first()->content),
                ]
            )->prompt(mb_substr($assistantResponse, 0, 200), model: 'gpt-4o-mini');

            $title = trim($result->text);
            $chat->update(['title' => $title]);
        } catch (\Throwable) {
            // Silently fail - title will remain as the first message excerpt
        }
    }
}
