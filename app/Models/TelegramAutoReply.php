<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramAutoReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'telegram_bot_id', 'name', 'trigger_type', 'trigger_value',
        'reply_type', 'reply_content', 'reply_file_url',
        'is_active', 'priority', 'usage_count', 'last_used_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'priority' => 'integer',
        'usage_count' => 'integer',
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function telegramBot(): BelongsTo
    {
        return $this->belongsTo(TelegramBot::class);
    }

    public function incrementUsage(): void
    {
        $this->increment('usage_count');
        $this->update(['last_used_at' => now()]);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('priority', 'desc');
    }

    public function matches(string $message): bool
    {
        return match ($this->trigger_type) {
            'exact' => strtolower($message) === strtolower($this->trigger_value),
            'contains' => str_contains(strtolower($message), strtolower($this->trigger_value)),
            'keyword' => in_array(strtolower($this->trigger_value), array_map('strtolower', explode(' ', $message))),
            'regex' => preg_match('/' . $this->trigger_value . '/i', $message),
            'all' => true,
            default => false,
        };
    }
}
