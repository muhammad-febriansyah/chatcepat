<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TelegramBot extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'telegram_session_id',
        'name',
        'username',
        'token',
        'description',
        'is_active',
        'auto_reply_enabled',
        'webhook_url',
        'last_activity_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'auto_reply_enabled' => 'boolean',
        'last_activity_at' => 'datetime',
    ];

    protected $hidden = [
        'token', // Hide token from JSON responses
    ];

    /**
     * Get the user that owns the bot
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the session that created this bot
     */
    public function telegramSession(): BelongsTo
    {
        return $this->belongsTo(TelegramSession::class);
    }

    /**
     * Get contacts for this bot
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(TelegramContact::class);
    }

    /**
     * Get messages for this bot
     */
    public function messages(): HasMany
    {
        return $this->hasMany(TelegramMessage::class);
    }

    /**
     * Get auto replies for this bot
     */
    public function autoReplies(): HasMany
    {
        return $this->hasMany(TelegramAutoReply::class);
    }

    /**
     * Get broadcasts for this bot
     */
    public function broadcasts(): HasMany
    {
        return $this->hasMany(TelegramBroadcast::class);
    }

    /**
     * Update last activity timestamp
     */
    public function touchActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }
}
