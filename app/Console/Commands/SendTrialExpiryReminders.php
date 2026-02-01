<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\TrialExpiryReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendTrialExpiryReminders extends Command
{
    protected $signature = 'reminders:trial-expiry';
    protected $description = 'Send trial expiry reminder emails to users';

    public function handle(): int
    {
        $this->info('Sending trial expiry reminders...');

        // Reminder intervals: 7 days, 3 days, 1 day before expiry
        $reminderDays = [7, 3, 1];

        foreach ($reminderDays as $days) {
            $targetDate = now()->addDays($days)->startOfDay();

            $users = User::whereHas('subscription', function ($query) use ($targetDate) {
                $query->where('package_id', 1) // Assuming package_id 1 is Trial
                    ->whereDate('expires_at', $targetDate);
            })->get();

            foreach ($users as $user) {
                try {
                    $user->notify(new TrialExpiryReminderNotification($days));
                    $this->info("Sent {$days}-day reminder to: {$user->email}");

                    Log::info('Trial expiry reminder sent', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'days_remaining' => $days,
                    ]);
                } catch (\Exception $e) {
                    $this->error("Failed to send reminder to {$user->email}: " . $e->getMessage());

                    Log::error('Failed to send trial expiry reminder', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $this->info("Sent {$users->count()} reminders for {$days}-day interval");
        }

        $this->info('Trial expiry reminders completed!');
        return Command::SUCCESS;
    }
}
