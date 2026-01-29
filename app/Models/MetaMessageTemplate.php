<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetaMessageTemplate extends Model
{
    protected $fillable = [
        'name',
        'category',
        'platform',
        'content',
        'variables',
        'language',
        'is_system',
        'is_active',
        'usage_count',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_system' => 'boolean',
        'is_active' => 'boolean',
        'usage_count' => 'integer',
    ];
}
