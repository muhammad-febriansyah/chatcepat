<?php

namespace App\Services\Meta;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\MetaFacebookMessage;

class FacebookMessengerService
{
    protected string $baseUrl;
    protected string $pageId;
    protected string $pageAccessToken;
    protected string $apiVersion;

    public function __construct()
    {
        $this->baseUrl = config('meta.facebook.base_url');
        $this->apiVersion = config('meta.facebook.api_version');
        $this->pageId = config('meta.facebook.page_id');
        $this->pageAccessToken = config('meta.facebook.page_access_token');
    }

    /**
     * Send text message
     */
    public function sendTextMessage(string $recipientId, string $message, ?int $userId = null): array
    {
        $payload = [
            'recipient' => [
                'id' => $recipientId
            ],
            'message' => [
                'text' => $message
            ],
            'messaging_type' => 'RESPONSE'
        ];

        $response = $this->sendRequest($payload);

        if ($userId) {
            $this->saveMessage($userId, $response, $recipientId, 'text', $message, 'outbound');
        }

        return $response;
    }

    /**
     * Send attachment (image, video, audio, file)
     */
    public function sendAttachment(string $recipientId, string $type, string $url, ?int $userId = null): array
    {
        $payload = [
            'recipient' => [
                'id' => $recipientId
            ],
            'message' => [
                'attachment' => [
                    'type' => $type,
                    'payload' => [
                        'url' => $url,
                        'is_reusable' => true
                    ]
                ]
            ],
            'messaging_type' => 'RESPONSE'
        ];

        $response = $this->sendRequest($payload);

        if ($userId) {
            $attachments = [['type' => $type, 'url' => $url]];
            $this->saveMessage($userId, $response, $recipientId, 'attachment', null, 'outbound', $attachments);
        }

        return $response;
    }

    /**
     * Send quick replies
     */
    public function sendQuickReplies(string $recipientId, string $text, array $quickReplies, ?int $userId = null): array
    {
        $payload = [
            'recipient' => [
                'id' => $recipientId
            ],
            'message' => [
                'text' => $text,
                'quick_replies' => $quickReplies
            ],
            'messaging_type' => 'RESPONSE'
        ];

        $response = $this->sendRequest($payload);

        if ($userId) {
            $this->saveMessage($userId, $response, $recipientId, 'quick_reply', $text, 'outbound', null, $quickReplies);
        }

        return $response;
    }

    /**
     * Send button template
     */
    public function sendButtonTemplate(string $recipientId, string $text, array $buttons, ?int $userId = null): array
    {
        $payload = [
            'recipient' => [
                'id' => $recipientId
            ],
            'message' => [
                'attachment' => [
                    'type' => 'template',
                    'payload' => [
                        'template_type' => 'button',
                        'text' => $text,
                        'buttons' => $buttons
                    ]
                ]
            ],
            'messaging_type' => 'RESPONSE'
        ];

        $response = $this->sendRequest($payload);

        if ($userId) {
            $metadata = ['text' => $text, 'buttons' => $buttons];
            $this->saveMessage($userId, $response, $recipientId, 'template', json_encode($metadata), 'outbound');
        }

        return $response;
    }

    /**
     * Send HTTP request to Messenger API
     */
    protected function sendRequest(array $payload): array
    {
        try {
            $url = "{$this->baseUrl}/{$this->apiVersion}/me/messages";

            $response = Http::withToken($this->pageAccessToken)
                ->post($url, $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'message_id' => $response->json('message_id'),
                    'recipient_id' => $response->json('recipient_id')
                ];
            }

            Log::error('Facebook Messenger API Error', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json('error.message', 'Failed to send message'),
                'code' => $response->json('error.code')
            ];

        } catch (\Exception $e) {
            Log::error('Facebook Messenger API Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Save message to database
     */
    protected function saveMessage(int $userId, array $response, string $to, string $type, ?string $content, string $direction, ?array $attachments = null, ?array $quickReplies = null): void
    {
        if ($response['success']) {
            MetaFacebookMessage::create([
                'user_id' => $userId,
                'message_id' => $response['message_id'] ?? uniqid('fb_msg_'),
                'fb_message_id' => $response['message_id'] ?? null,
                'from' => $this->pageId,
                'to' => $to,
                'page_id' => $this->pageId,
                'type' => $type,
                'direction' => $direction,
                'content' => $content,
                'attachments' => $attachments ? json_encode($attachments) : null,
                'quick_replies' => $quickReplies ? json_encode($quickReplies) : null,
                'status' => 'sent',
                'sent_at' => now()
            ]);
        }
    }
}
