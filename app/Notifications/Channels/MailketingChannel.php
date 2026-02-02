<?php

namespace App\Notifications\Channels;

use App\Services\MailketingService;
use Illuminate\Notifications\Notification;

class MailketingChannel
{
    protected $mailketing;

    public function __construct(MailketingService $mailketing)
    {
        $this->mailketing = $mailketing;
    }

    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toMailketing')) {
            return;
        }

        $message = $notification->toMailketing($notifiable);

        if (!$message) {
            return;
        }

        $this->mailketing->send(
            $message['recipient'] ?? $notifiable->routeNotificationFor('mail', $notification),
            $message['subject'],
            $message['content']
        );
    }
}
