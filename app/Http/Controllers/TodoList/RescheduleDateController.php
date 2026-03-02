<?php

namespace App\Http\Controllers\TodoList;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RescheduleDateController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $todayMidnight = Carbon::today();

        $existingDeadlines = Content::query()
            ->where('user_id', $userId)
            ->where('stage', 'todo')
            ->where('deadline', '>', $todayMidnight)
            ->pluck('deadline')
            ->filter()
            ->map(fn ($d) => Carbon::parse($d));

        if ($existingDeadlines->isEmpty()) {
            $suggestedDate = Carbon::now()->addDay()->setTime(23, 0, 0);
        } else {
            $latestDeadline = $existingDeadlines->max();
            $suggestedDate = Carbon::parse($latestDeadline)->addDays(2)->setTime(23, 0, 0);
        }

        return response()->json([
            'suggestedDate' => $suggestedDate->toISOString(),
        ]);
    }
}
