<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TelegramBot;
use App\Models\TelegramAutoReply;
use App\Models\AiAssistantType;
use App\Services\TelegramService;
use App\Services\OpenAIService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TelegramBotController extends Controller
{
    /**
     * Display list of user's Telegram bots
     */
    public function index(): Response
    {
        $user = auth()->user();

        $bots = TelegramBot::where('user_id', $user->id)
            ->withCount(['contacts', 'messages', 'autoReplies'])
            ->latest()
            ->get()
            ->map(function ($bot) {
                return [
                    'id' => $bot->id,
                    'bot_username' => $bot->bot_username,
                    'bot_first_name' => $bot->bot_first_name,
                    'is_active' => $bot->is_active,
                    'auto_reply_enabled' => $bot->auto_reply_enabled,
                    'ai_enabled' => $bot->ai_enabled,
                    'ai_assistant_type' => $bot->ai_assistant_type,
                    'contacts_count' => $bot->contacts_count,
                    'messages_count' => $bot->messages_count,
                    'auto_replies_count' => $bot->auto_replies_count,
                    'last_webhook_at' => $bot->last_webhook_at?->diffForHumans(),
                    'created_at' => $bot->created_at->format('d M Y'),
                ];
            });

        return Inertia::render('user/telegram/index', [
            'bots' => $bots,
            'aiAssistantTypes' => OpenAIService::getAssistantTypes(),
        ]);
    }

    /**
     * Store new Telegram bot
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bot_token' => 'required|string|max:100',
        ], [
            'bot_token.required' => 'Token bot wajib diisi.',
            'bot_token.max' => 'Token bot terlalu panjang.',
        ]);

        $user = auth()->user();

        // Check if bot already exists
        $existingBot = TelegramBot::where('user_id', $user->id)
            ->where('bot_token', $validated['bot_token'])
            ->first();

        if ($existingBot) {
            return redirect()->back()->with('error', 'Bot dengan token ini sudah terdaftar.');
        }

        // Create temporary bot to validate token
        $bot = new TelegramBot([
            'user_id' => $user->id,
            'bot_token' => $validated['bot_token'],
        ]);

        $service = new TelegramService($bot);
        $result = $service->getMe();

        if (!$result['success']) {
            return redirect()->back()->with('error', 'Token tidak valid: ' . ($result['error'] ?? 'Unknown error'));
        }

        $botInfo = $result['result'];

        // Save bot
        $bot->fill([
            'bot_id' => $botInfo['id'],
            'bot_username' => $botInfo['username'] ?? null,
            'bot_first_name' => $botInfo['first_name'] ?? null,
        ]);
        $bot->save();

        // Setup webhook
        $webhookResult = $service->setWebhook($bot->webhook_url, $bot->webhook_secret);

        if (!$webhookResult['success']) {
            Log::warning('Failed to set webhook for bot', [
                'bot_id' => $bot->id,
                'error' => $webhookResult['error'],
            ]);
        }

        return redirect()->back()->with('success', "Bot @{$bot->bot_username} berhasil ditambahkan!");
    }

    /**
     * Toggle bot active status
     */
    public function toggleActive(TelegramBot $telegramBot): RedirectResponse
    {
        if ($telegramBot->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke bot ini.');
        }

        $telegramBot->update(['is_active' => !$telegramBot->is_active]);

        $status = $telegramBot->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Bot berhasil {$status}.");
    }

    /**
     * Toggle auto-reply
     */
    public function toggleAutoReply(TelegramBot $telegramBot): RedirectResponse
    {
        if ($telegramBot->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke bot ini.');
        }

        $telegramBot->update(['auto_reply_enabled' => !$telegramBot->auto_reply_enabled]);

        $status = $telegramBot->auto_reply_enabled ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Auto-reply berhasil {$status}.");
    }

    /**
     * Toggle AI
     */
    public function toggleAI(TelegramBot $telegramBot): RedirectResponse
    {
        if ($telegramBot->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke bot ini.');
        }

        $telegramBot->update(['ai_enabled' => !$telegramBot->ai_enabled]);

        $status = $telegramBot->ai_enabled ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "AI Chatbot berhasil {$status}.");
    }

    /**
     * Update AI settings
     */
    public function updateAISettings(Request $request, TelegramBot $telegramBot): JsonResponse
    {
        if ($telegramBot->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get valid assistant type codes from database
        $validCodes = AiAssistantType::where('is_active', true)->pluck('code')->toArray();

        $validated = $request->validate([
            'ai_assistant_type' => ['required', 'string', Rule::in($validCodes)],
            'ai_system_prompt' => 'nullable|string|max:2000',
            'ai_temperature' => 'nullable|numeric|min:0|max:2',
            'ai_max_tokens' => 'nullable|integer|min:50|max:4000',
        ]);

        $telegramBot->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'AI settings berhasil diperbarui.',
        ]);
    }

    /**
     * Delete bot
     */
    public function destroy(TelegramBot $telegramBot): RedirectResponse
    {
        if ($telegramBot->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke bot ini.');
        }

        // Remove webhook
        $service = new TelegramService($telegramBot);
        $service->deleteWebhook();

        $username = $telegramBot->bot_username;
        $telegramBot->delete();

        return redirect()->back()->with('success', "Bot @{$username} berhasil dihapus.");
    }

    /**
     * Show auto-reply settings for a bot
     */
    public function autoReplies(TelegramBot $telegramBot): Response
    {
        if ($telegramBot->user_id !== auth()->id()) {
            abort(403);
        }

        $autoReplies = $telegramBot->autoReplies()
            ->orderBy('priority', 'desc')
            ->get();

        return Inertia::render('user/telegram/auto-replies', [
            'bot' => [
                'id' => $telegramBot->id,
                'bot_username' => $telegramBot->bot_username,
                'auto_reply_enabled' => $telegramBot->auto_reply_enabled,
            ],
            'autoReplies' => $autoReplies,
        ]);
    }

    /**
     * Store auto-reply rule
     */
    public function storeAutoReply(Request $request, TelegramBot $telegramBot): RedirectResponse
    {
        if ($telegramBot->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke bot ini.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'trigger_type' => 'required|in:exact,contains,starts_with,regex,all',
            'trigger_value' => 'nullable|required_unless:trigger_type,all|string|max:500',
            'response_type' => 'required|in:text,photo,document',
            'response_content' => 'required|string',
            'response_media_url' => 'nullable|url|max:500',
            'priority' => 'nullable|integer|min:0|max:100',
        ], [
            'name.required' => 'Nama rule wajib diisi.',
            'trigger_type.required' => 'Tipe trigger wajib dipilih.',
            'trigger_value.required_unless' => 'Nilai trigger wajib diisi.',
            'response_content.required' => 'Konten respon wajib diisi.',
        ]);

        $telegramBot->autoReplies()->create($validated);

        return redirect()->back()->with('success', 'Auto-reply berhasil ditambahkan.');
    }

    /**
     * Update auto-reply rule
     */
    public function updateAutoReply(Request $request, TelegramBot $telegramBot, TelegramAutoReply $autoReply): RedirectResponse
    {
        if ($telegramBot->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke bot ini.');
        }

        if ($autoReply->telegram_bot_id !== $telegramBot->id) {
            return redirect()->back()->with('error', 'Auto-reply tidak ditemukan.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'trigger_type' => 'required|in:exact,contains,starts_with,regex,all',
            'trigger_value' => 'nullable|required_unless:trigger_type,all|string|max:500',
            'response_type' => 'required|in:text,photo,document',
            'response_content' => 'required|string',
            'response_media_url' => 'nullable|url|max:500',
            'priority' => 'nullable|integer|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        $autoReply->update($validated);

        return redirect()->back()->with('success', 'Auto-reply berhasil diperbarui.');
    }

    /**
     * Delete auto-reply rule
     */
    public function destroyAutoReply(TelegramBot $telegramBot, TelegramAutoReply $autoReply): RedirectResponse
    {
        if ($telegramBot->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke bot ini.');
        }

        if ($autoReply->telegram_bot_id !== $telegramBot->id) {
            return redirect()->back()->with('error', 'Auto-reply tidak ditemukan.');
        }

        $autoReply->delete();

        return redirect()->back()->with('success', 'Auto-reply berhasil dihapus.');
    }

    /**
     * Get contacts for a bot (for broadcast recipient selection)
     */
    public function contacts(TelegramBot $telegramBot): JsonResponse
    {
        if ($telegramBot->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $contacts = $telegramBot->contacts()
            ->where('is_blocked', false)
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'chat_id' => $contact->chat_id,
                    'display_name' => $contact->display_name,
                    'username' => $contact->username,
                    'chat_type' => $contact->chat_type,
                    'last_message_at' => $contact->last_message_at?->diffForHumans(),
                ];
            });

        return response()->json(['contacts' => $contacts]);
    }
}
