<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TelegramContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'telegram_bot_id', 'telegram_id', 'username',
        'first_name', 'last_name', 'phone', 'bio',
        'is_bot', 'is_verified', 'is_premium', 'metadata', 'last_interaction_at',
    ];

    protected $casts = [
        'is_bot' => 'boolean',
        'is_verified' => 'boolean',
        'is_premium' => 'boolean',
        'metadata' => 'array',
        'last_interaction_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function telegramBot(): BelongsTo
    {
        return $this->belongsTo(TelegramBot::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TelegramMessage::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->full_name ?: $this->username ?: $this->phone ?: 'Unknown';
    }
}
