<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TelegramSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'phone',
        'phone_code_hash',
        'is_authorized',
        'authorized_at',
        'expires_at',
    ];

    protected $casts = [
        'is_authorized' => 'boolean',
        'authorized_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the user that owns the session
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get bots created with this session
     */
    public function bots(): HasMany
    {
        return $this->hasMany(TelegramBot::class);
    }

    /**
     * Check if session is still valid
     */
    public function isValid(): bool
    {
        if (!$this->is_authorized) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }
}
