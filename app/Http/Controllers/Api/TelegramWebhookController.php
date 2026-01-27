<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TelegramBot;
use App\Models\TelegramContact;
use App\Models\TelegramMessage;
use App\Models\TelegramAutoReply;
use App\Services\Telegram\TelegramBotApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    /**
     * Handle incoming webhook from Telegram
     */
    public function handle(Request $request, int $botId)
    {
        $bot = TelegramBot::find($botId);

        if (!$bot || !$bot->is_active) {
            return response()->json(['ok' => false], 404);
        }

        $update = $request->all();
        Log::info('Telegram webhook received', ['bot_id' => $botId, 'update' => $update]);

        // Handle different update types
        if (isset($update['message'])) {
            $this->handleMessage($bot, $update['message']);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Handle incoming message
     */
    protected function handleMessage(TelegramBot $bot, array $message): void
    {
        try {
            $from = $message['from'] ?? [];
            $chat = $message['chat'] ?? [];

            // Save or update contact
            $contact = TelegramContact::updateOrCreate(
                [
                    'user_id' => $bot->user_id,
                    'telegram_bot_id' => $bot->id,
                    'telegram_id' => $from['id'] ?? null,
                ],
                [
                    'username' => $from['username'] ?? null,
                    'first_name' => $from['first_name'] ?? null,
                    'last_name' => $from['last_name'] ?? null,
                    'is_bot' => $from['is_bot'] ?? false,
                    'is_verified' => $from['is_verified'] ?? false,
                    'is_premium' => $from['is_premium'] ?? false,
                    'last_interaction_at' => now(),
                ]
            );

            // Determine message type and content
            $type = 'text';
            $content = $message['text'] ?? null;
            $fileUrl = null;

            if (isset($message['photo'])) {
                $type = 'photo';
                $content = $message['caption'] ?? null;
            } elseif (isset($message['video'])) {
                $type = 'video';
                $content = $message['caption'] ?? null;
            } elseif (isset($message['document'])) {
                $type = 'document';
                $content = $message['caption'] ?? null;
            } elseif (isset($message['audio'])) {
                $type = 'audio';
            } elseif (isset($message['voice'])) {
                $type = 'voice';
            }

            // Save incoming message
            $telegramMessage = TelegramMessage::create([
                'user_id' => $bot->user_id,
                'telegram_bot_id' => $bot->id,
                'telegram_contact_id' => $contact->id,
                'message_id' => $message['message_id'] ?? null,
                'chat_id' => $chat['id'] ?? null,
                'direction' => 'inbound',
                'type' => $type,
                'content' => $content,
                'file_url' => $fileUrl,
                'metadata' => $message,
                'status' => 'delivered',
                'delivered_at' => now(),
            ]);

            $bot->touchActivity();

            // Check for auto reply
            if ($bot->auto_reply_enabled && $content) {
                $this->processAutoReply($bot, $contact, $content, $chat['id'] ?? null);
            }
        } catch (\Exception $e) {
            Log::error('Error handling Telegram message', [
                'bot_id' => $bot->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Process auto reply for incoming message
     */
    protected function processAutoReply(TelegramBot $bot, TelegramContact $contact, string $messageText, ?string $chatId): void
    {
        if (!$chatId) {
            return;
        }

        // Get active auto replies ordered by priority
        $autoReplies = TelegramAutoReply::where('telegram_bot_id', $bot->id)
            ->active()
            ->get();

        foreach ($autoReplies as $autoReply) {
            if ($autoReply->matches($messageText)) {
                try {
                    $botApi = new TelegramBotApiService($bot->token);

                    // Send auto reply based on type
                    $result = match ($autoReply->reply_type) {
                        'text' => $botApi->sendMessage($chatId, $autoReply->reply_content),
                        'photo' => $botApi->sendPhoto($chatId, url($autoReply->reply_file_url), $autoReply->reply_content),
                        'video' => $botApi->sendVideo($chatId, url($autoReply->reply_file_url), $autoReply->reply_content),
                        'document' => $botApi->sendDocument($chatId, url($autoReply->reply_file_url), $autoReply->reply_content),
                    };

                    if ($result['success'] ?? false) {
                        // Save outbound message
                        TelegramMessage::create([
                            'user_id' => $bot->user_id,
                            'telegram_bot_id' => $bot->id,
                            'telegram_contact_id' => $contact->id,
                            'message_id' => $result['result']['message_id'] ?? null,
                            'chat_id' => $chatId,
                            'direction' => 'outbound',
                            'type' => $autoReply->reply_type,
                            'content' => $autoReply->reply_content,
                            'file_url' => $autoReply->reply_file_url,
                            'status' => 'sent',
                            'sent_at' => now(),
                        ]);

                        $autoReply->incrementUsage();
                    }

                    // Only use first matching auto reply
                    break;
                } catch (\Exception $e) {
                    Log::error('Error sending auto reply', [
                        'auto_reply_id' => $autoReply->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }
    }
}
