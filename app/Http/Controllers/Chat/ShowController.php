<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ShowController extends Controller
{
    public function __invoke(Chat $chat): Response
    {
        abort_unless($chat->user_id === Auth::id(), 403);

        $messages = $chat->messages()
            ->orderBy('created_at')
            ->get(['id', 'role', 'content', 'model_id', 'created_at', 'prompt_tokens', 'completion_tokens', 'total_tokens', 'duration']);

        $aiModels = \App\Models\AiModel::query()
            ->where('is_active', true)->get();

        $selectedModelId = $messages->last()?->model_id;

        return Inertia::render('chat/index', [
            'chat' => $chat->only(['id', 'title', 'visibility']),
            'initialMessages' => $messages,
            'aiModels' => $aiModels,
            'selectedModelId' => $selectedModelId,
        ]);
    }
}
