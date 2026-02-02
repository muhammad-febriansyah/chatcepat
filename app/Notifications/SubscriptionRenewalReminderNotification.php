<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\UserSubscription;

class SubscriptionRenewalReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $subscription;
    protected $daysRemaining;

    public function __construct(UserSubscription $subscription, int $daysRemaining)
    {
        $this->subscription = $subscription;
        $this->daysRemaining = $daysRemaining;
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
        $template = \App\Models\Setting::get('mail_template_package_reminder') ??
            '<p>Halo {user_name},</p><p>Kami ingin mengingatkan bahwa paket <b>{package_name}</b> Anda akan berakhir pada <b>{expiry_date}</b>.</p><p>Pastikan saldo Anda mencukupi untuk perpanjangan otomatis atau lakukan perpanjangan manual melalui dashboard untuk terus menikmati layanan {site_name}.</p><p>Terima kasih telah menjadi bagian dari kami.</p>';
        if (!$template)
            return null;

        $siteName = \App\Models\Setting::get('site_name', 'ChatCepat');
        $replacements = [
            '{user_name}' => $notifiable->name,
            '{site_name}' => $siteName,
            '{package_name}' => $this->subscription->package->name ?? 'Paket',
            '{expiry_date}' => $this->subscription->expires_at ? \Carbon\Carbon::parse($this->subscription->expires_at)->format('d M Y') : '-',
        ];

        return [
            'subject' => 'Pengingat: Masa Aktif Paket Segera Berakhir - ' . $siteName,
            'content' => str_replace(array_keys($replacements), array_values($replacements), $template),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $settings = \App\Models\Setting::first();
        $urgency = $this->daysRemaining <= 3 ? 'PENTING' : 'Pengingat';

        return (new MailMessage)
            ->subject($urgency . ': Paket ' . ($this->subscription->package->name ?? 'Layanan') . ' Akan Berakhir dalam ' . $this->daysRemaining . ' Hari')
            ->view('emails.subscription-renewal-reminder', [
                'user' => $notifiable,
                'subscription' => $this->subscription,
                'daysRemaining' => $this->daysRemaining,
                'settings' => $settings,
                'subject' => $urgency . ': Paket ' . ($this->subscription->package->name ?? 'Layanan') . ' Akan Berakhir dalam ' . $this->daysRemaining . ' Hari',
            ]);
    }
}
