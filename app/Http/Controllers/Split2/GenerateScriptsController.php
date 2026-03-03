<?php

namespace App\Http\Controllers\Split2;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GenerateScriptsController extends Controller
{
    private string $defaultModel = 'gpt-4o-mini';

    public function __invoke(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'userPrompt' => 'required|string',
            'clientPersona' => 'required|string',
            'contentPillar' => 'required|string',
            'subPillars' => 'required|array',
            'chosenSubPillars' => 'required|array',
            'hookType' => 'required|array',
        ]);

        if (! \App\Models\ApiToken::getActiveKey('openai')) {
            return response()->json(['error' => 'API Key configuration is missing.'], 500);
        }

        \App\Jobs\GenerateSplit2Scripts::dispatch(
            $request->user()->id,
            $request->all(),
            false
        );

        return response()->json([
            'status' => 'started',
            'message' => 'Generation started in background.',
        ]);
    }
}
