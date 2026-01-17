<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'whatsapp_session_id',
        'message_id',
        'from_number',
        'to_number',
        'direction',
        'type',
        'content',
        'media_metadata',
        'status',
        'is_auto_reply',
        'auto_reply_source',
        'context',
        'sent_at',
        'delivered_at',
        'read_at',
    ];

    protected $casts = [
        'media_metadata' => 'array',
        'context' => 'array',
        'is_auto_reply' => 'boolean',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WhatsappSession::class, 'whatsapp_session_id');
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
