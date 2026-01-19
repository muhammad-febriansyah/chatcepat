<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramAutoReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'telegram_bot_id',
        'name',
        'trigger_type',
        'trigger_value',
        'response_type',
        'response_content',
        'response_media_url',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    public function bot(): BelongsTo
    {
        return $this->belongsTo(TelegramBot::class, 'telegram_bot_id');
    }

    public function matches(string $text): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $text = trim($text);
        $trigger = $this->trigger_value;

        return match ($this->trigger_type) {
            'all' => true,
            'exact' => strtolower($text) === strtolower($trigger),
            'contains' => str_contains(strtolower($text), strtolower($trigger)),
            'starts_with' => str_starts_with(strtolower($text), strtolower($trigger)),
            'regex' => (bool) preg_match($trigger, $text),
            default => false,
        };
    }
}
