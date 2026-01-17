<?php

namespace App\Jobs;

use App\Models\EmailBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendBroadcastEmail implements ShouldQueue
{
    use Queueable;

    public $broadcast;
    public $tries = 3;
    public $timeout = 300; // 5 minutes

    /**
     * Create a new job instance.
     */
    public function __construct(EmailBroadcast $broadcast)
    {
        $this->broadcast = $broadcast;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Mark as processing
            $this->broadcast->markAsProcessing();

            $smtpSetting = $this->broadcast->smtpSetting;

            // Configure mail with broadcast SMTP
            config([
                'mail.mailers.smtp.host' => $smtpSetting->host,
                'mail.mailers.smtp.port' => $smtpSetting->port,
                'mail.mailers.smtp.username' => $smtpSetting->username,
                'mail.mailers.smtp.password' => $smtpSetting->password,
                'mail.mailers.smtp.encryption' => $smtpSetting->encryption === 'none' ? null : $smtpSetting->encryption,
                'mail.from.address' => $smtpSetting->from_address,
                'mail.from.name' => $smtpSetting->from_name,
            ]);

            $failedEmails = [];
            $sentCount = 0;

            // Send email to each recipient
            foreach ($this->broadcast->recipient_emails as $email) {
                try {
                    Mail::send([], [], function ($message) use ($email) {
                        $message->to($email)
                            ->subject($this->broadcast->subject)
                            ->html($this->broadcast->content);
                    });

                    $sentCount++;
                    $this->broadcast->incrementSent();

                    // Add small delay to prevent rate limiting
                    usleep(100000); // 0.1 second delay
                } catch (\Exception $e) {
                    Log::error('Failed to send email to ' . $email . ': ' . $e->getMessage());
                    $failedEmails[] = [
                        'email' => $email,
                        'error' => $e->getMessage(),
                    ];
                    $this->broadcast->incrementFailed();
                }
            }

            // Update broadcast status
            $this->broadcast->update([
                'failed_emails' => $failedEmails,
            ]);

            $this->broadcast->markAsCompleted();

            Log::info('Broadcast email completed', [
                'broadcast_id' => $this->broadcast->id,
                'sent' => $sentCount,
                'failed' => count($failedEmails),
            ]);
        } catch (\Exception $e) {
            Log::error('Broadcast email failed: ' . $e->getMessage());
            $this->broadcast->markAsFailed();
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Broadcast email job failed permanently', [
            'broadcast_id' => $this->broadcast->id,
            'error' => $exception->getMessage(),
        ]);

        $this->broadcast->markAsFailed();
    }
}
