<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'telegram_bot_id', 'telegram_contact_id',
        'message_id', 'chat_id', 'direction', 'type', 'content',
        'file_url', 'file_type', 'file_size', 'metadata',
        'status', 'error_message', 'sent_at', 'delivered_at', 'read_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'file_size' => 'integer',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function telegramBot(): BelongsTo
    {
        return $this->belongsTo(TelegramBot::class);
    }

    public function telegramContact(): BelongsTo
    {
        return $this->belongsTo(TelegramContact::class);
    }

    public function scopeInbound($query)
    {
        return $query->where('direction', 'inbound');
    }

    public function scopeOutbound($query)
    {
        return $query->where('direction', 'outbound');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
