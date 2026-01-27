<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaBroadcastMessage extends Model
{
    protected $fillable = [
        'broadcast_id',
        'contact_id',
        'recipient_identifier',
        'meta_message_id',
        'status',
        'error_message',
        'sent_at',
        'delivered_at',
        'read_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
    ];

    public function broadcast(): BelongsTo
    {
        return $this->belongsTo(MetaBroadcast::class, 'broadcast_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(MetaContact::class, 'contact_id');
    }
}
