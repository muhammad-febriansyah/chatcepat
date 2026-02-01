<?php

namespace App\Console\Commands;

use App\Models\UserSubscription;
use App\Notifications\SubscriptionRenewalReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendSubscriptionRenewalReminders extends Command
{
    protected $signature = 'reminders:subscription-renewal';
    protected $description = 'Send subscription renewal reminder emails to users';

    public function handle(): int
    {
        $this->info('Sending subscription renewal reminders...');

        // Reminder intervals: 14 days, 7 days, 3 days, 1 day before expiry
        $reminderDays = [14, 7, 3, 1];

        foreach ($reminderDays as $days) {
            $targetDate = now()->addDays($days)->startOfDay();

            $subscriptions = UserSubscription::with(['user', 'package'])
                ->where('status', 'active')
                ->where('package_id', '>', 1) // Exclude Trial package
                ->whereDate('expires_at', $targetDate)
                ->get();

            foreach ($subscriptions as $subscription) {
                try {
                    $subscription->user->notify(
                        new SubscriptionRenewalReminderNotification($subscription, $days)
                    );

                    $this->info("Sent {$days}-day reminder to: {$subscription->user->email} (Package: {$subscription->package->name})");

                    Log::info('Subscription renewal reminder sent', [
                        'user_id' => $subscription->user_id,
                        'email' => $subscription->user->email,
                        'package' => $subscription->package->name,
                        'days_remaining' => $days,
                        'expires_at' => $subscription->expires_at,
                    ]);
                } catch (\Exception $e) {
                    $this->error("Failed to send reminder to {$subscription->user->email}: " . $e->getMessage());

                    Log::error('Failed to send subscription renewal reminder', [
                        'user_id' => $subscription->user_id,
                        'email' => $subscription->user->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $this->info("Sent {$subscriptions->count()} reminders for {$days}-day interval");
        }

        $this->info('Subscription renewal reminders completed!');
        return Command::SUCCESS;
    }
}
