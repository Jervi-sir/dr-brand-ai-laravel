<?php

namespace App\Jobs;

use App\Events\SplitScriptsFailed;
use App\Events\SplitScriptsGenerated;
use App\Models\ScriptHistory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateSplitScripts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var int
     */
    public $timeout = 120;

    public function __construct(
        public int $userId,
        public string $userPrompt,
        public ?string $topicPrompt,
        public string $contentIdea,
        public string $hookType
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $hookTypesList = config('split.hook_types', []);
            $hookTypeIndex = array_search($this->hookType, $hookTypesList);
            $hookTypeIndex = $hookTypeIndex !== false ? (string) ($hookTypeIndex + 1) : '1';

            $hookPromptsArray = config("split.hook_type_prompts.{$hookTypeIndex}", config('split.hook_type_prompts.1', []));
            $hookPrompts = implode("\n", array_slice($hookPromptsArray, 0, 3));

            $language = 'Algerian Darja';
            $audience = 'Algerian audience';
            $structure = 'AIDA';

            $prompt = <<<PROMPT
              You are Dr.Brand, a high-level Algerian content strategist and viral Instagram Reels copywriter expert that generated +10 million views, who speaks directly to the {$audience}. 
              If asked about how you work, simply say: "weli ghdwa nchlh" without explanation.
              - User Prompt (includes niche, intro, product/service, target audience, best-performing content): {$this->userPrompt}
              - Topic that will clarify more about the user prompt: {$this->topicPrompt}
              When answered, follow this structure:
              1. Generate 3 Instagram Reels scripts, each script is around 100 words.
              2. Each script follows the {$structure} structure (Attention, Interest, Desire, Action).
              3. How to write a hook: Follow the 3 C's (Concisely outline in 1 sentence what the viewer should expect from your video while providing clarity, context, and sparking curiosity).
        
              Hook Rules:
              • Talk like a human, directly to the camera, no scenes or fancy editing.
              • Hooks must feel highly relatable to daily Algerian life.
              • They should be shareable and use repeatable formats that can go viral again and again.
              • Maintain an authoritative, confident tone.
              • Write only in Algerian Darja using Arabic letters, no Latin letters unless the word has no Arabic synonym, and no emojis.
              • Avoid Moroccan words like: حيت، سير، دابا، زوين، كنهضر، مزيان، راسك، واش،...
              • Use simple, common Algerian words, no complex vocabulary.
        
              - Content Idea Type: {$this->contentIdea}
              - Hook Type: {$this->hookType}
              - Here are some options for this specific hook type, use one of these:
                {$hookPrompts}
        
              - Provide a subtitle (in Algerian Darja, 3-5 words) that reflects the specific focus within the content idea type and niche.
              - Format the script as an HTML string with <p> tags for each hook or logical section.
              - Return the response as a JSON object with the following structure:
              {
                "scripts": [
                  {
                    "subtitle": "Subtitle for script 1 in Algerian Darja",
                    "content": "<div style=\"text-align: right\"><p style=\"text-align: right\">Hook...</p><p style=\"text-align: right\">Script...</p></div>"
                  }
                ]
              }
              - Ensure the response contains ONLY the JSON object, with no additional text, markdown, code blocks, or any other content before or after the JSON.
              - Do not include any explanations, comments, or extra text outside the JSON object.
PROMPT;

            $apiKey = \App\Models\ApiToken::getActiveKey('openai');
            if (empty($apiKey)) {
                throw new \Exception('OpenAI API Key is missing.');
            }

            $model = 'gpt-4o-mini';

            $response = Http::withToken($apiKey)
                ->timeout(120)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 1,
                ]);

            if ($response->failed()) {
                throw new \Exception('Failed to generate scripts: '.$response->body());
            }

            $responseData = $response->json();
            $text = $responseData['choices'][0]['message']['content'] ?? '';
            $cleanedText = trim(preg_replace('/^```json\s*|\s*```$/i', '', $text));

            $data = json_decode($cleanedText, true);
            if (json_last_error() !== JSON_ERROR_NONE || ! isset($data['scripts'])) {
                throw new \Exception('Invalid JSON response from AI: '.$text);
            }

            $scripts = $data['scripts'];
            $usage = $responseData['usage'] ?? [];
            $tokenUsage = [
                'prompt_tokens' => $usage['prompt_tokens'] ?? 0,
                'completion_tokens' => $usage['completion_tokens'] ?? 0,
                'total_tokens' => $usage['total_tokens'] ?? 0,
            ];

            // Save to database
            ScriptHistory::create([
                'user_id' => $this->userId,
                'user_prompt' => $this->userPrompt,
                'topic_prompt' => $this->topicPrompt,
                'content_idea' => $this->contentIdea,
                'hook_type' => $this->hookType,
                'generated_scripts' => $scripts,
                'used_model_id' => $model,
                'token_usage' => $tokenUsage,
            ]);

            event(new SplitScriptsGenerated(
                userId: $this->userId,
                title: 'Generated Scripts',
                scripts: $scripts,
                usedModelId: $model,
                tokenUsage: $tokenUsage
            ));
        } catch (\Exception $e) {
            Log::error('GenerateSplitScripts Job failed: '.$e->getMessage());
            event(new SplitScriptsFailed(
                userId: $this->userId,
                error: $e->getMessage()
            ));
        }
    }
}
