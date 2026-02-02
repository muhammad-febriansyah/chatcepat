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
        if (\App\Models\Setting::get('mailketing_api_token')) {
            return [\App\Notifications\Channels\MailketingChannel::class];
        }
        return ['mail'];
    }

    public function toMailketing($notifiable)
    {
        $template = \App\Models\Setting::get('mail_template_trial_reminder') ??
            '<p>Halo {user_name},</p><p>Masa trial gratis Anda di {site_name} akan berakhir dalam <b>{days_left} hari</b>.</p><p>Agar tetap bisa menikmati akses tanpa gangguan ke seluruh fitur kami, silakan pilih paket berlangganan yang sesuai dengan kebutuhan Anda.</p><p>Jangan biarkan produktivitas Anda terhenti!</p>';

        $siteName = \App\Models\Setting::get('site_name', 'ChatCepat');
        $replacements = [
            '{user_name}' => $notifiable->name,
            '{site_name}' => $siteName,
            '{days_left}' => $this->daysRemaining,
        ];

        return [
            'subject' => ($this->daysRemaining <= 3 ? 'PENTING: ' : 'Pengingat: ') . 'Masa Trial Berakhir dalam ' . $this->daysRemaining . ' Hari',
            'content' => str_replace(array_keys($replacements), array_values($replacements), $template),
        ];
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
