<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WhatsappGroup extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_groups';

    protected $fillable = [
        'user_id',
        'whatsapp_session_id',
        'group_jid',
        'name',
        'description',
        'owner_jid',
        'subject_time',
        'subject_owner_jid',
        'participants_count',
        'admins_count',
        'is_announce',
        'is_locked',
        'metadata',
    ];

    protected $casts = [
        'subject_time' => 'datetime',
        'is_announce' => 'boolean',
        'is_locked' => 'boolean',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function session()
    {
        return $this->belongsTo(WhatsappSession::class, 'whatsapp_session_id');
    }

    public function members()
    {
        return $this->hasMany(WhatsappGroupMember::class, 'whatsapp_group_id');
    }
}
