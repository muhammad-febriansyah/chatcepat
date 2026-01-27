<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetaBroadcast extends Model
{
    protected $fillable = [
        'user_id',
        'platform',
        'name',
        'message_type',
        'message_content',
        'media_url',
        'media_caption',
        'template_name',
        'template_data',
        'recipient_type',
        'recipient_groups',
        'recipient_contacts',
        'schedule_type',
        'scheduled_at',
        'status',
        'total_recipients',
        'sent_count',
        'failed_count',
        'delivered_count',
        'read_count',
        'started_at',
        'completed_at',
        'error_message',
    ];

    protected $casts = [
        'template_data' => 'array',
        'recipient_groups' => 'array',
        'recipient_contacts' => 'array',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_recipients' => 'integer',
        'sent_count' => 'integer',
        'failed_count' => 'integer',
        'delivered_count' => 'integer',
        'read_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(MetaBroadcastMessage::class, 'broadcast_id');
    }

    /**
     * Scope for pending broadcasts
     */
    public function scopePending($query)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_at', '<=', now());
    }

    /**
     * Mark as processing
     */
    public function markAsProcessing(): void
    {
        $this->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);
    }

    /**
     * Mark as completed
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark as failed
     */
    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
            'completed_at' => now(),
        ]);
    }

    /**
     * Update statistics
     */
    public function updateStats(): void
    {
        $this->sent_count = $this->messages()->where('status', 'sent')->count();
        $this->failed_count = $this->messages()->where('status', 'failed')->count();
        $this->delivered_count = $this->messages()->where('status', 'delivered')->count();
        $this->read_count = $this->messages()->where('status', 'read')->count();
        $this->save();
    }
}
