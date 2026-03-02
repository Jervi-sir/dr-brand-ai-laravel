<?php

namespace App\Http\Controllers\Split;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaveScriptController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'userPrompt' => 'required|string',
            'topicPrompt' => 'nullable|string',
            'content_idea' => 'nullable|string',
            'hook_type' => 'nullable|string',
            'mood' => 'nullable|string',
            'generatedScript' => 'required|string',
            'stage' => 'required|string',
        ]);

        $id = DB::table('contents')->insertGetId([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'generated_script' => $validated['generatedScript'],
            'user_prompt' => $validated['userPrompt'],
            'content_idea' => $validated['content_idea'] ?? '',
            'hook_type' => $validated['hook_type'] ?? 'unknown',
            'mood' => $validated['mood'] ?? '',
            'stage' => $validated['stage'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'id' => $id]);
    }
}
