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
        if (\App\Models\Setting::get('mailketing_api_token')) {
            return [\App\Notifications\Channels\MailketingChannel::class];
        }
        return ['mail'];
    }

    public function toMailketing($notifiable)
    {
        $template = \App\Models\Setting::get('mail_template_upgrade_success') ??
            '<p>Halo {user_name},</p><p>Selamat! Paket Anda telah berhasil di-upgrade dari <b>{old_package_name}</b> menjadi <b>{new_package_name}</b>.</p><p>Sekarang Anda memiliki akses ke fitur-fitur yang lebih lengkap untuk mendukung pertumbuhan bisnis Anda.</p><p>Terima kasih telah mempercayai {site_name}.</p>';

        $siteName = \App\Models\Setting::get('site_name', 'ChatCepat');
        $replacements = [
            '{user_name}' => $notifiable->name,
            '{site_name}' => $siteName,
            '{new_package_name}' => $this->subscription->package->name,
            '{old_package_name}' => $this->oldPackage,
        ];

        return [
            'subject' => 'Selamat! Upgrade Paket Berhasil - ' . $siteName,
            'content' => str_replace(array_keys($replacements), array_values($replacements), $template),
        ];
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
