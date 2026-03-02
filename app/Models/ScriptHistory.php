<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScriptHistory extends Model
{
    /** @use HasFactory<\Database\Factories\ScriptHistoryFactory> */
    use HasFactory;

    /** @var string */
    protected $table = 'script_history';

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'content_id',
        'user_prompt',
        'topic_prompt',
        'content_idea',
        'hook_type',
        'generated_scripts',
        'used_model_id',
        'token_usage',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'generated_scripts' => 'json',
            'token_usage' => 'json',
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
     * @return BelongsTo<Content, $this>
     */
    public function content(): BelongsTo
    {
        return $this->belongsTo(Content::class);
    }
}
