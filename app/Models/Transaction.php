<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'pricing_package_id',
        'bank_id',
        'invoice_number',
        'reference',
        'amount',
        'payment_method',
        'payment_code',
        'merchant_order_id',
        'payment_url',
        'va_number',
        'qr_string',
        'proof_image',
        'status',
        'paid_at',
        'subscription_expires_at',
        'expired_at',
        'customer_info',
        'callback_response',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'subscription_expires_at' => 'datetime',
        'expired_at' => 'datetime',
        'customer_info' => 'array',
        'callback_response' => 'array',
    ];

    /**
     * Get the user that owns the transaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the pricing package associated with the transaction
     */
    public function pricingPackage(): BelongsTo
    {
        return $this->belongsTo(PricingPackage::class);
    }

    /**
     * Get the bank associated with the transaction
     */
    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
    }

    /**
     * Scope untuk filter berdasarkan status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk transaksi pending
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope untuk transaksi berhasil
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    /**
     * Check if transaction is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if transaction is paid
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Mark transaction as paid and calculate subscription expiration
     * If user has active subscription, extends from current expiration
     * If not, starts from now
     */
    public function markAsPaid(): void
    {
        $now = Carbon::now();
        $package = $this->pricingPackage;
        $user = $this->user;

        // Determine the base date for subscription calculation
        $baseDate = $now;

        // Check if user has an active subscription
        $activeSubscription = $user->getActiveSubscription();
        if ($activeSubscription) {
            $currentExpiration = Carbon::parse($activeSubscription['expires_at']);
            // If current subscription is still active, extend from expiration date
            if ($currentExpiration->greaterThan($now)) {
                $baseDate = $currentExpiration;
            }
        }

        // Calculate new expiration date based on package period
        $subscriptionExpiresAt = match ($package->period_unit) {
            'day' => $baseDate->copy()->addDays($package->period),
            'month' => $baseDate->copy()->addMonths($package->period),
            'year' => $baseDate->copy()->addYears($package->period),
            default => $baseDate->copy()->addMonths($package->period),
        };

        $this->update([
            'status' => 'paid',
            'paid_at' => $now,
            'subscription_expires_at' => $subscriptionExpiresAt,
        ]);
    }

    /**
     * Mark transaction as failed
     */
    public function markAsFailed(): void
    {
        $this->update([
            'status' => 'failed',
        ]);
    }

    /**
     * Mark transaction as expired
     */
    public function markAsExpired(): void
    {
        $this->update([
            'status' => 'expired',
        ]);
    }

    /**
     * Generate unique invoice number
     */
    public static function generateInvoiceNumber(): string
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));

        return "{$prefix}/{$date}/{$random}";
    }

    /**
     * Generate unique merchant order ID
     */
    public static function generateMerchantOrderId(): string
    {
        return 'ORD-' . time() . '-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
    }
}
