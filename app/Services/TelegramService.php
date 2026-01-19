<?php

namespace App\Services;

use App\Models\TelegramBot;
use App\Models\TelegramMessage;
use App\Models\TelegramContact;
use App\Models\TelegramAutoReply;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TelegramService
{
    private const API_BASE = 'https://api.telegram.org/bot';

    private string $token;
    private TelegramBot $bot;

    public function __construct(TelegramBot $bot)
    {
        $this->bot = $bot;
        $this->token = $bot->bot_token;
    }

    /**
     * Make API request to Telegram
     */
    private function request(string $method, array $params = []): array
    {
        $url = self::API_BASE . $this->token . '/' . $method;

        try {
            $response = Http::timeout(30)->post($url, $params);

            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok'] ?? false) {
                    return ['success' => true, 'result' => $data['result'] ?? null];
                }
                return ['success' => false, 'error' => $data['description'] ?? 'Unknown error'];
            }

            return ['success' => false, 'error' => 'HTTP Error: ' . $response->status()];
        } catch (\Exception $e) {
            Log::error('Telegram API Error', [
                'method' => $method,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get bot info (validate token)
     */
    public function getMe(): array
    {
        return $this->request('getMe');
    }

    /**
     * Set webhook URL
     */
    public function setWebhook(string $url, ?string $secretToken = null): array
    {
        $params = [
            'url' => $url,
            'allowed_updates' => ['message', 'edited_message', 'callback_query'],
        ];

        if ($secretToken) {
            $params['secret_token'] = $secretToken;
        }

        return $this->request('setWebhook', $params);
    }

    /**
     * Delete webhook
     */
    public function deleteWebhook(): array
    {
        return $this->request('deleteWebhook');
    }

    /**
     * Get webhook info
     */
    public function getWebhookInfo(): array
    {
        return $this->request('getWebhookInfo');
    }

    /**
     * Send text message
     */
    public function sendMessage(int|string $chatId, string $text, array $options = []): array
    {
        $params = array_merge([
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML',
        ], $options);

        $result = $this->request('sendMessage', $params);

        if ($result['success']) {
            $this->logOutgoingMessage($chatId, 'text', $text, $result['result']);
        }

        return $result;
    }

    /**
     * Send photo
     */
    public function sendPhoto(int|string $chatId, string $photo, ?string $caption = null): array
    {
        $params = [
            'chat_id' => $chatId,
            'photo' => $photo,
        ];

        if ($caption) {
            $params['caption'] = $caption;
            $params['parse_mode'] = 'HTML';
        }

        $result = $this->request('sendPhoto', $params);

        if ($result['success']) {
            $this->logOutgoingMessage($chatId, 'photo', $caption, $result['result'], ['photo_url' => $photo]);
        }

        return $result;
    }

    /**
     * Send document
     */
    public function sendDocument(int|string $chatId, string $document, ?string $caption = null): array
    {
        $params = [
            'chat_id' => $chatId,
            'document' => $document,
        ];

        if ($caption) {
            $params['caption'] = $caption;
            $params['parse_mode'] = 'HTML';
        }

        $result = $this->request('sendDocument', $params);

        if ($result['success']) {
            $this->logOutgoingMessage($chatId, 'document', $caption, $result['result'], ['document_url' => $document]);
        }

        return $result;
    }

    /**
     * Process incoming webhook update
     */
    public function processUpdate(array $update): void
    {
        $message = $update['message'] ?? $update['edited_message'] ?? null;

        if (!$message) {
            return;
        }

        // Update last webhook timestamp
        $this->bot->update(['last_webhook_at' => now()]);

        // Extract message info
        $chatId = $message['chat']['id'];
        $chatType = $message['chat']['type'] ?? 'private';
        $chatTitle = $message['chat']['title'] ?? null;
        $fromUserId = $message['from']['id'] ?? null;
        $fromUsername = $message['from']['username'] ?? null;
        $fromFirstName = $message['from']['first_name'] ?? null;
        $fromLastName = $message['from']['last_name'] ?? null;

        // Determine message type and content
        $type = 'text';
        $content = $message['text'] ?? null;
        $mediaMetadata = null;

        if (isset($message['photo'])) {
            $type = 'photo';
            $content = $message['caption'] ?? null;
            $mediaMetadata = ['photo' => end($message['photo'])];
        } elseif (isset($message['document'])) {
            $type = 'document';
            $content = $message['caption'] ?? null;
            $mediaMetadata = ['document' => $message['document']];
        } elseif (isset($message['video'])) {
            $type = 'video';
            $content = $message['caption'] ?? null;
            $mediaMetadata = ['video' => $message['video']];
        } elseif (isset($message['audio'])) {
            $type = 'audio';
            $mediaMetadata = ['audio' => $message['audio']];
        } elseif (isset($message['voice'])) {
            $type = 'voice';
            $mediaMetadata = ['voice' => $message['voice']];
        } elseif (isset($message['sticker'])) {
            $type = 'sticker';
            $mediaMetadata = ['sticker' => $message['sticker']];
        }

        // Save incoming message
        TelegramMessage::create([
            'telegram_bot_id' => $this->bot->id,
            'telegram_message_id' => $message['message_id'] ?? null,
            'chat_id' => $chatId,
            'chat_type' => $chatType,
            'chat_title' => $chatTitle,
            'from_user_id' => $fromUserId,
            'from_username' => $fromUsername,
            'from_first_name' => $fromFirstName,
            'direction' => 'incoming',
            'type' => $type,
            'content' => $content,
            'media_metadata' => $mediaMetadata,
        ]);

        // Update or create contact
        TelegramContact::updateOrCreate(
            [
                'telegram_bot_id' => $this->bot->id,
                'chat_id' => $chatId,
            ],
            [
                'chat_type' => $chatType,
                'username' => $fromUsername,
                'first_name' => $fromFirstName,
                'last_name' => $fromLastName,
                'chat_title' => $chatTitle,
                'last_message_at' => now(),
            ]
        );

        // Process auto-reply if enabled (rule-based)
        if ($this->bot->auto_reply_enabled && $content) {
            $replied = $this->processAutoReply($chatId, $content);

            // If no auto-reply matched and AI is enabled, use OpenAI
            if (!$replied && $this->bot->ai_enabled) {
                $this->processAIReply($chatId, $content, $fromUserId);
            }
        }
        // AI-only mode (no auto-reply rules, just AI)
        elseif ($this->bot->ai_enabled && $content) {
            $this->processAIReply($chatId, $content, $fromUserId);
        }
    }

    /**
     * Process auto-reply (rule-based)
     * Returns true if a reply was sent, false otherwise
     */
    private function processAutoReply(int|string $chatId, string $text): bool
    {
        $autoReplies = $this->bot->autoReplies()
            ->where('is_active', true)
            ->orderBy('priority', 'desc')
            ->get();

        foreach ($autoReplies as $autoReply) {
            if ($autoReply->matches($text)) {
                $this->sendAutoReplyResponse($chatId, $autoReply);
                return true;
            }
        }

        return false;
    }

    /**
     * Process AI reply using OpenAI
     */
    private function processAIReply(int|string $chatId, string $text, ?int $fromUserId): void
    {
        try {
            $openAI = new OpenAIService();

            // Create session key for conversation history
            $sessionKey = "telegram_{$this->bot->id}_{$chatId}_{$fromUserId}";

            // Build AI config from bot settings
            $config = [];

            if ($this->bot->ai_system_prompt) {
                $config['system_prompt'] = $this->bot->ai_system_prompt;
            }

            if ($this->bot->ai_temperature) {
                $config['temperature'] = $this->bot->ai_temperature;
            }

            if ($this->bot->ai_max_tokens) {
                $config['max_tokens'] = $this->bot->ai_max_tokens;
            }

            // Generate AI response
            $response = $openAI->generateResponse(
                $sessionKey,
                $text,
                $this->bot->ai_assistant_type ?? 'general',
                $config
            );

            // Send the response
            $result = $this->sendMessage($chatId, $response);

            // Mark as AI response
            if ($result['success']) {
                TelegramMessage::where('telegram_bot_id', $this->bot->id)
                    ->where('telegram_message_id', $result['result']['message_id'] ?? null)
                    ->update(['is_auto_reply' => true]);
            }

        } catch (\Exception $e) {
            Log::error('OpenAI Telegram reply error', [
                'bot_id' => $this->bot->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send auto-reply response
     */
    private function sendAutoReplyResponse(int|string $chatId, TelegramAutoReply $autoReply): void
    {
        switch ($autoReply->response_type) {
            case 'photo':
                if ($autoReply->response_media_url) {
                    $result = $this->sendPhoto($chatId, $autoReply->response_media_url, $autoReply->response_content);
                } else {
                    $result = $this->sendMessage($chatId, $autoReply->response_content);
                }
                break;

            case 'document':
                if ($autoReply->response_media_url) {
                    $result = $this->sendDocument($chatId, $autoReply->response_media_url, $autoReply->response_content);
                } else {
                    $result = $this->sendMessage($chatId, $autoReply->response_content);
                }
                break;

            default:
                $result = $this->sendMessage($chatId, $autoReply->response_content);
        }

        // Mark the outgoing message as auto-reply
        if ($result['success']) {
            TelegramMessage::where('telegram_bot_id', $this->bot->id)
                ->where('telegram_message_id', $result['result']['message_id'] ?? null)
                ->update(['is_auto_reply' => true]);
        }
    }

    /**
     * Log outgoing message
     */
    private function logOutgoingMessage(
        int|string $chatId,
        string $type,
        ?string $content,
        ?array $result,
        ?array $mediaMetadata = null,
        bool $isAutoReply = false
    ): void {
        TelegramMessage::create([
            'telegram_bot_id' => $this->bot->id,
            'telegram_message_id' => $result['message_id'] ?? null,
            'chat_id' => $chatId,
            'chat_type' => $result['chat']['type'] ?? 'private',
            'direction' => 'outgoing',
            'type' => $type,
            'content' => $content,
            'media_metadata' => $mediaMetadata,
            'is_auto_reply' => $isAutoReply,
        ]);
    }

    /**
     * Send broadcast to multiple chat IDs
     */
    public function broadcast(array $chatIds, string $type, string $content, ?string $mediaUrl = null): array
    {
        $results = [
            'sent' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        foreach ($chatIds as $chatId) {
            try {
                $result = match ($type) {
                    'photo' => $this->sendPhoto($chatId, $mediaUrl, $content),
                    'document' => $this->sendDocument($chatId, $mediaUrl, $content),
                    default => $this->sendMessage($chatId, $content),
                };

                if ($result['success']) {
                    $results['sent']++;
                } else {
                    $results['failed']++;
                    $results['errors'][$chatId] = $result['error'];
                }

                // Rate limiting: wait between messages
                usleep(100000); // 100ms delay

            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][$chatId] = $e->getMessage();
            }
        }

        return $results;
    }
}
