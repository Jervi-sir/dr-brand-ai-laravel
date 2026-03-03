<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Split1Config extends Model
{
    protected $table = 'split_1_configs';

    protected $fillable = [
        'model_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
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
     * Get the name of the currently active model.
     */
    public static function getSelectedModelName(): ?string
    {
        return self::where('is_active', true)
            ->with('ai_model')
            ->first()
            ?->ai_model
            ?->name;
    }
}
