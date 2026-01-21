<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappAutoReply extends Model
{
    use HasFactory;

    protected $fillable = [
        'whatsapp_session_id',
        'name',
        'trigger_type',
        'trigger_value',
        'reply_type',
        'response_type',
        'custom_reply',
        'response_media_url',
        'openai_config',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'openai_config' => 'array',
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WhatsappSession::class, 'whatsapp_session_id');
    }

    /**
     * Check if this auto-reply matches the given text
     */
    public function matches(string $text): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $text = trim($text);
        $triggerValue = trim($this->trigger_value ?? '');

        return match ($this->trigger_type) {
            'all' => true,
            'exact' => mb_strtolower($text) === mb_strtolower($triggerValue),
            'contains' => str_contains(mb_strtolower($text), mb_strtolower($triggerValue)),
            'starts_with' => str_starts_with(mb_strtolower($text), mb_strtolower($triggerValue)),
            'regex' => (bool) @preg_match('/' . $triggerValue . '/', $text),
            default => false,
        };
    }

    /**
     * Get the response content based on reply_type
     */
    public function getResponseContent(): ?string
    {
        return $this->custom_reply;
    }

    /**
     * Scope to get active auto-replies ordered by priority
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderByDesc('priority');
    }
}
