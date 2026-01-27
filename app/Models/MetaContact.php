<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MetaContact extends Model
{
    protected $fillable = [
        'user_id',
        'platform',
        'identifier',
        'name',
        'username',
        'profile_pic',
        'email',
        'custom_fields',
        'tags',
        'notes',
        'is_blocked',
        'last_message_at',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'tags' => 'array',
        'is_blocked' => 'boolean',
        'last_message_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(
            MetaContactGroup::class,
            'meta_contact_group_members',
            'contact_id',
            'group_id'
        )->withTimestamps();
    }

    /**
     * Update last message timestamp
     */
    public function touchLastMessage(): void
    {
        $this->update(['last_message_at' => now()]);
    }

    /**
     * Scope for specific platform
     */
    public function scopePlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope for non-blocked contacts
     */
    public function scopeNotBlocked($query)
    {
        return $query->where('is_blocked', false);
    }
}
