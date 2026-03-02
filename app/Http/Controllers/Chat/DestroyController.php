<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DestroyController extends Controller
{
    public function __invoke(Chat $chat): JsonResponse
    {
        abort_unless($chat->user_id === Auth::id(), 403);

        $chat->delete();

        return response()->json(['success' => true]);
    }
}
