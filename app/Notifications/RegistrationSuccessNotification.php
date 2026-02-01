<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Transaction;

class RegistrationSuccessNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $transaction;

    public function __construct(?Transaction $transaction = null)
    {
        $this->transaction = $transaction;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $settings = \App\Models\Setting::first();

        return (new MailMessage)
            ->subject('Selamat Datang di ' . ($settings->app_name ?? 'ChatCepat'))
            ->view('emails.registration-success', [
                'user' => $notifiable,
                'transaction' => $this->transaction,
                'settings' => $settings,
                'subject' => 'Selamat Datang di ' . ($settings->app_name ?? 'ChatCepat'),
            ]);
    }
}
