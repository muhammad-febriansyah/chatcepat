<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmChannel extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'platform',
        'name',
        'credentials',
        'status',
        'webhook_verified',
        'phone_number',
        'account_id',
        'last_sync_at',
        'error_message',
    ];

    protected $casts = [
        'credentials' => 'encrypted:array',
        'webhook_verified' => 'boolean',
        'last_sync_at' => 'datetime',
    ];

    public const PLATFORM_WHATSAPP_CLOUD = 'whatsapp_cloud';
    public const PLATFORM_INSTAGRAM = 'instagram';
    public const PLATFORM_MESSENGER = 'messenger';

    public const STATUS_CONNECTED = 'connected';
    public const STATUS_DISCONNECTED = 'disconnected';
    public const STATUS_ERROR = 'error';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isConnected(): bool
    {
        return $this->status === self::STATUS_CONNECTED;
    }

    public function getPlatformLabel(): string
    {
        return match ($this->platform) {
            self::PLATFORM_WHATSAPP_CLOUD => 'WhatsApp Cloud API',
            self::PLATFORM_INSTAGRAM => 'Instagram',
            self::PLATFORM_MESSENGER => 'Facebook Messenger',
            default => ucfirst($this->platform),
        };
    }
}
