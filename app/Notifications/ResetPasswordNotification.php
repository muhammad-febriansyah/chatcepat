<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{

    public $token;

    public function __construct($token)
    {
        $this->token = $token;
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
        $template = \App\Models\Setting::get('mail_template_reset_password') ??
            '<p>Halo {user_name},</p><p>Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.</p><p align="center"><a href="{reset_url}" style="display:inline-block;padding:12px 25px;background-color:#2547F9;color:#ffffff;text-decoration:none;border-radius:5px;font-weight:bold;">Reset Password</a></p><p>Link reset password ini akan kadaluarsa dalam 60 menit.</p><p>Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini.</p>';

        $siteName = \App\Models\Setting::get('site_name', 'ChatCepat');
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        $replacements = [
            '{user_name}' => $notifiable->name,
            '{site_name}' => $siteName,
            '{reset_url}' => $resetUrl,
        ];

        return [
            'subject' => 'Link Reset Password - ' . $siteName,
            'content' => str_replace(array_keys($replacements), array_values($replacements), $template),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $settings = \App\Models\Setting::first();
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject('Link Reset Password - ' . ($settings->app_name ?? 'ChatCepat'))
            ->view('emails.reset-password', [
                'user' => $notifiable,
                'resetUrl' => $resetUrl,
                'settings' => $settings,
                'subject' => 'Reset Password Akun Anda',
            ]);
    }
}
