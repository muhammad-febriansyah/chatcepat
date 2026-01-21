<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'phone',
        'address',
        'role',
        'nama_bisnis',
        'kategori_bisnis',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get the WhatsApp sessions for the user.
     */
    public function whatsappSessions()
    {
        return $this->hasMany(WhatsappSession::class);
    }

    /**
     * Get the business category for the user.
     */
    public function businessCategory()
    {
        return $this->belongsTo(BusinessCategory::class, 'kategori_bisnis', 'id');
    }

    /**
     * Get all transactions for the user.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the active subscription (latest paid transaction with valid period).
     * Uses subscription_expires_at for accurate expiration tracking (supports extension).
     */
    public function getActiveSubscription()
    {
        $paidTransaction = Transaction::where('user_id', $this->id)
            ->where('status', 'paid')
            ->whereNotNull('pricing_package_id')
            ->with('pricingPackage')
            ->latest('subscription_expires_at')
            ->first();

        if (!$paidTransaction || !$paidTransaction->pricingPackage) {
            return null;
        }

        $package = $paidTransaction->pricingPackage;

        // Use subscription_expires_at if available, otherwise calculate from paid_at (backward compatibility)
        if ($paidTransaction->subscription_expires_at) {
            $expiresAt = Carbon::parse($paidTransaction->subscription_expires_at);
        } else {
            $paidAt = Carbon::parse($paidTransaction->paid_at);
            $expiresAt = match ($package->period_unit) {
                'day' => $paidAt->copy()->addDays($package->period),
                'month' => $paidAt->copy()->addMonths($package->period),
                'year' => $paidAt->copy()->addYears($package->period),
                default => $paidAt->copy()->addMonths($package->period),
            };
        }

        // Check if subscription is still active
        if (Carbon::now()->greaterThan($expiresAt)) {
            return null;
        }

        return [
            'transaction_id' => $paidTransaction->id,
            'package_id' => $package->id,
            'package_name' => $package->name,
            'package_slug' => $package->slug,
            'features' => $package->features ?? [],
            'feature_keys' => $package->feature_keys ?? [],
            'paid_at' => $paidTransaction->paid_at,
            'expires_at' => $expiresAt->toDateTimeString(),
            'days_remaining' => Carbon::now()->diffInDays($expiresAt, false),
        ];
    }

    /**
     * Check if user has an active subscription.
     */
    public function hasActiveSubscription(): bool
    {
        return $this->getActiveSubscription() !== null;
    }

    /**
     * Get subscription info for frontend (includes package features).
     */
    public function getSubscriptionInfo(): array
    {
        $subscription = $this->getActiveSubscription();

        return [
            'has_subscription' => $subscription !== null,
            'subscription' => $subscription,
        ];
    }

    /**
     * Get WhatsApp session limit based on subscription package.
     * Returns the number of allowed sessions or PHP_INT_MAX for unlimited.
     */
    public function getWhatsappSessionLimit(): int
    {
        // Admin always has unlimited
        if ($this->role === 'admin') {
            return PHP_INT_MAX;
        }

        $subscription = $this->getActiveSubscription();

        if (!$subscription) {
            // No subscription = no access or minimal (1)
            return 1;
        }

        // Map package slug/name to WA session limit
        $packageLimits = [
            'basic' => 1,
            'medium' => 3,
            'pro' => 5,
            'enterprise' => PHP_INT_MAX, // unlimited
        ];

        $packageSlug = strtolower($subscription['package_slug'] ?? $subscription['package_name'] ?? '');

        return $packageLimits[$packageSlug] ?? 1;
    }

    /**
     * Check if user can create more WhatsApp sessions.
     */
    public function canCreateMoreWhatsappSessions(): bool
    {
        $currentCount = $this->whatsappSessions()->count();
        $limit = $this->getWhatsappSessionLimit();

        return $currentCount < $limit;
    }

    /**
     * Get Telegram bot limit based on subscription package.
     */
    public function getTelegramBotLimit(): int
    {
        if ($this->role === 'admin') {
            return PHP_INT_MAX;
        }

        $subscription = $this->getActiveSubscription();

        if (!$subscription) {
            return 1;
        }

        $packageLimits = [
            'basic' => 1,
            'medium' => 2,
            'pro' => 5,
            'enterprise' => PHP_INT_MAX,
        ];

        $packageSlug = strtolower($subscription['package_slug'] ?? $subscription['package_name'] ?? '');

        return $packageLimits[$packageSlug] ?? 1;
    }
}
