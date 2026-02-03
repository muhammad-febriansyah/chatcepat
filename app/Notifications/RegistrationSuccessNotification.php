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
        $siteName = \App\Models\Setting::get('site_name', 'ChatCepat');

        // Check if this is a trial package (free/auto-activated)
        $isTrial = $this->transaction &&
                   $this->transaction->payment_method === 'free_trial' &&
                   $this->transaction->status === 'paid';

        if ($isTrial) {
            // Trial activated template
            $template = \App\Models\Setting::get('mail_template_trial_activated') ??
                '<p>Halo {user_name},</p><p>Selamat! Akun trial Anda di {site_name} telah berhasil diaktifkan.</p><p>Paket: <b>{package_name}</b></p><p>Masa aktif hingga: <b>{expires_at}</b></p><p>Anda sekarang dapat mulai menggunakan semua fitur yang tersedia di paket trial.</p><p align="center"><a href="{dashboard_link}" style="display:inline-block;padding:12px 25px;background-color:#2547F9;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold;">Mulai Sekarang</a></p><p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.</p>';

            $replacements = [
                '{user_name}' => $notifiable->name,
                '{site_name}' => $siteName,
                '{package_name}' => $this->transaction->pricingPackage->name ?? 'Trial',
                '{expires_at}' => $this->transaction->subscription_expires_at ? $this->transaction->subscription_expires_at->format('d M Y') : '-',
                '{dashboard_link}' => url('/user/dashboard'),
            ];

            $subject = 'Trial Anda di ' . $siteName . ' Telah Aktif!';
        } else {
            // Registration with pending payment template
            $template = \App\Models\Setting::get('mail_template_registration_success') ??
                '<p>Halo {user_name},</p><p>Selamat! Akun Anda di {site_name} telah berhasil dibuat.</p><p>Langkah terakhir adalah melakukan pembayaran sebesar <b>{payment_amount}</b> untuk mengaktifkan paket Anda.</p><p>Silakan klik tombol di bawah ini untuk melihat detail pembayaran:</p><p align="center"><a href="{payment_link}" style="display:inline-block;padding:12px 25px;background-color:#2547F9;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold;">Selesaikan Pembayaran</a></p><p>Jika tombol tidak berfungsi, Anda bisa menggunakan link ini: <br> {payment_link}</p>';

            $replacements = [
                '{user_name}' => $notifiable->name,
                '{site_name}' => $siteName,
                '{payment_amount}' => $this->transaction ? 'Rp ' . number_format($this->transaction->total_amount ?? $this->transaction->amount ?? 0, 0, ',', '.') : '-',
                '{payment_link}' => $this->transaction ? url('/user/transactions/' . $this->transaction->id) : url('/user/topup'),
            ];

            $subject = 'Selamat Datang di ' . $siteName;
        }

        return [
            'subject' => $subject,
            'content' => str_replace(array_keys($replacements), array_values($replacements), $template),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $settings = \App\Models\Setting::first();
        $siteName = $settings->site_name ?? 'ChatCepat';

        // Check if this is a trial package (free/auto-activated)
        $isTrial = $this->transaction &&
                   $this->transaction->payment_method === 'free_trial' &&
                   $this->transaction->status === 'paid';

        $subject = $isTrial
            ? 'Trial Anda di ' . $siteName . ' Telah Aktif!'
            : 'Selamat Datang di ' . $siteName;

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.registration-success', [
                'user' => $notifiable,
                'transaction' => $this->transaction,
                'isTrial' => $isTrial,
                'settings' => $settings,
                'subject' => $subject,
            ]);
    }
}
