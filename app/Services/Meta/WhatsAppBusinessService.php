<?php

namespace App\Services\Meta;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\MetaWhatsappMessage;

class WhatsAppBusinessService
{
    protected string $baseUrl;
    protected string $phoneNumberId;
    protected string $accessToken;
    protected string $apiVersion;

    public function __construct()
    {
        $this->baseUrl = config('meta.whatsapp.base_url');
        $this->apiVersion = config('meta.whatsapp.api_version');
        $this->phoneNumberId = config('meta.whatsapp.phone_number_id');
        $this->accessToken = config('meta.access_token');
    }

    /**
     * Send text message
     */
    public function sendTextMessage(string $to, string $message, ?int $userId = null): array
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $to,
            'type' => 'text',
            'text' => [
                'preview_url' => false,
                'body' => $message
            ]
        ];

        $response = $this->sendRequest($payload);

        if ($userId) {
            $this->saveMessage($userId, $response, $to, 'text', $message, 'outbound');
        }

        return $response;
    }

    /**
     * Send template message
     */
    public function sendTemplateMessage(string $to, string $templateName, array $components = [], ?int $userId = null): array
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'to' => $to,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => [
                    'code' => 'id'
                ],
                'components' => $components
            ]
        ];

        $response = $this->sendRequest($payload);

        if ($userId) {
            $this->saveMessage($userId, $response, $to, 'template', json_encode($components), 'outbound');
        }

        return $response;
    }

    /**
     * Send media message (image, video, document)
     */
    public function sendMediaMessage(string $to, string $type, string $mediaUrl, ?string $caption = null, ?int $userId = null): array
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $to,
            'type' => $type,
            $type => [
                'link' => $mediaUrl
            ]
        ];

        if ($caption && in_array($type, ['image', 'video', 'document'])) {
            $payload[$type]['caption'] = $caption;
        }

        $response = $this->sendRequest($payload);

        if ($userId) {
            $media = ['url' => $mediaUrl, 'caption' => $caption];
            $this->saveMessage($userId, $response, $to, $type, $caption, 'outbound', $media);
        }

        return $response;
    }

    /**
     * Mark message as read
     */
    public function markAsRead(string $messageId): array
    {
        $payload = [
            'messaging_product' => 'whatsapp',
            'status' => 'read',
            'message_id' => $messageId
        ];

        return $this->sendRequest($payload);
    }

    /**
     * Send HTTP request to WhatsApp API
     */
    protected function sendRequest(array $payload): array
    {
        try {
            $url = "{$this->baseUrl}/{$this->apiVersion}/{$this->phoneNumberId}/messages";

            $response = Http::withToken($this->accessToken)
                ->post($url, $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'message_id' => $response->json('messages.0.id')
                ];
            }

            Log::error('WhatsApp API Error', [
                'status' => $response->status(),
                'body' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json('error.message', 'Failed to send message'),
                'code' => $response->json('error.code')
            ];

        } catch (\Exception $e) {
            Log::error('WhatsApp API Exception', [
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
            MetaWhatsappMessage::create([
                'user_id' => $userId,
                'message_id' => $response['message_id'] ?? uniqid('msg_'),
                'wamid' => $response['data']['messages'][0]['id'] ?? null,
                'from' => $this->phoneNumberId,
                'to' => $to,
                'phone_number_id' => $this->phoneNumberId,
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
