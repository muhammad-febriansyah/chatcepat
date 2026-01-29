<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetaDocumentation extends Model
{
    protected $fillable = [
        'platform',
        'title',
        'slug',
        'content',
        'video_url',
        'icon',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
}
