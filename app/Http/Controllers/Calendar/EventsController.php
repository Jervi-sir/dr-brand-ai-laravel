<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $month = $request->query('month');

        if (! $month) {
            return response()->json(['error' => 'Month parameter required'], 400);
        }

        $currentMonth = Carbon::parse($month.'-01');
        $startOfRange = $currentMonth->copy()->subMonth()->startOfMonth();
        $endOfRange = $currentMonth->copy()->addMonth()->endOfMonth();

        $events = Content::query()
            ->where('user_id', $request->user()->id)
            ->where('stage', '!=', 'script')
            ->where('deadline', '>=', $startOfRange)
            ->where('deadline', '<=', $endOfRange)
            ->whereNotNull('deadline')
            ->orderBy('deadline')
            ->get()
            ->map(fn (Content $event) => [
                'id' => $event->id,
                'userId' => $event->user_id,
                'title' => $event->title,
                'userPrompt' => $event->user_prompt,
                'generatedScript' => $event->generated_script,
                'color' => $event->mood ?? 'blue',
                'stage' => $event->stage,
                'endDate' => $event->deadline->toISOString(),
            ]);

        return response()->json($events);
    }
}
