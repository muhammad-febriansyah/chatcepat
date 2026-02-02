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
        if (\App\Models\Setting::get('mailketing_api_token')) {
            return [\App\Notifications\Channels\MailketingChannel::class];
        }
        return ['mail'];
    }

    public function toMailketing($notifiable)
    {
        $template = \App\Models\Setting::get('mail_template_registration_success') ??
            '<p>Halo {user_name},</p><p>Selamat! Akun Anda di {site_name} telah berhasil dibuat.</p><p>Langkah terakhir adalah melakukan pembayaran sebesar <b>{payment_amount}</b> untuk mengaktifkan paket Anda.</p><p>Silakan klik tombol di bawah ini untuk melihat detail pembayaran:</p><p align="center"><a href="{payment_link}" style="display:inline-block;padding:12px 25px;background-color:#2547F9;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold;">Selesaikan Pembayaran</a></p><p>Jika tombol tidak berfungsi, Anda bisa menggunakan link ini: <br> {payment_link}</p>';

        $siteName = \App\Models\Setting::get('site_name', 'ChatCepat');
        $replacements = [
            '{user_name}' => $notifiable->name,
            '{site_name}' => $siteName,
            '{payment_amount}' => $this->transaction ? 'Rp ' . number_format($this->transaction->total_amount ?? $this->transaction->amount ?? 0, 0, ',', '.') : '-',
            '{payment_link}' => $this->transaction ? url('/payment/' . $this->transaction->id) : '-',
        ];

        return [
            'subject' => 'Selamat Datang di ' . $siteName,
            'content' => str_replace(array_keys($replacements), array_values($replacements), $template),
        ];
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
