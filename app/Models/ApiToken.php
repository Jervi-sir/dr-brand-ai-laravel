<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'provider',
        'token',
        'is_active',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_used_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (ApiToken $apiToken) {
            if ($apiToken->is_active && $apiToken->isDirty('is_active')) {
                static::query()
                    ->where('provider', $apiToken->provider)
                    ->when($apiToken->exists, function ($query) use ($apiToken) {
                        $query->where('id', '!=', $apiToken->id);
                    })
                    ->update(['is_active' => false]);
            }
        });
    }

    /**
     * Get the active API token key for a given provider.
     */
    public static function getActiveKey(string $provider = 'openai'): ?string
    {
        $token = static::query()
            ->where('provider', $provider)
            ->where('is_active', true)
            ->first();

        if ($token) {
            // Update last_used_at without triggering model events
            $token->updateQuietly(['last_used_at' => now()]);

            return $token->token;
        }

        return null;
    }
}
