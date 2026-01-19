<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContactGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'source',
        'whatsapp_group_jid',
        'whatsapp_session_id',
        'members_count',
    ];

    protected $casts = [
        'members_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function whatsappSession(): BelongsTo
    {
        return $this->belongsTo(WhatsappSession::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(ContactGroupMember::class);
    }

    public function updateMembersCount(): void
    {
        $this->update(['members_count' => $this->members()->count()]);
    }

    public function isManual(): bool
    {
        return $this->source === 'manual';
    }

    public function isFromWhatsApp(): bool
    {
        return $this->source === 'whatsapp';
    }
}
