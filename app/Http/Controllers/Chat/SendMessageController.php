<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SendMessageController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:10000'],
            'chat_id' => ['nullable', 'integer', 'exists:chats,id'],
            'model_id' => ['nullable', 'integer', 'exists:ai_models,id'],
            'visibility' => ['nullable', 'string', 'in:public,private'],
        ]);

        $user = Auth::user();

        // Create or find the chat
        if (! empty($validated['chat_id'])) {
            $chat = Chat::query()->where('id', $validated['chat_id'])
                ->where('user_id', $user->id)
                ->firstOrFail();
        } else {
            $chat = Chat::query()->create([
                'user_id' => $user->id,
                'title' => mb_substr($validated['message'], 0, 100),
                'visibility' => $validated['visibility'] ?? 'private',
            ]);
        }

        // Save the user message
        $userMessage = $chat->messages()->create([
            'role' => 'user',
            'content' => $validated['message'],
            'model_id' => $validated['model_id'] ?? null,
        ]);

        // Dispatch the background AI job to broadcast text chunks!
        \App\Jobs\ProcessChatMessage::dispatch(
            $chat->id,
            $userMessage->id
        );

        return response()->json([
            'chat_id' => $chat->id,
            'user_message_id' => $userMessage->id,
        ]);
    }
}
