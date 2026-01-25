<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'resource_type',
        'resource_id',
        'resource_name',
        'old_values',
        'new_values',
        'metadata',
        'ip_address',
        'user_agent',
        'device_type',
        'browser',
        'platform',
        'is_successful',
        'error_message',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
        'is_successful' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the activity log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include logs for a specific user.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to filter by action.
     */
    public function scopeAction(Builder $query, string $action): Builder
    {
        return $query->where('action', $action);
    }

    /**
     * Scope a query to filter by resource type.
     */
    public function scopeResourceType(Builder $query, string $resourceType): Builder
    {
        return $query->where('resource_type', $resourceType);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope a query to get recent logs.
     */
    public function scopeRecent(Builder $query, int $limit = 10): Builder
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    /**
     * Get the action label in Indonesian.
     */
    public function getActionLabelAttribute(): string
    {
        $labels = [
            'create' => 'Buat',
            'update' => 'Ubah',
            'delete' => 'Hapus',
            'login' => 'Login',
            'logout' => 'Logout',
            'login_failed' => 'Login Gagal',
            'send' => 'Kirim',
            'connect' => 'Sambungkan',
            'disconnect' => 'Putuskan',
            'start' => 'Mulai',
            'stop' => 'Hentikan',
            'import' => 'Import',
            'export' => 'Export',
        ];

        return $labels[$this->action] ?? ucfirst($this->action);
    }

    /**
     * Get the resource type label in Indonesian.
     */
    public function getResourceTypeLabelAttribute(): string
    {
        $labels = [
            'Contact' => 'Kontak',
            'ContactGroup' => 'Grup Kontak',
            'MessageTemplate' => 'Template Pesan',
            'WhatsappBroadcast' => 'Broadcast WhatsApp',
            'TelegramBroadcast' => 'Broadcast Telegram',
            'WhatsappSession' => 'Sesi WhatsApp',
            'TelegramSession' => 'Sesi Telegram',
            'WhatsappAutoReply' => 'Auto Reply WhatsApp',
            'TelegramAutoReply' => 'Auto Reply Telegram',
            'GoogleMapPlace' => 'Google Maps',
            'WhatsappContact' => 'Kontak WhatsApp',
            'WhatsappGroup' => 'Grup WhatsApp',
            'Authentication' => 'Autentikasi',
        ];

        return $labels[$this->resource_type] ?? $this->resource_type;
    }

    /**
     * Get the description for the activity.
     */
    public function getDescriptionAttribute(): string
    {
        $action = $this->getActionLabelAttribute();
        $resourceType = $this->getResourceTypeLabelAttribute();
        $resourceName = $this->resource_name ? " \"{$this->resource_name}\"" : '';

        if ($this->action === 'login') {
            return 'Login ke sistem';
        }

        if ($this->action === 'logout') {
            return 'Logout dari sistem';
        }

        if ($this->action === 'login_failed') {
            return 'Percobaan login gagal';
        }

        return "{$action} {$resourceType}{$resourceName}";
    }
}
