<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TelegramBot;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    /**
     * Handle incoming Telegram webhook
     */
    public function handle(Request $request, int $botId, string $secret): Response
    {
        // Find bot
        $bot = TelegramBot::find($botId);

        if (!$bot) {
            Log::warning('Telegram webhook: Bot not found', ['bot_id' => $botId]);
            return response('Bot not found', 404);
        }

        // Validate secret
        if ($bot->webhook_secret !== $secret) {
            Log::warning('Telegram webhook: Invalid secret', ['bot_id' => $botId]);
            return response('Invalid secret', 403);
        }

        // Check if bot is active
        if (!$bot->is_active) {
            Log::info('Telegram webhook: Bot is inactive', ['bot_id' => $botId]);
            return response('OK', 200);
        }

        // Validate secret token header (additional security)
        $headerSecret = $request->header('X-Telegram-Bot-Api-Secret-Token');
        if ($headerSecret && $headerSecret !== $secret) {
            Log::warning('Telegram webhook: Invalid header secret', ['bot_id' => $botId]);
            return response('Invalid secret', 403);
        }

        try {
            $update = $request->all();

            Log::debug('Telegram webhook received', [
                'bot_id' => $botId,
                'update_id' => $update['update_id'] ?? null,
            ]);

            $service = new TelegramService($bot);
            $service->processUpdate($update);

        } catch (\Exception $e) {
            Log::error('Telegram webhook error', [
                'bot_id' => $botId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        // Always return 200 to Telegram
        return response('OK', 200);
    }
}
