<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'code',
        'price',
        'sale_price',
        'description',
        'short_description',
        'image_url',
        'category',
        'message_template',
        'is_active',
        'stock',
        'metadata',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'is_active' => 'boolean',
        'stock' => 'integer',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get formatted sale price
     */
    public function getFormattedSalePriceAttribute(): ?string
    {
        if (!$this->sale_price) {
            return null;
        }
        return 'Rp ' . number_format($this->sale_price, 0, ',', '.');
    }

    /**
     * Get the display price (sale price if available, otherwise regular price)
     */
    public function getDisplayPriceAttribute(): string
    {
        return $this->sale_price
            ? $this->formatted_sale_price
            : $this->formatted_price;
    }

    /**
     * Generate WhatsApp message from template or default format
     */
    public function generateWhatsAppMessage(): string
    {
        if ($this->message_template) {
            // Replace placeholders in custom template
            $message = $this->message_template;
            $message = str_replace('{{nama}}', $this->name, $message);
            $message = str_replace('{{name}}', $this->name, $message);
            $message = str_replace('{{harga}}', $this->display_price, $message);
            $message = str_replace('{{price}}', $this->display_price, $message);
            $message = str_replace('{{deskripsi}}', $this->short_description ?? $this->description ?? '', $message);
            $message = str_replace('{{description}}', $this->short_description ?? $this->description ?? '', $message);
            $message = str_replace('{{kode}}', $this->code ?? '', $message);
            $message = str_replace('{{code}}', $this->code ?? '', $message);
            $message = str_replace('{{kategori}}', $this->category ?? '', $message);
            $message = str_replace('{{category}}', $this->category ?? '', $message);
            $message = str_replace('{{stok}}', $this->stock ?? 'Tersedia', $message);
            $message = str_replace('{{stock}}', $this->stock ?? 'Available', $message);

            return $message;
        }

        // Default template
        $message = "*{$this->name}*\n\n";

        if ($this->code) {
            $message .= "Kode: {$this->code}\n";
        }

        if ($this->sale_price) {
            $message .= "~{$this->formatted_price}~\n";
            $message .= "*{$this->formatted_sale_price}*\n\n";
        } else {
            $message .= "*{$this->formatted_price}*\n\n";
        }

        if ($this->short_description) {
            $message .= "{$this->short_description}\n\n";
        } elseif ($this->description) {
            // Truncate long description
            $desc = strlen($this->description) > 200
                ? substr($this->description, 0, 200) . '...'
                : $this->description;
            $message .= "{$desc}\n\n";
        }

        if ($this->stock !== null) {
            $message .= "Stok: {$this->stock}\n";
        }

        $message .= "\n_Ketik *BELI {$this->code}* untuk order_";

        return $message;
    }

    /**
     * Scope for active products
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for products by category
     */
    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
