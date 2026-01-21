<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'message_id',
        'direction',
        'message_text',
        'message_type',
        'media',
        'human_agent_id',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'media' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Get the conversation that owns the message.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the agent who sent this message (if outbound).
     */
    public function humanAgent(): BelongsTo
    {
        return $this->belongsTo(HumanAgent::class);
    }

    /**
     * Check if message is from customer.
     */
    public function isFromCustomer(): bool
    {
        return $this->direction === 'inbound';
    }

    /**
     * Check if message is from agent.
     */
    public function isFromAgent(): bool
    {
        return $this->direction === 'outbound';
    }

    /**
     * Mark message as read.
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }
}
