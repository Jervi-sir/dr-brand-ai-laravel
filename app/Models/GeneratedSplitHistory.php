<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneratedSplitHistory extends Model
{
    /** @use HasFactory<\Database\Factories\GeneratedSplitHistoryFactory> */
    use HasFactory;

    /** @var string */
    protected $table = 'generated_split_history';

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'prompt',
        'client_persona',
        'content_pillar',
        'sub_pillars',
        'chosen_sub_pillars',
        'hook_type',
        'scripts',
        'is_deleted',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sub_pillars' => 'json',
            'chosen_sub_pillars' => 'json',
            'hook_type' => 'json',
            'scripts' => 'json',
            'is_deleted' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
