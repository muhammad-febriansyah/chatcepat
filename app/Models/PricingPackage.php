<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingPackage extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'currency',
        'period',
        'period_unit',
        'features',
        'feature_keys',
        'is_featured',
        'is_active',
        'order',
        'button_text',
        'button_url',
    ];

    protected $casts = [
        'price' => 'integer',
        'period' => 'integer',
        'features' => 'array',
        'feature_keys' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    protected $appends = [
        'formatted_price',
        'period_text',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }

    public function getFormattedPriceAttribute(): string
    {
        if ($this->currency === 'IDR') {
            return 'Rp ' . number_format($this->price, 0, ',', '.');
        }
        return $this->currency . ' ' . number_format($this->price, 2);
    }

    public function getPeriodTextAttribute(): string
    {
        $unitMap = [
            'day' => 'hari',
            'month' => 'bulan',
            'year' => 'tahun',
        ];

        $unit = $unitMap[$this->period_unit] ?? $this->period_unit;
        return $this->period > 1 ? "{$this->period} {$unit}" : $unit;
    }
}
