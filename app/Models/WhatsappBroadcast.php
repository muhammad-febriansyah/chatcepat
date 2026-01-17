<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappBroadcast extends Model
{
    use HasFactory;

    protected $fillable = [
        'whatsapp_session_id',
        'user_id',
        'name',
        'type',
        'content',
        'media_metadata',
        'recipient_numbers',
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
        'media_metadata' => 'array',
        'recipient_numbers' => 'array',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WhatsappSession::class, 'whatsapp_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
