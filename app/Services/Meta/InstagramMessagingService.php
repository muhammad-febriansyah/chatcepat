<?php

namespace App\Services\Meta;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\MetaInstagramMessage;

class InstagramMessagingService
{
    protected string $baseUrl;
    protected string $igAccountId;
    protected string $accessToken;
    protected string $apiVersion;

    public function __construct()
    {
        $this->baseUrl = config('meta.instagram.base_url');
        $this->apiVersion = config('meta.instagram.api_version');
        $this->igAccountId = config('meta.instagram.account_id');
        $this->accessToken = config('meta.access_token');
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
            ]
        ];

        $response = $this->sendRequest($payload);

        if ($userId) {
            $this->saveMessage($userId, $response, $recipientId, 'text', $message, 'outbound');
        }

        return $response;
    }

    /**
     * Send media message (image, video, audio)
     */
    public function sendMediaMessage(string $recipientId, string $type, string $mediaUrl, ?int $userId = null): array
    {
        $payload = [
            'recipient' => [
                'id' => $recipientId
            ],
            'message' => [
                'attachment' => [
                    'type' => $type,
                    'payload' => [
                        'url' => $mediaUrl
                    ]
                ]
            ]
        ];

        $response = $this->sendRequest($payload);

        if ($userId) {
            $media = ['url' => $mediaUrl, 'type' => $type];
            $this->saveMessage($userId, $response, $recipientId, $type, null, 'outbound', $media);
        }

        return $response;
    }

    /**
     * Send generic template
     */
    public function sendGenericTemplate(string $recipientId, array $elements, ?int $userId = null): array
    {
        $payload = [
            'recipient' => [
                'id' => $recipientId
            ],
            'message' => [
                'attachment' => [
                    'type' => 'template',
                    'payload' => [
                        'template_type' => 'generic',
                        'elements' => $elements
                    ]
                ]
            ]
        ];

        $response = $this->sendRequest($payload);

        if ($userId) {
            $this->saveMessage($userId, $response, $recipientId, 'template', json_encode($elements), 'outbound');
        }

        return $response;
    }

    /**
     * Send HTTP request to Instagram API
     */
    protected function sendRequest(array $payload): array
    {
        try {
            $url = "{$this->baseUrl}/{$this->apiVersion}/{$this->igAccountId}/messages";

            $response = Http::withToken($this->accessToken)
                ->post($url, $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'message_id' => $response->json('message_id')
                ];
            }

            Log::error('Instagram API Error', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json('error.message', 'Failed to send message'),
                'code' => $response->json('error.code')
            ];

        } catch (\Exception $e) {
            Log::error('Instagram API Exception', [
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
    protected function saveMessage(int $userId, array $response, string $to, string $type, ?string $content, string $direction, ?array $media = null): void
    {
        if ($response['success']) {
            MetaInstagramMessage::create([
                'user_id' => $userId,
                'message_id' => $response['message_id'] ?? uniqid('ig_msg_'),
                'ig_message_id' => $response['message_id'] ?? null,
                'from' => $this->igAccountId,
                'to' => $to,
                'instagram_account_id' => $this->igAccountId,
                'type' => $type,
                'direction' => $direction,
                'content' => $content,
                'media' => $media ? json_encode($media) : null,
                'status' => 'sent',
                'sent_at' => now()
            ]);
        }
    }
}
