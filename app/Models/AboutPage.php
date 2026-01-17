<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutPage extends Model
{
    protected $fillable = [
        'title',
        'description',
        'content',
        'vision',
        'mission',
        'values',
        'image',
        'is_active',
    ];

    protected $casts = [
        'values' => 'array',
        'is_active' => 'boolean',
    ];
}
