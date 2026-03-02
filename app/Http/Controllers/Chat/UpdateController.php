<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, \App\Models\Chat $chat): \Illuminate\Http\JsonResponse
    {
        abort_unless($chat->user_id === \Illuminate\Support\Facades\Auth::id(), 403);

        $validated = $request->validate([
            'visibility' => ['nullable', 'string', 'in:public,private'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $chat->update($validated);

        return response()->json($chat);
    }
}
