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

        $hookTypesList = config('split.hook_types', []);
        $hookTypeIndex = array_search($validated['hook_type'], $hookTypesList);
        $hookTypeIndex = $hookTypeIndex !== false ? (string) ($hookTypeIndex + 1) : '1';

        $hookPromptsArray = config("split.hook_type_prompts.{$hookTypeIndex}", config('split.hook_type_prompts.1', []));
        $hookPrompts = implode("\n", array_slice($hookPromptsArray, 0, 3));

        $agent = new \App\Ai\Agents\SplitScriptGenerator(
            userPrompt: $validated['userPrompt'],
            topicPrompt: $validated['topicPrompt'] ?? null,
            contentIdea: $validated['content_idea'],
            hookType: $validated['hook_type'],
            hookPrompts: $hookPrompts
        );

        $response = $agent->prompt('Generate the scripts now.');

        $scripts = $response['scripts'] ?? [];

        $history = \App\Models\ScriptHistory::create([
            'user_id' => $request->user()->id,
            'user_prompt' => $validated['userPrompt'],
            'topic_prompt' => $validated['topicPrompt'] ?? null,
            'content_idea' => $validated['content_idea'],
            'hook_type' => $validated['hook_type'],
            'generated_scripts' => $scripts,
            'used_model_id' => 'gpt-4o-mini',
            'token_usage' => [
                'total_tokens' => 0,
            ],
        ]);

        return response()->json([
            'scripts' => $scripts,
            'historyId' => $history->id,
            'title' => 'Generated Scripts',
            'usedModelId' => 'gpt-4o-mini',
            'tokenUsage' => [
                'prompt_tokens' => 0,
                'completion_tokens' => 0,
                'total_tokens' => 0,
            ],
        ]);
    }
}
