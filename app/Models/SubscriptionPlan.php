<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SubscriptionPlan extends Model
{
    /** @use HasFactory<\Database\Factories\SubscriptionPlanFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'name',
        'capabilities',
    ];

    /**
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_subscriptions')
            ->withPivot('subscribed_at', 'is_active')
            ->withTimestamps();
    }

    /**
     * @return BelongsToMany<AiModel, $this>
     */
    public function ai_models(): BelongsToMany
    {
        return $this->belongsToMany(AiModel::class, 'subscription_models')
            ->withTimestamps();
    }
}
