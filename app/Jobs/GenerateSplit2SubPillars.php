<?php

namespace App\Jobs;

use App\Events\Split2ErrorReceived;
use App\Events\Split2SubPillarsGenerated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateSplit2SubPillars implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120;

    public function __construct(
        public int $userId,
        public string $userPrompt,
        public bool $isAutomatic = false
    ) {}

    public function handle(): void
    {
        Log::info('GenerateSplit2SubPillars Job started', ['userId' => $this->userId, 'isAutomatic' => $this->isAutomatic]);
        try {
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
                throw new \Exception('API Key configuration is missing.');
            }

            $response = Http::withToken($apiKey)
                ->timeout(100)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => 'User Prompt: ' . $this->userPrompt],
                    ],
                    'temperature' => 1,
                ]);

            if ($response->failed()) {
                throw new \Exception('Failed to generate sub-pillars: ' . $response->body());
            }

            $text = $response->json('choices.0.message.content', '');
            $cleanedText = trim(preg_replace('/^```json\s*|\s*```$/i', '', $text));
            $data = json_decode($cleanedText, true, 512, JSON_THROW_ON_ERROR);

            $subPillarsRaw = $data['subPillars'] ?? [];

            Log::info('Broadcasting Split2SubPillarsGenerated', ['userId' => $this->userId]);
            event(new Split2SubPillarsGenerated(
                userId: $this->userId,
                contentPillar: $data['contentPillar'] ?? '',
                clientPersona: $data['clientPersona'] ?? '',
                subPillars: $subPillarsRaw
            ));

            if ($this->isAutomatic) {
                Log::info('Dispatching GenerateSplit2Scripts (Automatic)', ['userId' => $this->userId]);

                $hooksList = [
                    'fix-a-problem',
                    'quick-wins',
                    'reactions-reviews',
                    'personal-advice',
                    'step-by-step-guides',
                    'curiosity-surprises',
                    'direct-targeting',
                ];

                $chosenSubPillars = array_slice($subPillarsRaw, 0, 5);

                GenerateSplit2Scripts::dispatch(
                    $this->userId,
                    [
                        'userPrompt' => $this->userPrompt,
                        'clientPersona' => $data['clientPersona'] ?? '',
                        'contentPillar' => $data['contentPillar'] ?? '',
                        'subPillars' => collect($subPillarsRaw)->map(fn($sp) => ['value' => $sp, 'label' => $sp])->toArray(),
                        'chosenSubPillars' => $chosenSubPillars,
                        'hookType' => $hooksList,
                    ],
                    true
                );
            }
        } catch (\Exception $e) {
            Log::error('GenerateSplit2SubPillars Job failed: ' . $e->getMessage());
            event(new Split2ErrorReceived(
                userId: $this->userId,
                error: $e->getMessage(),
                type: 'sub_pillars'
            ));
        }
    }
}
