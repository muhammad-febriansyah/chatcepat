<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrialExpiryReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $daysRemaining;

    public function __construct(int $daysRemaining)
    {
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
            ->subject($urgency . ': Masa Trial Anda Akan Berakhir dalam ' . $this->daysRemaining . ' Hari')
            ->view('emails.trial-expiry-reminder', [
                'user' => $notifiable,
                'daysRemaining' => $this->daysRemaining,
                'settings' => $settings,
                'subject' => $urgency . ': Masa Trial Anda Akan Berakhir dalam ' . $this->daysRemaining . ' Hari',
            ]);
    }
}
