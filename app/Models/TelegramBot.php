<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class TelegramBot extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bot_token',
        'bot_username',
        'bot_first_name',
        'bot_id',
        'webhook_secret',
        'is_active',
        'auto_reply_enabled',
        'ai_enabled',
        'ai_assistant_type',
        'ai_system_prompt',
        'ai_temperature',
        'ai_max_tokens',
        'settings',
        'last_webhook_at',
    ];

    protected $casts = [
        'bot_id' => 'integer',
        'is_active' => 'boolean',
        'auto_reply_enabled' => 'boolean',
        'ai_enabled' => 'boolean',
        'ai_temperature' => 'float',
        'ai_max_tokens' => 'integer',
        'settings' => 'array',
        'last_webhook_at' => 'datetime',
    ];

    protected $hidden = [
        'bot_token',
        'webhook_secret',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->webhook_secret)) {
                $model->webhook_secret = Str::random(64);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TelegramMessage::class);
    }

    public function autoReplies(): HasMany
    {
        return $this->hasMany(TelegramAutoReply::class);
    }

    public function broadcasts(): HasMany
    {
        return $this->hasMany(TelegramBroadcast::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(TelegramContact::class);
    }

    public function getMaskedTokenAttribute(): string
    {
        if (empty($this->bot_token)) {
            return '';
        }
        $parts = explode(':', $this->bot_token);
        if (count($parts) === 2) {
            return $parts[0] . ':' . Str::mask($parts[1], '*', 4, -4);
        }
        return Str::mask($this->bot_token, '*', 10, -4);
    }

    public function getWebhookUrlAttribute(): string
    {
        return url("/api/telegram/webhook/{$this->id}/{$this->webhook_secret}");
    }
}
