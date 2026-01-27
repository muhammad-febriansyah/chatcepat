<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TelegramBroadcast extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'telegram_bot_id', 'name', 'description',
        'message_type', 'message_content', 'file_url',
        'status', 'scheduled_at', 'started_at', 'completed_at',
        'total_recipients', 'sent_count', 'failed_count', 'target_filter',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_recipients' => 'integer',
        'sent_count' => 'integer',
        'failed_count' => 'integer',
        'target_filter' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function telegramBot(): BelongsTo
    {
        return $this->belongsTo(TelegramBot::class);
    }

    public function broadcastMessages(): HasMany
    {
        return $this->hasMany(TelegramBroadcastMessage::class);
    }

    public function getSuccessRateAttribute(): float
    {
        if ($this->total_recipients === 0) {
            return 0;
        }
        return round(($this->sent_count / $this->total_recipients) * 100, 2);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
