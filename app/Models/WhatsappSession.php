<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class WhatsappSession extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'session_id',
        'phone_number',
        'name',
        'status',
        'ai_assistant_type',
        'qr_code',
        'qr_expires_at',
        'webhook_url',
        'settings',
        'last_connected_at',
        'last_disconnected_at',
        'is_active',
    ];

    protected $casts = [
        'settings' => 'array',
        'qr_expires_at' => 'datetime',
        'last_connected_at' => 'datetime',
        'last_disconnected_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WhatsappMessage::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(WhatsappContact::class);
    }

    public function broadcasts(): HasMany
    {
        return $this->hasMany(WhatsappBroadcast::class);
    }

    public function autoReplies(): HasMany
    {
        return $this->hasMany(WhatsappAutoReply::class);
    }

    public function rateLimit(): HasOne
    {
        return $this->hasOne(WhatsappRateLimit::class);
    }

    public function isConnected(): bool
    {
        return $this->status === 'connected';
    }

    public function isQRPending(): bool
    {
        return $this->status === 'qr_pending' &&
               $this->qr_expires_at &&
               $this->qr_expires_at > now();
    }
}
