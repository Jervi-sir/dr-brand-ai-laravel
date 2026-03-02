<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RescheduleController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $contentId = $request->input('contentId');
        $newDeadline = $request->input('newDeadline');
        $userId = $request->user()->id;

        if (! $contentId || ! $newDeadline) {
            return response()->json(['error' => 'Content ID and new deadline are required'], 400);
        }

        $content = Content::query()
            ->where('user_id', $userId)
            ->where('id', $contentId)
            ->first();

        if (! $content) {
            return response()->json(['error' => 'Content item not found or unauthorized'], 404);
        }

        $deadline = Carbon::parse($newDeadline)->setTime(23, 0, 0);

        $content->update([
            'stage' => 'voice_over',
            'deadline' => $deadline,
            'scheduled_date' => null,
        ]);

        $content->refresh();

        return response()->json($content);
    }
}
