<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailBroadcast extends Model
{
    protected $fillable = [
        'user_id',
        'smtp_setting_id',
        'message_template_id',
        'subject',
        'content',
        'total_recipients',
        'sent_count',
        'failed_count',
        'status',
        'recipient_emails',
        'failed_emails',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'recipient_emails' => 'array',
        'failed_emails' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_recipients' => 'integer',
        'sent_count' => 'integer',
        'failed_count' => 'integer',
    ];

    /**
     * Relationship with User
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship with SmtpSetting
     */
    public function smtpSetting(): BelongsTo
    {
        return $this->belongsTo(SmtpSetting::class);
    }

    /**
     * Relationship with MessageTemplate
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(MessageTemplate::class, 'message_template_id');
    }

    /**
     * Scope to get broadcasts by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get pending broadcasts
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Mark broadcast as processing
     */
    public function markAsProcessing()
    {
        $this->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);
    }

    /**
     * Mark broadcast as completed
     */
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Mark broadcast as failed
     */
    public function markAsFailed()
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Increment sent count
     */
    public function incrementSent()
    {
        $this->increment('sent_count');
    }

    /**
     * Increment failed count
     */
    public function incrementFailed()
    {
        $this->increment('failed_count');
    }
}
