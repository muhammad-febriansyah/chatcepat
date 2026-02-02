<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Transaction;

class PaymentSuccessNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $transaction;

    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }

    public function via($notifiable): array
    {
        if (\App\Models\Setting::get('mailketing_api_token')) {
            return [\App\Notifications\Channels\MailketingChannel::class];
        }
        return ['mail'];
    }

    public function toMailketing($notifiable)
    {
        $template = \App\Models\Setting::get('mail_template_payment_success') ??
            '<p>Halo {user_name},</p><p>Terima kasih! Pembayaran Anda telah kami terima.</p><p>Paket <b>{package_name}</b> Anda telah aktif dan siap digunakan untuk meningkatkan bisnis Anda.</p><p>ID Transaksi: <b>#{transaction_id}</b></p><p>Silakan login ke dashboard untuk mulai menggunakan fitur-fitur kami.</p>';

        $siteName = \App\Models\Setting::get('site_name', 'ChatCepat');
        $replacements = [
            '{user_name}' => $notifiable->name,
            '{site_name}' => $siteName,
            '{transaction_id}' => $this->transaction->id,
            '{package_name}' => $this->transaction->package_name ?? ($this->transaction->package->name ?? 'Paket'),
        ];

        return [
            'subject' => 'Pembayaran Berhasil Diterima - ' . $siteName,
            'content' => str_replace(array_keys($replacements), array_values($replacements), $template),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $settings = \App\Models\Setting::first();

        return (new MailMessage)
            ->subject('Pembayaran Berhasil')
            ->view('emails.payment-success', [
                'user' => $notifiable,
                'transaction' => $this->transaction,
                'settings' => $settings,
                'subject' => 'Pembayaran Berhasil',
            ]);
    }
}
