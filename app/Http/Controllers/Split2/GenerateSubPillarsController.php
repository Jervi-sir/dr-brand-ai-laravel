<?php

namespace App\Http\Controllers\Split2;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GenerateSubPillarsController extends Controller
{
    private string $defaultModel = 'gpt-4o-mini';

    public function __invoke(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate(['userPrompt' => 'required|string']);

        $systemPrompt = 'You are Dr. Brand, a high-level Algerian content strategist. Your task is to generate a response in valid JSON format ONLY.
Given a user prompt describing a business/creator context, you must:
1. Identify the main content pillar (Algerian Darja, 3-5 words).
2. Generate 25 sub-pillars (Algerian Darja, each 5-10 words).
3. Derive a client persona (10-20 words in English).

Return JSON format:
{
  "contentPillar": "string",
  "subPillars": ["string"],
  "clientPersona": "string"
}';

        $apiKey = \App\Models\ApiToken::getActiveKey('openai');
        if (! $apiKey) {
            return response()->json(['error' => 'API Key configuration is missing.'], 500);
        }

        $response = Http::withToken($apiKey)
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $this->defaultModel,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => 'User Prompt: ' . $request->userPrompt],
                ],
                'temperature' => 1,
            ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Failed to generate sub-pillars'], 500);
        }

        $text = $response->json('choices.0.message.content', '');
        $cleanedText = trim(preg_replace('/^```json\s*|\s*```$/i', '', $text));

        try {
            $data = json_decode($cleanedText, true, 512, JSON_THROW_ON_ERROR);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid AI response'], 500);
        }

        return response()->json([
            'contentPillar' => $data['contentPillar'] ?? '',
            'clientPersona' => $data['clientPersona'] ?? '',
            'subPillars' => collect($data['subPillars'] ?? [])->map(fn($sp) => ['value' => $sp, 'label' => $sp]),
        ]);
    }
}
