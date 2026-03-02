<?php

namespace App\Http\Controllers\TodoList;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoiceOverController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $contentIds = $request->input('contentIds', []);
        $userId = $request->user()->id;

        if (! is_array($contentIds) || count($contentIds) === 0) {
            return response()->json(['error' => 'No content IDs provided'], 400);
        }

        $existingCount = Content::query()
            ->where('user_id', $userId)
            ->whereIn('id', $contentIds)
            ->count();

        if ($existingCount !== count($contentIds)) {
            return response()->json(['error' => 'One or more content items not found or unauthorized'], 404);
        }

        $todayMidnight = Carbon::today();
        $minSchedulingDate = $todayMidnight->copy()->addDays(3)->setTime(23, 0, 0);

        $existingDeadlines = Content::query()
            ->where('user_id', $userId)
            ->where('stage', 'voice_over')
            ->where('deadline', '>=', $todayMidnight)
            ->orderBy('deadline')
            ->pluck('deadline')
            ->filter()
            ->map(fn ($d) => Carbon::parse($d)->setTime(23, 0, 0));

        $startSchedulingDate = $minSchedulingDate->copy();

        if ($existingDeadlines->isNotEmpty()) {
            $latestDeadline = $existingDeadlines->last();
            $nextAvailableFromLatest = $latestDeadline->copy()->addDays(2);

            if ($nextAvailableFromLatest->greaterThan($startSchedulingDate)) {
                $startSchedulingDate = $nextAvailableFromLatest;
            }
        }

        $updatedContent = collect();

        foreach ($contentIds as $index => $contentId) {
            $deadline = $startSchedulingDate->copy()->addDays(2 * $index)->setTime(23, 0, 0);

            $content = Content::query()
                ->where('id', $contentId)
                ->where('user_id', $userId)
                ->first();

            if ($content) {
                $content->update([
                    'stage' => 'voice_over',
                    'deadline' => $deadline,
                    'scheduled_date' => null,
                ]);
                $content->refresh();
                $updatedContent->push($content);
            }
        }

        return response()->json($updatedContent->values());
    }
}
