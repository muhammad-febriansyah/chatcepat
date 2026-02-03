<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Transaction;

class PaymentFailedNotification extends Notification implements ShouldQueue
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
        $template = \App\Models\Setting::get('mail_template_payment_failed') ??
            '<p>Halo {user_name},</p><p>Kami informasikan bahwa pembayaran Anda untuk paket <b>{package_name}</b> gagal diproses.</p><p>ID Transaksi: <b>#{transaction_id}</b></p><p>Silakan coba lagi dengan metode pembayaran lain atau hubungi customer service kami jika Anda mengalami kendala.</p><p align="center"><a href="{retry_link}" style="display:inline-block;padding:12px 25px;background-color:#2547F9;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold;">Coba Lagi</a></p>';

        $siteName = \App\Models\Setting::get('site_name', 'ChatCepat');
        $replacements = [
            '{user_name}' => $notifiable->name,
            '{site_name}' => $siteName,
            '{transaction_id}' => $this->transaction->id,
            '{package_name}' => $this->transaction->package_name ?? ($this->transaction->pricingPackage->name ?? 'Paket'),
            '{retry_link}' => url('/user/topup'),
        ];

        return [
            'subject' => 'Pembayaran Gagal - ' . $siteName,
            'content' => str_replace(array_keys($replacements), array_values($replacements), $template),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $settings = \App\Models\Setting::first();

        return (new MailMessage)
            ->subject('Pembayaran Gagal')
            ->view('emails.payment-failed', [
                'user' => $notifiable,
                'transaction' => $this->transaction,
                'settings' => $settings,
                'subject' => 'Pembayaran Gagal',
            ]);
    }
}
