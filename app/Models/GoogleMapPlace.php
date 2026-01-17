<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleMapPlace extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'kecamatan',
        'location',
        'category',
        'rating',
        'review_count',
        'address',
        'phone',
        'website',
        'url',
        'scraped_at',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'review_count' => 'integer',
        'scraped_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
