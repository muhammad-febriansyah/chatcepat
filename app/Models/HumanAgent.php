<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Hash;

class HumanAgent extends Authenticatable
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'whatsapp_session_id',
        'full_name',
        'email',
        'phone_number',
        'password',
        'role',
        'shift',
        'shift_start',
        'shift_end',
        'is_active',
        'is_online',
        'last_active_at',
        'assigned_sessions',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_online' => 'boolean',
        'last_active_at' => 'datetime',
        'assigned_sessions' => 'array',
        'shift_start' => 'datetime:H:i',
        'shift_end' => 'datetime:H:i',
    ];

    /**
     * Hash password automatically
     */
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::make($value);
    }

    /**
     * Get the user that owns this agent
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the primary WhatsApp session
     */
    public function whatsappSession(): BelongsTo
    {
        return $this->belongsTo(WhatsappSession::class);
    }

    /**
     * Check if agent is currently working (within shift hours)
     */
    public function isWorking(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->shift === 'full_time') {
            return true;
        }

        $now = now()->format('H:i');
        return $now >= $this->shift_start && $now <= $this->shift_end;
    }

    /**
     * Get all assigned WhatsApp sessions
     */
    public function getAssignedWhatsappSessions()
    {
        if (!$this->assigned_sessions) {
            return collect();
        }

        return WhatsappSession::whereIn('id', $this->assigned_sessions)->get();
    }
}
