<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Models\MetaWhatsappMessage;
use App\Models\MetaInstagramMessage;
use App\Models\MetaFacebookMessage;
use App\Models\MetaAutoReply;
use App\Models\MetaContact;
use App\Models\User;
use App\Services\Meta\WhatsAppBusinessService;
use App\Services\Meta\InstagramMessagingService;
use App\Services\Meta\FacebookMessengerService;

class MetaWebhookController extends Controller
{
    /**
     * Verify webhook (GET request from Meta)
     */
    public function verify(Request $request): mixed
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        $verifyToken = config('meta.webhook_verify_token');

        Log::info('Meta Webhook verify request received', [
            'mode' => $mode,
            'token_received' => $token,
            'token_expected' => $verifyToken,
            'challenge' => $challenge,
            'user_agent' => $request->userAgent(),
            'ip' => $request->ip(),
        ]);

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('Meta Webhook verified successfully - returning challenge');
            return response($challenge, 200)
                ->header('Content-Type', 'text/plain');
        }

        Log::warning('Meta Webhook verification failed', [
            'mode' => $mode,
            'token_received' => $token,
            'token_expected' => $verifyToken,
            'match' => $token === $verifyToken
        ]);

        return response()->json(['error' => 'Verification failed'], 403);
    }

    /**
     * Handle webhook events (POST request from Meta)
     */
    public function handle(Request $request): JsonResponse
    {
        $data = $request->all();

        Log::info('Meta Webhook received', ['payload' => $data]);

        // Verify request signature for security
        if (!$this->verifySignature($request)) {
            Log::warning('Invalid webhook signature');
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        try {
            $object = $data['object'] ?? null;

            // Route to appropriate handler based on platform
            switch ($object) {
                case 'whatsapp_business_account':
                    $this->handleWhatsAppWebhook($data);
                    break;

                case 'instagram':
                    $this->handleInstagramWebhook($data);
                    break;

                case 'page':
                    $this->handleFacebookWebhook($data);
                    break;

                default:
                    Log::warning('Unknown webhook object type', ['object' => $object]);
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('Webhook processing error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Handle WhatsApp Business webhook
     */
    protected function handleWhatsAppWebhook(array $data): void
    {
        $entries = $data['entry'] ?? [];

        foreach ($entries as $entry) {
            $changes = $entry['changes'] ?? [];

            foreach ($changes as $change) {
                $value = $change['value'] ?? [];

                // Handle incoming messages
                if (isset($value['messages'])) {
                    foreach ($value['messages'] as $message) {
                        $this->processWhatsAppMessage($message, $value);
                    }
                }

                // Handle message status updates
                if (isset($value['statuses'])) {
                    foreach ($value['statuses'] as $status) {
                        $this->updateWhatsAppMessageStatus($status);
                    }
                }
            }
        }
    }

    /**
     * Process WhatsApp incoming message
     */
    protected function processWhatsAppMessage(array $message, array $value): void
    {
        $phoneNumberId = $value['metadata']['phone_number_id'] ?? null;
        $from = $message['from'] ?? null;
        $messageId = $message['id'] ?? null;
        $type = $message['type'] ?? 'text';

        // Find user by phone number ID
        $user = User::where('meta_whatsapp_phone_number_id', $phoneNumberId)->first();

        if (!$user) {
            Log::warning('User not found for phone number ID', ['phone_number_id' => $phoneNumberId]);
            return;
        }

        // Extract message content based on type
        $content = null;
        $media = null;

        switch ($type) {
            case 'text':
                $content = $message['text']['body'] ?? null;
                break;

            case 'image':
            case 'video':
            case 'audio':
            case 'document':
                $media = [
                    'id' => $message[$type]['id'] ?? null,
                    'mime_type' => $message[$type]['mime_type'] ?? null,
                    'caption' => $message[$type]['caption'] ?? null
                ];
                $content = $message[$type]['caption'] ?? null;
                break;

            case 'location':
                $media = $message['location'] ?? null;
                break;
        }

        // Save to database
        MetaWhatsappMessage::create([
            'user_id' => $user->id,
            'message_id' => $messageId,
            'wamid' => $messageId,
            'from' => $from,
            'to' => $phoneNumberId,
            'phone_number_id' => $phoneNumberId,
            'type' => $type,
            'direction' => 'inbound',
            'content' => $content,
            'media' => $media ? json_encode($media) : null,
            'status' => 'received',
            'sent_at' => now()
        ]);

        // Save or update contact
        $this->saveOrUpdateContact($user->id, 'whatsapp', $from, $value);

        // Process auto reply
        if ($content) {
            $this->processAutoReply($user, 'whatsapp', $from, $content);
        }

        Log::info('WhatsApp message saved', ['message_id' => $messageId]);
    }

    /**
     * Update WhatsApp message status
     */
    protected function updateWhatsAppMessageStatus(array $status): void
    {
        $messageId = $status['id'] ?? null;
        $statusType = $status['status'] ?? null; // sent, delivered, read, failed

        $message = MetaWhatsappMessage::where('wamid', $messageId)->first();

        if ($message) {
            $message->status = $statusType;

            if ($statusType === 'delivered') {
                $message->delivered_at = now();
            } elseif ($statusType === 'read') {
                $message->read_at = now();
            } elseif ($statusType === 'failed') {
                $message->error_message = $status['errors'][0]['title'] ?? 'Unknown error';
            }

            $message->save();
            Log::info('WhatsApp message status updated', ['message_id' => $messageId, 'status' => $statusType]);
        }
    }

    /**
     * Handle Instagram webhook
     */
    protected function handleInstagramWebhook(array $data): void
    {
        $entries = $data['entry'] ?? [];

        foreach ($entries as $entry) {
            $messaging = $entry['messaging'] ?? [];

            foreach ($messaging as $event) {
                if (isset($event['message'])) {
                    $this->processInstagramMessage($event);
                }
            }
        }
    }

    /**
     * Process Instagram incoming message
     */
    protected function processInstagramMessage(array $event): void
    {
        $sender = $event['sender']['id'] ?? null;
        $recipient = $event['recipient']['id'] ?? null;
        $message = $event['message'] ?? [];
        $messageId = $message['mid'] ?? null;

        // Find user by Instagram account ID
        $user = User::where('meta_instagram_account_id', $recipient)->first();

        if (!$user) {
            Log::warning('User not found for Instagram account', ['account_id' => $recipient]);
            return;
        }

        $type = 'text';
        $content = $message['text'] ?? null;
        $media = null;

        // Handle attachments
        if (isset($message['attachments'])) {
            $attachment = $message['attachments'][0];
            $type = $attachment['type'] ?? 'file';
            $media = [
                'type' => $type,
                'payload' => $attachment['payload'] ?? null
            ];
        }

        // Save to database
        MetaInstagramMessage::create([
            'user_id' => $user->id,
            'message_id' => $messageId,
            'ig_message_id' => $messageId,
            'from' => $sender,
            'to' => $recipient,
            'instagram_account_id' => $recipient,
            'type' => $type,
            'direction' => 'inbound',
            'content' => $content,
            'media' => $media ? json_encode($media) : null,
            'status' => 'received',
            'sent_at' => now()
        ]);

        Log::info('Instagram message saved', ['message_id' => $messageId]);
    }

    /**
     * Handle Facebook Messenger webhook
     */
    protected function handleFacebookWebhook(array $data): void
    {
        $entries = $data['entry'] ?? [];

        foreach ($entries as $entry) {
            $messaging = $entry['messaging'] ?? [];

            foreach ($messaging as $event) {
                if (isset($event['message'])) {
                    $this->processFacebookMessage($event);
                } elseif (isset($event['delivery'])) {
                    $this->updateFacebookMessageStatus($event['delivery'], 'delivered');
                } elseif (isset($event['read'])) {
                    $this->updateFacebookMessageStatus($event['read'], 'read');
                }
            }
        }
    }

    /**
     * Process Facebook Messenger incoming message
     */
    protected function processFacebookMessage(array $event): void
    {
        $sender = $event['sender']['id'] ?? null;
        $recipient = $event['recipient']['id'] ?? null;
        $message = $event['message'] ?? [];
        $messageId = $message['mid'] ?? null;

        // Find user by Facebook Page ID
        $user = User::where('meta_facebook_page_id', $recipient)->first();

        if (!$user) {
            Log::warning('User not found for Facebook page', ['page_id' => $recipient]);
            return;
        }

        $type = 'text';
        $content = $message['text'] ?? null;
        $attachments = null;
        $quickReply = null;

        // Handle quick reply
        if (isset($message['quick_reply'])) {
            $quickReply = $message['quick_reply'];
        }

        // Handle attachments
        if (isset($message['attachments'])) {
            $type = 'attachment';
            $attachments = $message['attachments'];
        }

        // Save to database
        MetaFacebookMessage::create([
            'user_id' => $user->id,
            'message_id' => $messageId,
            'fb_message_id' => $messageId,
            'from' => $sender,
            'to' => $recipient,
            'page_id' => $recipient,
            'type' => $type,
            'direction' => 'inbound',
            'content' => $content,
            'attachments' => $attachments ? json_encode($attachments) : null,
            'quick_replies' => $quickReply ? json_encode($quickReply) : null,
            'status' => 'received',
            'sent_at' => now()
        ]);

        Log::info('Facebook message saved', ['message_id' => $messageId]);
    }

    /**
     * Update Facebook message status
     */
    protected function updateFacebookMessageStatus(array $data, string $status): void
    {
        $mids = $data['mids'] ?? [];

        foreach ($mids as $mid) {
            $message = MetaFacebookMessage::where('fb_message_id', $mid)->first();

            if ($message) {
                $message->status = $status;

                if ($status === 'delivered') {
                    $message->delivered_at = now();
                } elseif ($status === 'read') {
                    $message->read_at = now();
                }

                $message->save();
            }
        }
    }

    /**
     * Save or update contact
     */
    protected function saveOrUpdateContact(int $userId, string $platform, string $identifier, array $data): void
    {
        $contactData = [
            'user_id' => $userId,
            'platform' => $platform,
            'identifier' => $identifier,
        ];

        // Extract name if available
        if (isset($data['contacts'][0]['profile']['name'])) {
            $contactData['name'] = $data['contacts'][0]['profile']['name'];
        }

        // Update or create contact
        $contact = MetaContact::updateOrCreate(
            ['user_id' => $userId, 'platform' => $platform, 'identifier' => $identifier],
            array_merge($contactData, ['last_message_at' => now()])
        );

        if (!$contact->wasRecentlyCreated) {
            $contact->touchLastMessage();
        }
    }

    /**
     * Process auto reply for incoming message
     */
    protected function processAutoReply(User $user, string $platform, string $recipient, string $messageContent): void
    {
        // Find matching auto replies
        $autoReplies = MetaAutoReply::where('user_id', $user->id)
            ->where('platform', $platform)
            ->where('is_active', true)
            ->orderBy('priority', 'desc')
            ->get();

        foreach ($autoReplies as $autoReply) {
            if ($autoReply->shouldTrigger($messageContent)) {
                // Check if should reply only to first message
                if ($autoReply->only_first_message) {
                    $previousMessages = match ($platform) {
                        'whatsapp' => MetaWhatsappMessage::where('user_id', $user->id)
                            ->where('from', $recipient)
                            ->where('direction', 'inbound')
                            ->count(),
                        'instagram' => MetaInstagramMessage::where('user_id', $user->id)
                            ->where('from', $recipient)
                            ->where('direction', 'inbound')
                            ->count(),
                        'facebook' => MetaFacebookMessage::where('user_id', $user->id)
                            ->where('from', $recipient)
                            ->where('direction', 'inbound')
                            ->count(),
                    };

                    if ($previousMessages > 1) {
                        continue; // Skip if not first message
                    }
                }

                // Send auto reply
                $this->sendAutoReply($user, $platform, $recipient, $autoReply);

                // Increment usage count
                $autoReply->incrementUsage();

                // Stop after first match (highest priority)
                break;
            }
        }
    }

    /**
     * Send auto reply message
     */
    protected function sendAutoReply(User $user, string $platform, string $recipient, MetaAutoReply $autoReply): void
    {
        try {
            $service = match ($platform) {
                'whatsapp' => new WhatsAppBusinessService(),
                'instagram' => new InstagramMessagingService(),
                'facebook' => new FacebookMessengerService(),
            };

            $response = match ($autoReply->reply_type) {
                'text' => $service->sendTextMessage($recipient, $autoReply->reply_message, $user->id),
                'template' => $service->sendTemplateMessage(
                    $recipient,
                    $autoReply->template_name,
                    $autoReply->template_data ?? [],
                    $user->id
                ),
                default => $service->sendMediaMessage(
                    $recipient,
                    $autoReply->reply_type,
                    $autoReply->media_url,
                    $autoReply->media_caption,
                    $user->id
                ),
            };

            if ($response['success']) {
                Log::info('Auto reply sent successfully', [
                    'platform' => $platform,
                    'auto_reply_id' => $autoReply->id,
                    'recipient' => $recipient,
                ]);
            } else {
                Log::error('Auto reply failed', [
                    'platform' => $platform,
                    'auto_reply_id' => $autoReply->id,
                    'error' => $response['error'] ?? 'Unknown error',
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Auto reply exception', [
                'platform' => $platform,
                'auto_reply_id' => $autoReply->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Verify webhook signature
     */
    protected function verifySignature(Request $request): bool
    {
        $signature = $request->header('X-Hub-Signature-256');

        if (!$signature) {
            return false;
        }

        $appSecret = config('meta.app_secret');
        $payload = $request->getContent();

        $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $appSecret);

        return hash_equals($expectedSignature, $signature);
    }
}
