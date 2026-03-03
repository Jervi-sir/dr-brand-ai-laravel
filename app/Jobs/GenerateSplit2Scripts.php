<?php

namespace App\Jobs;

use App\Events\Split2ErrorReceived;
use App\Events\Split2ScriptsGenerated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateSplit2Scripts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 150;

    public function __construct(
        public int $userId,
        public array $data,
        public bool $isAutomatic = false
    ) {}

    public function handle(): void
    {
        Log::info('GenerateSplit2Scripts Job started', ['userId' => $this->userId, 'isAutomatic' => $this->isAutomatic]);
        try {
            $numScripts = $this->isAutomatic ? 6 : 3;
            $systemPrompt = "You are Dr. Brand, a viral Algerian content strategist. Generate strictly JSON.
Generate AT LEAST {$numScripts} Instagram Reels scripts based on the details. Each script must have:
- subtitle (3-5 words in Algerian Darja)
- content (HTML string with <p> tags, 3-4 sentences in Algerian Darja)
Return JSON format:
{
  \"scripts\": [
    { \"subtitle\": \"string\", \"content\": \"string\" }
  ]
}";

            $apiKey = \App\Models\ApiToken::getActiveKey('openai');
            if (! $apiKey) {
                throw new \Exception('API Key configuration is missing.');
            }

            $response = Http::withToken($apiKey)
                ->timeout(120)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => json_encode($this->data)],
                    ],
                    'temperature' => 1,
                ]);

            if ($response->failed()) {
                throw new \Exception('Failed to generate scripts: ' . $response->body());
            }

            $text = $response->json('choices.0.message.content', '');
            $cleanedText = trim(preg_replace('/^```json\s*|\s*```$/i', '', $text));
            $data = json_decode($cleanedText, true) ?? [];

            $scripts = $data['scripts'] ?? [];

            $id = DB::table('generated_split_history')->insertGetId([
                'user_id' => $this->userId,
                'prompt' => $this->data['userPrompt'] ?? '',
                'client_persona' => $this->data['clientPersona'] ?? '',
                'content_pillar' => $this->data['contentPillar'] ?? '',
                'sub_pillars' => json_encode($this->data['subPillars'] ?? []),
                'chosen_sub_pillars' => json_encode($this->data['chosenSubPillars'] ?? []),
                'hook_type' => json_encode($this->data['hookType'] ?? []),
                'scripts' => json_encode($scripts),
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            event(new Split2ScriptsGenerated(
                userId: $this->userId,
                scripts: $scripts,
                historyId: $id
            ));
        } catch (\Exception $e) {
            Log::error('GenerateSplit2Scripts Job failed: ' . $e->getMessage());
            event(new Split2ErrorReceived(
                userId: $this->userId,
                error: $e->getMessage(),
                type: 'scripts'
            ));
        }
    }
}
