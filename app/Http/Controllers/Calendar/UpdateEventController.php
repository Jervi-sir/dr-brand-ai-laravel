<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateEventController extends Controller
{
    public function __invoke(Request $request, string $id): JsonResponse
    {
        $content = Content::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $content) {
            return response()->json(['error' => 'Content not found or unauthorized'], 404);
        }

        $data = [];

        if ($request->has('title')) {
            $data['title'] = $request->input('title');
        }

        if ($request->has('userPrompt')) {
            $data['user_prompt'] = $request->input('userPrompt');
        }

        if ($request->has('generatedScript')) {
            $data['generated_script'] = $request->input('generatedScript');
        }

        $content->update($data);
        $content->refresh();

        return response()->json([
            'id' => $content->id,
            'userId' => $content->user_id,
            'title' => $content->title,
            'userPrompt' => $content->user_prompt,
            'generatedScript' => $content->generated_script,
            'color' => $content->mood,
            'stage' => $content->stage,
            'endDate' => $content->deadline ? $content->deadline->toISOString() : now()->toISOString(),
        ]);
    }
}
