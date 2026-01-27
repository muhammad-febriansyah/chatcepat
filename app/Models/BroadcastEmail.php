<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BroadcastEmail extends Model
{
    protected $fillable = [
        'user_id',
        'subject',
        'message',
        'template_id',
        'recipients',
        'scheduled_at',
        'sent_count',
        'failed_count',
    ];

    protected $casts = [
        'recipients' => 'array',
        'scheduled_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
