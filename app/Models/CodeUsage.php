<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodeUsage extends Model
{
    /** @use HasFactory<\Database\Factories\CodeUsageFactory> */
    use HasFactory;

    /** @var string */
    protected $table = 'code_usage';

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'code_id',
        'used_at',
        'is_success',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'used_at' => 'datetime',
            'is_success' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Code, $this>
     */
    public function code(): BelongsTo
    {
        return $this->belongsTo(Code::class);
    }
}
