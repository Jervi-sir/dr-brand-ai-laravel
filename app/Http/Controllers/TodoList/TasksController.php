<?php

namespace App\Http\Controllers\TodoList;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TasksController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $excludeIds = array_filter(explode(',', $request->query('exclude', '')));

        $yesterday = Carbon::today()->subDay();

        $query = Content::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('stage', ['script', 'voice_over', 'creation'])
            ->where('deadline', '>=', $yesterday);

        if (count($excludeIds) > 0) {
            $query->whereNotIn('id', $excludeIds);
        }

        $tasks = $query
            ->orderBy('deadline')
            ->limit(3)
            ->get()
            ->unique('id')
            ->take(3)
            ->values();

        return response()->json($tasks);
    }
}
