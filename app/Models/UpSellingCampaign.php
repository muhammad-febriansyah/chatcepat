<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UpSellingCampaign extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'product_id',
        'trigger_type',
        'message',
        'discount_percentage',
        'valid_until',
        'is_active',
        'conversions',
        'revenue',
    ];

    protected $casts = [
        'valid_until' => 'datetime',
        'is_active' => 'boolean',
        'discount_percentage' => 'decimal:2',
        'revenue' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
