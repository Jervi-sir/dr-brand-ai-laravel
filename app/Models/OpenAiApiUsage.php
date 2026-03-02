<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OpenAiApiUsage extends Model
{
    /** @use HasFactory<\Database\Factories\OpenAiApiUsageFactory> */
    use HasFactory;

    /** @var string */
    protected $table = 'openai_api_usage';

    /** @var list<string> */
    protected $fillable = [
        'chat_id',
        'model_id',
        'type',
        'prompt_tokens',
        'completion_tokens',
        'total_tokens',
        'duration',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'duration' => 'decimal:4',
        ];
    }

    /**
     * @return BelongsTo<Chat, $this>
     */
    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    /**
     * @return BelongsTo<AiModel, $this>
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(AiModel::class, 'model_id');
    }
}
