<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleSetting extends Model
{
    protected $fillable = [
        'client_id',
        'client_secret',
        'redirect_uri',
        'is_active',
    ];

    /**
     * Get the first or create a default instance.
     */
    public static function get(): self
    {
        return self::firstOrCreate([], [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect'),
            'is_active' => true,
        ]);
    }
}
