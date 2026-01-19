<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'telegram_bot_id',
        'chat_id',
        'chat_type',
        'username',
        'first_name',
        'last_name',
        'chat_title',
        'is_blocked',
        'last_message_at',
    ];

    protected $casts = [
        'chat_id' => 'integer',
        'is_blocked' => 'boolean',
        'last_message_at' => 'datetime',
    ];

    public function bot(): BelongsTo
    {
        return $this->belongsTo(TelegramBot::class, 'telegram_bot_id');
    }

    public function getDisplayNameAttribute(): string
    {
        if ($this->chat_type !== 'private' && $this->chat_title) {
            return $this->chat_title;
        }

        $name = trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));

        if (empty($name) && $this->username) {
            return '@' . $this->username;
        }

        return $name ?: 'Unknown';
    }

    public function isPrivateChat(): bool
    {
        return $this->chat_type === 'private';
    }

    public function isGroupChat(): bool
    {
        return in_array($this->chat_type, ['group', 'supergroup']);
    }
}
