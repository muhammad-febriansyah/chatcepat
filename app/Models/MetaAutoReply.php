<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaAutoReply extends Model
{
    protected $fillable = [
        'user_id',
        'platform',
        'name',
        'trigger_type',
        'keywords',
        'match_type',
        'reply_type',
        'reply_message',
        'media_url',
        'media_caption',
        'template_name',
        'template_data',
        'business_hours',
        'only_first_message',
        'is_active',
        'priority',
        'usage_count',
    ];

    protected $casts = [
        'keywords' => 'array',
        'template_data' => 'array',
        'business_hours' => 'array',
        'only_first_message' => 'boolean',
        'is_active' => 'boolean',
        'priority' => 'integer',
        'usage_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if auto reply should trigger for given message
     */
    public function shouldTrigger(string $message): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // Check business hours if set
        if ($this->business_hours && !$this->isWithinBusinessHours()) {
            return false;
        }

        // Check trigger type
        return match ($this->trigger_type) {
            'all' => true,
            'keyword' => $this->matchesKeyword($message),
            'greeting' => $this->isGreeting($message),
            'away' => true, // Handled by business hours
            default => false,
        };
    }

    /**
     * Check if message matches keywords
     */
    protected function matchesKeyword(string $message): bool
    {
        if (empty($this->keywords)) {
            return false;
        }

        $message = strtolower(trim($message));

        foreach ($this->keywords as $keyword) {
            $keyword = strtolower(trim($keyword));

            $matched = match ($this->match_type) {
                'exact' => $message === $keyword,
                'contains' => str_contains($message, $keyword),
                'starts_with' => str_starts_with($message, $keyword),
                'ends_with' => str_ends_with($message, $keyword),
                default => false,
            };

            if ($matched) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if message is a greeting
     */
    protected function isGreeting(string $message): bool
    {
        $greetings = ['hi', 'hello', 'hey', 'halo', 'hola', 'hai', 'good morning', 'good afternoon', 'good evening'];
        $message = strtolower(trim($message));

        foreach ($greetings as $greeting) {
            if (str_contains($message, $greeting)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if current time is within business hours
     */
    protected function isWithinBusinessHours(): bool
    {
        if (empty($this->business_hours)) {
            return true;
        }

        // Business hours format: ['start' => '09:00', 'end' => '17:00', 'days' => [1,2,3,4,5]]
        $now = now();
        $currentDay = $now->dayOfWeek; // 0 = Sunday, 6 = Saturday
        $currentTime = $now->format('H:i');

        $days = $this->business_hours['days'] ?? [];
        $start = $this->business_hours['start'] ?? '00:00';
        $end = $this->business_hours['end'] ?? '23:59';

        if (!empty($days) && !in_array($currentDay, $days)) {
            return false;
        }

        return $currentTime >= $start && $currentTime <= $end;
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }
}
