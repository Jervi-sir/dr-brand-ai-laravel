<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteContentController extends Controller
{
    public function __invoke(Request $request, string $id): JsonResponse
    {
        $deleted = Content::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if ($deleted === 0) {
            return response()->json(['error' => 'Content not found or unauthorized'], 404);
        }

        return response()->json(['message' => 'Content deleted']);
    }
}
