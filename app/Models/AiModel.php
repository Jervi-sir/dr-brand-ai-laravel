<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiModel extends Model
{
    /** @use HasFactory<\Database\Factories\AiModelFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'name',
        'endpoint',
        'api_key',
        'capability',
        'provider',
        'display_name',
        'type',
        'is_active',
        'max_tokens',
        'temperature',
        'custom_prompts',
        'input_price',
        'output_price',
        'cached_input_price',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'max_tokens' => 'integer',
            'temperature' => 'integer',
            'input_price' => 'decimal:4',
            'output_price' => 'decimal:4',
            'cached_input_price' => 'decimal:4',
        ];
    }

    /**
     * @return BelongsToMany<SubscriptionPlan, $this>
     */
    public function subscription_plans(): BelongsToMany
    {
        return $this->belongsToMany(SubscriptionPlan::class, 'subscription_models')
            ->withTimestamps();
    }

    /**
     * @return HasMany<PromptHistory, $this>
     */
    public function prompt_histories(): HasMany
    {
        return $this->hasMany(PromptHistory::class, 'model_id');
    }

    /**
     * @return HasMany<SplitPromptHistory, $this>
     */
    public function split_prompt_histories(): HasMany
    {
        return $this->hasMany(SplitPromptHistory::class, 'model_id');
    }
}
