<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsappGroupMember extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_group_members';

    protected $fillable = [
        'whatsapp_group_id',
        'participant_jid',
        'phone_number',
        'display_name',
        'push_name',
        'is_admin',
        'is_super_admin',
        'is_lid_format',
        'metadata',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
        'is_super_admin' => 'boolean',
        'is_lid_format' => 'boolean',
        'metadata' => 'array',
    ];

    public function group()
    {
        return $this->belongsTo(WhatsappGroup::class, 'whatsapp_group_id');
    }

    /**
     * Get display name with fallback
     */
    public function getNameAttribute(): string
    {
        return $this->display_name ?: $this->push_name ?: '-';
    }

    /**
     * Get phone or LID identifier
     */
    public function getIdentifierAttribute(): string
    {
        if ($this->phone_number) {
            return $this->phone_number;
        }

        if ($this->is_lid_format) {
            return 'LID: ' . str_replace('@lid', '', $this->participant_jid);
        }

        return $this->participant_jid;
    }
}
