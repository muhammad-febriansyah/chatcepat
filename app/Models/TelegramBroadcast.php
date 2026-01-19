<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelegramBroadcast extends Model
{
    use HasFactory;

    protected $fillable = [
        'telegram_bot_id',
        'user_id',
        'name',
        'type',
        'content',
        'media_url',
        'recipient_chat_ids',
        'total_recipients',
        'sent_count',
        'failed_count',
        'status',
        'scheduled_at',
        'started_at',
        'completed_at',
        'error_message',
    ];

    protected $casts = [
        'recipient_chat_ids' => 'array',
        'total_recipients' => 'integer',
        'sent_count' => 'integer',
        'failed_count' => 'integer',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function bot(): BelongsTo
    {
        return $this->belongsTo(TelegramBot::class, 'telegram_bot_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function getProgressPercentage(): float
    {
        if ($this->total_recipients === 0) {
            return 0;
        }
        return round(($this->sent_count + $this->failed_count) / $this->total_recipients * 100, 1);
    }
}
