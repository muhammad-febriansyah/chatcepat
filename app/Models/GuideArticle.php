<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuideArticle extends Model
{
    protected $fillable = [
        'guide_category_id',
        'platform',
        'title',
        'slug',
        'content',
        'video_url',
        'icon',
        'sort_order',
        'is_published',
        'featured_image'
    ];

    public function category()
    {
        return $this->belongsTo(GuideCategory::class, 'guide_category_id');
    }
}
