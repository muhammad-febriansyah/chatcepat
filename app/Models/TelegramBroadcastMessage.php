<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramBroadcastMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'telegram_broadcast_id',
        'telegram_contact_id',
        'telegram_message_id',
        'status',
        'error_message',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function telegramBroadcast(): BelongsTo
    {
        return $this->belongsTo(TelegramBroadcast::class);
    }

    public function telegramContact(): BelongsTo
    {
        return $this->belongsTo(TelegramContact::class);
    }

    public function telegramMessage(): BelongsTo
    {
        return $this->belongsTo(TelegramMessage::class);
    }
}
