<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Transaction;
use App\Models\PricingPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TesterUserSeeder extends Seeder
{
    public function run(): void
    {
        // Find Enterprise package
        $enterprisePackage = PricingPackage::where('slug', 'enterprise')
            ->orWhere('name', 'like', '%enterprise%')
            ->first();

        if (!$enterprisePackage) {
            $this->command->error('Enterprise package not found!');
            return;
        }

        // Create user
        $user = User::updateOrCreate(
            ['email' => 'muhammadfebriansyah@tester.com'],
            [
                'name' => 'Muhammad Febriansyah',
                'password' => Hash::make('password123'),
                'phone' => '+6281234567890',
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        // Create paid transaction for Enterprise package
        $now = Carbon::now();
        $subscriptionExpiresAt = match ($enterprisePackage->period_unit) {
            'day' => $now->copy()->addDays($enterprisePackage->period),
            'month' => $now->copy()->addMonths($enterprisePackage->period),
            'year' => $now->copy()->addYears($enterprisePackage->period),
            default => $now->copy()->addMonths($enterprisePackage->period),
        };

        Transaction::updateOrCreate(
            [
                'user_id' => $user->id,
                'pricing_package_id' => $enterprisePackage->id,
                'status' => 'paid',
            ],
            [
                'invoice_number' => Transaction::generateInvoiceNumber(),
                'merchant_order_id' => Transaction::generateMerchantOrderId(),
                'amount' => $enterprisePackage->price,
                'payment_method' => 'manual',
                'paid_at' => $now,
                'subscription_expires_at' => $subscriptionExpiresAt,
                'notes' => 'Akun tester - Enterprise package',
            ]
        );

        $this->command->info('Tester user created successfully!');
        $this->command->info('Email: muhammadfebriansyah@tester.com');
        $this->command->info('Password: password123');
        $this->command->info('Package: ' . $enterprisePackage->name);
        $this->command->info('Expires: ' . $subscriptionExpiresAt->format('Y-m-d H:i:s'));
    }
}
