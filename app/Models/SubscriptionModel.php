<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionModel extends Model
{
    /** @use HasFactory<\Database\Factories\SubscriptionModelFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'subscription_plan_id',
        'ai_model_id',
    ];

    /**
     * @return BelongsTo<SubscriptionPlan, $this>
     */
    public function subscription_plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class);
    }

    /**
     * @return BelongsTo<AiModel, $this>
     */
    public function ai_model(): BelongsTo
    {
        return $this->belongsTo(AiModel::class);
    }
}
