<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SplitPromptHistory extends Model
{
    /** @use HasFactory<\Database\Factories\SplitPromptHistoryFactory> */
    use HasFactory;

    /** @var string */
    protected $table = 'split_prompt_history';

    /** @var list<string> */
    protected $fillable = [
        'model_id',
        'model_code_name',
        'prompt',
        'user_email',
        'is_current',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_current' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<AiModel, $this>
     */
    public function ai_model(): BelongsTo
    {
        return $this->belongsTo(AiModel::class, 'model_id');
    }

    /**
     * Get the name of the currently selected model.
     */
    public static function getSelectedModelName(): ?string
    {
        $current = self::where('is_current', true)
            ->with('ai_model')
            ->first();

        return $current?->model_code_name ?? $current?->ai_model?->name;
    }
}
