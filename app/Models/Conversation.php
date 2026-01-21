<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'whatsapp_session_id',
        'human_agent_id',
        'customer_phone',
        'customer_name',
        'status',
        'last_message_at',
        'last_message_text',
        'last_message_from',
        'unread_by_agent',
        'unread_count',
        'metadata',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'unread_by_agent' => 'boolean',
        'unread_count' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Get the user that owns the conversation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the WhatsApp session.
     */
    public function whatsappSession(): BelongsTo
    {
        return $this->belongsTo(WhatsappSession::class);
    }

    /**
     * Get the assigned agent.
     */
    public function humanAgent(): BelongsTo
    {
        return $this->belongsTo(HumanAgent::class);
    }

    /**
     * Get all messages for this conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ConversationMessage::class);
    }

    /**
     * Get the latest message.
     */
    public function latestMessage()
    {
        return $this->hasOne(ConversationMessage::class)->latestOfMany();
    }

    /**
     * Mark all messages as read by agent.
     */
    public function markAsRead(): void
    {
        $this->update([
            'unread_by_agent' => false,
            'unread_count' => 0,
        ]);

        $this->messages()
            ->where('direction', 'inbound')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Assign to an agent.
     */
    public function assignToAgent(HumanAgent $agent): void
    {
        $this->update([
            'human_agent_id' => $agent->id,
            'status' => 'open',
        ]);
    }

    /**
     * Resolve the conversation.
     */
    public function resolve(): void
    {
        $this->update([
            'status' => 'resolved',
        ]);
    }

    /**
     * Reopen the conversation.
     */
    public function reopen(): void
    {
        $this->update([
            'status' => 'open',
        ]);
    }
}
