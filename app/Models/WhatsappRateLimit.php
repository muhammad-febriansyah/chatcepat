<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappRateLimit extends Model
{
    use HasFactory;

    protected $fillable = [
        'whatsapp_session_id',
        'messages_sent_last_hour',
        'messages_sent_today',
        'last_message_sent_at',
        'cooldown_until',
        'hourly_buckets',
    ];

    protected $casts = [
        'hourly_buckets' => 'array',
        'last_message_sent_at' => 'datetime',
        'cooldown_until' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WhatsappSession::class, 'whatsapp_session_id');
    }

    public function isInCooldown(): bool
    {
        return $this->cooldown_until && $this->cooldown_until > now();
    }
}
