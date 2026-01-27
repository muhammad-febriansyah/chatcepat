<?php

namespace App\Services\Telegram;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class TelegramBotApiService
{
    protected string $botToken;
    protected string $baseUrl = 'https://api.telegram.org/bot';

    public function __construct(string $botToken)
    {
        $this->botToken = $botToken;
    }

    /**
     * Send text message
     */
    public function sendMessage(string|int $chatId, string $text, array $options = []): array
    {
        return $this->makeRequest('sendMessage', array_merge([
            'chat_id' => $chatId,
            'text' => $text,
        ], $options));
    }

    /**
     * Send photo
     */
    public function sendPhoto(string|int $chatId, string $photo, ?string $caption = null, array $options = []): array
    {
        return $this->makeRequest('sendPhoto', array_merge([
            'chat_id' => $chatId,
            'photo' => $photo,
            'caption' => $caption,
        ], $options));
    }

    /**
     * Send video
     */
    public function sendVideo(string|int $chatId, string $video, ?string $caption = null, array $options = []): array
    {
        return $this->makeRequest('sendVideo', array_merge([
            'chat_id' => $chatId,
            'video' => $video,
            'caption' => $caption,
        ], $options));
    }

    /**
     * Send document/file
     */
    public function sendDocument(string|int $chatId, string $document, ?string $caption = null, array $options = []): array
    {
        return $this->makeRequest('sendDocument', array_merge([
            'chat_id' => $chatId,
            'document' => $document,
            'caption' => $caption,
        ], $options));
    }

    /**
     * Send audio
     */
    public function sendAudio(string|int $chatId, string $audio, ?string $caption = null, array $options = []): array
    {
        return $this->makeRequest('sendAudio', array_merge([
            'chat_id' => $chatId,
            'audio' => $audio,
            'caption' => $caption,
        ], $options));
    }

    /**
     * Get bot info
     */
    public function getMe(): array
    {
        return $this->makeRequest('getMe');
    }

    /**
     * Set webhook
     */
    public function setWebhook(string $url, array $options = []): array
    {
        return $this->makeRequest('setWebhook', array_merge([
            'url' => $url,
        ], $options));
    }

    /**
     * Delete webhook
     */
    public function deleteWebhook(): array
    {
        return $this->makeRequest('deleteWebhook');
    }

    /**
     * Get webhook info
     */
    public function getWebhookInfo(): array
    {
        return $this->makeRequest('getWebhookInfo');
    }

    /**
     * Make request to Telegram Bot API
     */
    protected function makeRequest(string $method, array $params = []): array
    {
        try {
            $url = $this->baseUrl . $this->botToken . '/' . $method;

            $response = Http::timeout(30)
                ->post($url, $params);

            $result = $response->json();

            if (!$result['ok'] ?? false) {
                Log::error('Telegram Bot API error', [
                    'method' => $method,
                    'error' => $result['description'] ?? 'Unknown error',
                ]);

                return [
                    'success' => false,
                    'error' => $result['description'] ?? 'Request failed',
                ];
            }

            return [
                'success' => true,
                'result' => $result['result'] ?? null,
            ];
        } catch (Exception $e) {
            Log::error('Telegram Bot API exception', [
                'method' => $method,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
