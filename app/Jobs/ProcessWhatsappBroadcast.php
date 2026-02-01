<?php

namespace App\Jobs;

use App\Models\WhatsappBroadcast;
use App\Models\WhatsappSession;
use App\Models\WhatsappMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessWhatsappBroadcast implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 7200; // 2 hours timeout

    /**
     * Create a new job instance.
     */
    public function __construct(
        public WhatsappBroadcast $broadcast
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Update status to processing
        $this->broadcast->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);

        $session = $this->broadcast->session;

        // Verify session is still connected
        if ($session->status !== 'connected') {
            $this->broadcast->update([
                'status' => 'failed',
                'error_message' => 'WhatsApp session is not connected',
                'completed_at' => now(),
            ]);
            return;
        }

        $recipients = $this->broadcast->recipient_numbers;
        $message = $this->broadcast->content;
        $successCount = 0;
        $failedCount = 0;

        // Anti-ban configuration
        $batchSize = 20; // Send in batches of 20
        $messageCount = 0;
        $minDelay = 7000000; // 7 seconds (in microseconds)
        $maxDelay = 10000000; // 10 seconds (in microseconds)
        $batchCooldown = 60; // 60 seconds cooldown after each batch

        Log::info("Starting broadcast #{$this->broadcast->id} to {$this->broadcast->total_recipients} recipients");

        foreach ($recipients as $index => $recipient) {
            try {
                $this->sendMessage($session, $recipient, $message);
                $successCount++;
                $messageCount++;

                // Update progress periodically
                if ($successCount % 10 === 0) {
                    $this->broadcast->update([
                        'sent_count' => $successCount,
                        'failed_count' => $failedCount,
                    ]);
                }

                // Random delay between messages (7-10 seconds)
                $randomDelay = rand($minDelay, $maxDelay);
                usleep($randomDelay);

                // Cooldown after batch
                if ($messageCount >= $batchSize && ($index + 1) < count($recipients)) {
                    Log::info("Batch of {$batchSize} messages sent. Cooling down for {$batchCooldown} seconds...");
                    sleep($batchCooldown);
                    $messageCount = 0;
                }
            } catch (\Exception $e) {
                $failedCount++;
                Log::error('Broadcast send failed for recipient: ' . $recipient, [
                    'broadcast_id' => $this->broadcast->id,
                    'error' => $e->getMessage(),
                ]);

                // Still delay even on failure
                usleep(rand($minDelay, $maxDelay));
            }
        }

        // Final update
        $this->broadcast->update([
            'sent_count' => $successCount,
            'failed_count' => $failedCount,
            'status' => $failedCount === count($recipients) ? 'failed' : 'completed',
            'completed_at' => now(),
        ]);

        Log::info("Broadcast #{$this->broadcast->id} completed. Success: {$successCount}, Failed: {$failedCount}");
    }

    /**
     * Send a single WhatsApp message
     */
    private function sendMessage(WhatsappSession $session, string $recipient, string $message): void
    {
        // Clean phone number
        $cleanNumber = preg_replace('/[^0-9]/', '', $recipient);

        // Ensure number starts with country code (62 for Indonesia)
        if (!str_starts_with($cleanNumber, '62')) {
            if (str_starts_with($cleanNumber, '0')) {
                $cleanNumber = '62' . substr($cleanNumber, 1);
            } else {
                $cleanNumber = '62' . $cleanNumber;
            }
        }

        $gatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');

        // Check if broadcast has media
        $mediaMetadata = $this->broadcast->media_metadata;

        if ($mediaMetadata && isset($mediaMetadata['file_path'])) {
            // Send message with media
            $fileUrl = asset('storage/' . $mediaMetadata['file_path']);

            $response = Http::timeout(60)->post($gatewayUrl . '/api/send-media', [
                'sessionId' => $session->session_id,
                'to' => $cleanNumber,
                'mediaUrl' => $fileUrl,
                'caption' => $message ?: '',
            ]);
        } else {
            // Send text-only message
            $response = Http::timeout(60)->post($gatewayUrl . '/api/send-message', [
                'sessionId' => $session->session_id,
                'to' => $cleanNumber,
                'message' => $message,
            ]);
        }

        if (!$response->successful()) {
            $errorBody = $response->body();
            throw new \Exception("API request failed: {$errorBody}");
        }

        $responseData = $response->json();

        // Store message to database
        WhatsappMessage::create([
            'whatsapp_session_id' => $session->id,
            'message_id' => $responseData['messageId'] ?? uniqid(),
            'from_number' => $session->phone_number,
            'to_number' => $cleanNumber,
            'direction' => 'outgoing',
            'type' => $mediaMetadata ? 'document' : 'text',
            'content' => $message,
            'status' => 'sent',
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        $this->broadcast->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
            'completed_at' => now(),
        ]);

        Log::error("Broadcast #{$this->broadcast->id} job failed", [
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
