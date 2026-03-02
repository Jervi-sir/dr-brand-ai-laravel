<?php

namespace App\Http\Controllers\Split2;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class GenerateAutomaticScriptController extends Controller
{
    private string $defaultModel = 'gpt-4o-mini';

    public function __invoke(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'userPrompt' => 'required|string',
            'clientPersona' => 'required|string',
            'contentPillar' => 'required|string',
            'subPillars' => 'required|array',
            'hookType' => 'required|array',
            'chosenSubPillars' => 'required|array',
        ]);

        $systemPrompt = "You are Dr. Brand, a viral Algerian content strategist. Generate strictly JSON.
Generate AT LEAST 6 Instagram Reels scripts based on the user's details. Each script must have:
- subtitle (3-5 words in Algerian Darja)
- content (HTML string with <p> tags, 3-4 sentences in Algerian Darja)
Return JSON format:
{
  \"scripts\": [
    { \"subtitle\": \"string\", \"content\": \"string\" }
  ]
}";
        $key = \App\Models\ApiToken::getActiveKey('openai');
        $response = Http::withToken($key)
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $this->defaultModel,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => json_encode($request->all())],
                ],
                'temperature' => 1,
            ]);

        $text = $response->json('choices.0.message.content', '');
        $cleanedText = trim(preg_replace('/^```json\s*|\s*```$/i', '', $text));
        $data = json_decode($cleanedText, true) ?? [];

        $scripts = $data['scripts'] ?? [];

        $id = DB::table('generated_split_history')->insertGetId([
            'user_id' => $request->user()->id,
            'prompt' => $request->userPrompt,
            'client_persona' => $request->clientPersona,
            'content_pillar' => $request->contentPillar,
            'sub_pillars' => json_encode($request->subPillars),
            'chosen_sub_pillars' => json_encode($request->chosenSubPillars),
            'hook_type' => json_encode($request->hookType),
            'scripts' => json_encode($scripts),
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'scripts' => $scripts,
            'historyId' => $id,
        ]);
    }
}
