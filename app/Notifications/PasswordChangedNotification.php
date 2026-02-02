<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via($notifiable): array
    {
        if (\App\Models\Setting::get('mailketing_api_token')) {
            return [\App\Notifications\Channels\MailketingChannel::class];
        }
        return ['mail'];
    }

    public function toMailketing($notifiable)
    {
        $template = \App\Models\Setting::get('mail_template_password_change') ??
            '<p>Halo {user_name},</p><p>Kami memberitahu Anda bahwa kata sandi akun {site_name} Anda baru saja diubah pada <b>{date_time}</b>.</p><p>Jika Anda tidak merasa melakukan perubahan ini, segera hubungi tim dukungan kami untuk mengamankan akun Anda.</p>';

        $siteName = \App\Models\Setting::get('site_name', 'ChatCepat');
        $replacements = [
            '{user_name}' => $notifiable->name,
            '{site_name}' => $siteName,
            '{date_time}' => now()->format('d M Y H:i'),
        ];

        return [
            'subject' => 'Keamanan: Kata Sandi Anda Telah Diubah - ' . $siteName,
            'content' => str_replace(array_keys($replacements), array_values($replacements), $template),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $settings = \App\Models\Setting::first();

        return (new MailMessage)
            ->subject('Password Anda Telah Diubah')
            ->view('emails.password-changed', [
                'user' => $notifiable,
                'settings' => $settings,
                'subject' => 'Password Anda Telah Diubah',
            ]);
    }
}
