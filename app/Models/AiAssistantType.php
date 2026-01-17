<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiAssistantType extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'icon',
        'color',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
