<?php

namespace App\Http\Controllers\TodoList;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NextContentController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $excludeIds = array_filter(explode(',', $request->query('exclude', '')));

        $query = Content::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('stage', ['voice_over', 'creation']);

        if (count($excludeIds) > 0) {
            $query->whereNotIn('id', $excludeIds);
        }

        $next = $query->orderBy('created_at')->first();

        return response()->json($next);
    }
}
