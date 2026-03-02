<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromptHistory extends Model
{
    /** @use HasFactory<\Database\Factories\PromptHistoryFactory> */
    use HasFactory;

    /** @var string */
    protected $table = 'prompt_history';

    /** @var list<string> */
    protected $fillable = [
        'model_id',
        'prompt',
        'userEmail',
    ];

    /**
     * @return BelongsTo<AiModel, $this>
     */
    public function ai_model(): BelongsTo
    {
        return $this->belongsTo(AiModel::class, 'model_id');
    }
}
