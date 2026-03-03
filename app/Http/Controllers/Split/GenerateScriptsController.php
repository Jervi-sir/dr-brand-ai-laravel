<?php

namespace App\Http\Controllers\Split;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GenerateScriptsController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'userPrompt' => 'required|string|max:500',
            'topicPrompt' => 'nullable|string|max:500',
            'content_idea' => 'required|string',
            'hook_type' => 'required|string',
        ]);

        $validContentIdeas = config('split.content_ideas', []);
        $validHookTypes = config('split.hook_types', []);

        if (! in_array($validated['content_idea'], $validContentIdeas)) {
            return response()->json(['error' => 'Invalid content idea'], 422);
        }
        if (! in_array($validated['hook_type'], $validHookTypes)) {
            return response()->json(['error' => 'Invalid hook type'], 422);
        }

        // Check for active API key before dispatching
        if (! \App\Models\ApiToken::getActiveKey('openai')) {
            return response()->json(['error' => 'No active OpenAI API key found. Please add one in the admin dashboard.'], 500);
        }

        \App\Jobs\GenerateSplitScripts::dispatch(
            $request->user()->id,
            $validated['userPrompt'],
            $validated['topicPrompt'] ?? null,
            $validated['content_idea'],
            $validated['hook_type']
        );

        return response()->json([
            'status' => 'started',
            'message' => 'Script generation has started in the background.',
        ]);
    }
}
