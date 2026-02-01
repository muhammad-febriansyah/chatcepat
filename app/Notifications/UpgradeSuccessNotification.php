<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\UserSubscription;

class UpgradeSuccessNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $subscription;
    protected $oldPackage;

    public function __construct(UserSubscription $subscription, string $oldPackage)
    {
        $this->subscription = $subscription;
        $this->oldPackage = $oldPackage;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $settings = \App\Models\Setting::first();

        return (new MailMessage)
            ->subject('Upgrade Paket Berhasil')
            ->view('emails.upgrade-success', [
                'user' => $notifiable,
                'subscription' => $this->subscription,
                'oldPackage' => $this->oldPackage,
                'settings' => $settings,
                'subject' => 'Upgrade Paket Berhasil',
            ]);
    }
}
