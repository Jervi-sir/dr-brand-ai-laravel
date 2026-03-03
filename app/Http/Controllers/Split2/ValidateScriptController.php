<?php

namespace App\Http\Controllers\Split2;

use App\Http\Controllers\Controller;
use App\Models\SplitPromptHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ValidateScriptController extends Controller
{
    public function __invoke(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'userPrompt' => 'required|string',
            'chosenSubPillars' => 'required|array',
            'hookType' => 'nullable|string',
            'script.subtitle' => 'required|string',
            'script.content' => 'required|string',
        ]);

        $id = DB::table('contents')->insertGetId([
            'user_id' => $request->user()->id,
            'title' => $request->input('script.subtitle'),
            'generated_script' => $request->input('script.content'),
            'user_prompt' => $request->userPrompt,
            'content_idea' => implode(', ', tap($request->chosenSubPillars, function (&$v) {
                if (isset($v[0]) && is_array($v[0])) {
                    $v = array_column($v, 'value');
                }
            })),
            'hook_type' => $request->input('hookType', 'unknown'),
            'mood' => implode(', ', tap($request->chosenSubPillars, function (&$v) {
                if (isset($v[0]) && is_array($v[0])) {
                    $v = array_column($v, 'value');
                }
            })),
            'stage' => 'script',
            'created_at' => now(),
            'updated_at' => now(),
            'model' => SplitPromptHistory::getSelectedModelName(),
        ]);

        return response()->json(['id' => $id]);
    }
}
