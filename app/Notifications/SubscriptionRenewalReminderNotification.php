<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\UserSubscription;

class SubscriptionRenewalReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $subscription;
    protected $daysRemaining;

    public function __construct(UserSubscription $subscription, int $daysRemaining)
    {
        $this->subscription = $subscription;
        $this->daysRemaining = $daysRemaining;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $settings = \App\Models\Setting::first();
        $urgency = $this->daysRemaining <= 3 ? 'PENTING' : 'Pengingat';

        return (new MailMessage)
            ->subject($urgency . ': Paket ' . $this->subscription->package->name . ' Akan Berakhir dalam ' . $this->daysRemaining . ' Hari')
            ->view('emails.subscription-renewal-reminder', [
                'user' => $notifiable,
                'subscription' => $this->subscription,
                'daysRemaining' => $this->daysRemaining,
                'settings' => $settings,
                'subject' => $urgency . ': Paket ' . $this->subscription->package->name . ' Akan Berakhir dalam ' . $this->daysRemaining . ' Hari',
            ]);
    }
}
