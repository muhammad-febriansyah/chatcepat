<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'whatsapp_session_id',
        'phone_number',
        'display_name',
        'push_name',
        'is_business',
        'is_group',
        'metadata',
        'last_message_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_business' => 'boolean',
        'is_group' => 'boolean',
        'last_message_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WhatsappSession::class, 'whatsapp_session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get display name or fallback to phone number
     */
    public function getNameAttribute(): string
    {
        return $this->display_name ?? $this->push_name ?? $this->phone_number;
    }
}
