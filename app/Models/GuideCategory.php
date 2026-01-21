<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuideCategory extends Model
{
    protected $fillable = ['name', 'slug', 'sort_order'];

    public function articles()
    {
        return $this->hasMany(GuideArticle::class)->orderBy('sort_order');
    }
}
