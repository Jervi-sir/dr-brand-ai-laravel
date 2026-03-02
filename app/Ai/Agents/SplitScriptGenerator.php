<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;
use Stringable;

class SplitScriptGenerator implements Agent, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        public string $userPrompt,
        public ?string $topicPrompt,
        public string $contentIdea,
        public string $hookType,
        public string $hookPrompts
    ) {}

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        $audience = 'Algerian audience';
        $structure = 'AIDA';

        return <<<PROMPT
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
                {$this->hookPrompts}
        
              - Provide a subtitle (in Algerian Darja, 3-5 words) that reflects the specific focus within the content idea type and niche.
              - Format the script as an HTML string with <p> tags for each hook or logical section. Ensure it is wrapped in <div style="text-align: right">...</div>
PROMPT;
    }

    /**
     * Get the JSON schema that the agent's output should conform to.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'scripts' => $schema->array()->items(
                $schema->object([
                    'subtitle' => $schema->string()->required(),
                    'content' => $schema->string()->required(),
                ])->withoutAdditionalProperties()
            )->required(),
        ];
    }
}
