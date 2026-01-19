<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'telegram_bot_id',
        'telegram_message_id',
        'chat_id',
        'chat_type',
        'chat_title',
        'from_user_id',
        'from_username',
        'from_first_name',
        'direction',
        'type',
        'content',
        'media_metadata',
        'is_auto_reply',
    ];

    protected $casts = [
        'telegram_message_id' => 'integer',
        'chat_id' => 'integer',
        'from_user_id' => 'integer',
        'media_metadata' => 'array',
        'is_auto_reply' => 'boolean',
    ];

    public function bot(): BelongsTo
    {
        return $this->belongsTo(TelegramBot::class, 'telegram_bot_id');
    }

    public function isIncoming(): bool
    {
        return $this->direction === 'incoming';
    }

    public function isOutgoing(): bool
    {
        return $this->direction === 'outgoing';
    }
}
