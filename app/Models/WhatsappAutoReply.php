<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappAutoReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'whatsapp_session_id',
        'trigger_type',
        'trigger_value',
        'reply_type',
        'custom_reply',
        'openai_config',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'openai_config' => 'array',
        'is_active' => 'boolean',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WhatsappSession::class, 'whatsapp_session_id');
    }
}
