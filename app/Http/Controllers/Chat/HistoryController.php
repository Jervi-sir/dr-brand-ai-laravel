<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class HistoryController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $chats = Chat::query()
            ->where('user_id', Auth::id())
            ->orderByDesc('updated_at')
            ->select(['id', 'title', 'visibility', 'created_at', 'updated_at'])
            ->get();

        return response()->json($chats);
    }
}
