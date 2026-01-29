<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetaWebhookLog extends Model
{
    protected $fillable = [
        'user_id',
        'platform',
        'event_type',
        'status',
        'payload',
        'response',
        'error_message',
        'sender_id',
        'recipient_id',
        'message_id',
    ];

    protected $casts = [
        'payload' => 'array',
        'response' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
