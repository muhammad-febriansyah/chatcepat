<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TelegramBot;
use App\Models\TelegramContact;
use App\Models\TelegramMessage;
use App\Services\Telegram\TelegramBotApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TelegramMessageController extends Controller
{
    /**
     * Show send message page
     */
    public function index()
    {
        $bots = auth()->user()->telegramBots()->where('is_active', true)->get();
        $contacts = auth()->user()->telegramContacts()->latest()->limit(50)->get();
        $messages = auth()->user()->telegramMessages()
            ->with(['telegramBot', 'telegramContact'])
            ->latest()
            ->limit(50)
            ->get();

        return Inertia::render('user/telegram/messages/index', [
            'bots' => $bots,
            'contacts' => $contacts,
            'messages' => $messages,
        ]);
    }

    /**
     * Send text message
     */
    public function sendText(Request $request)
    {
        $request->validate([
            'bot_id' => 'required|exists:telegram_bots,id',
            'chat_id' => 'required|string',
            'message' => 'required|string',
        ]);

        $bot = TelegramBot::findOrFail($request->bot_id);
        $this->authorize('update', $bot);

        $botApi = new TelegramBotApiService($bot->token);
        $result = $botApi->sendMessage($request->chat_id, $request->message);

        if (!($result['success'] ?? false)) {
            return back()->withErrors(['message' => $result['error'] ?? 'Failed to send message']);
        }

        // Save to database
        $message = TelegramMessage::create([
            'user_id' => auth()->id(),
            'telegram_bot_id' => $bot->id,
            'chat_id' => $request->chat_id,
            'message_id' => $result['result']['message_id'] ?? null,
            'direction' => 'outbound',
            'type' => 'text',
            'content' => $request->message,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $bot->touchActivity();

        return back()->with('success', 'Message sent successfully');
    }

    /**
     * Send file (photo, video, document)
     */
    public function sendFile(Request $request)
    {
        $request->validate([
            'bot_id' => 'required|exists:telegram_bots,id',
            'chat_id' => 'required|string',
            'file' => 'required|file|max:51200', // max 50MB
            'type' => 'required|in:photo,video,document',
            'caption' => 'nullable|string',
        ]);

        $bot = TelegramBot::findOrFail($request->bot_id);
        $this->authorize('update', $bot);

        // Upload file
        $file = $request->file('file');
        $path = $file->store('telegram/files', 'public');
        $fileUrl = Storage::url($path);
        $fullUrl = url($fileUrl);

        // Send via Telegram Bot API
        $botApi = new TelegramBotApiService($bot->token);

        $result = match ($request->type) {
            'photo' => $botApi->sendPhoto($request->chat_id, $fullUrl, $request->caption),
            'video' => $botApi->sendVideo($request->chat_id, $fullUrl, $request->caption),
            'document' => $botApi->sendDocument($request->chat_id, $fullUrl, $request->caption),
            default => ['success' => false, 'error' => 'Invalid file type'],
        };

        if (!($result['success'] ?? false)) {
            Storage::disk('public')->delete($path);
            return back()->withErrors(['file' => $result['error'] ?? 'Failed to send file']);
        }

        // Save to database
        $message = TelegramMessage::create([
            'user_id' => auth()->id(),
            'telegram_bot_id' => $bot->id,
            'chat_id' => $request->chat_id,
            'message_id' => $result['result']['message_id'] ?? null,
            'direction' => 'outbound',
            'type' => $request->type,
            'content' => $request->caption,
            'file_url' => $fileUrl,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $bot->touchActivity();

        return back()->with('success', ucfirst($request->type) . ' sent successfully');
    }

    /**
     * Get messages for specific chat
     */
    public function getChat(Request $request, TelegramBot $bot, string $chatId)
    {
        $this->authorize('view', $bot);

        $messages = TelegramMessage::where('telegram_bot_id', $bot->id)
            ->where('chat_id', $chatId)
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($messages);
    }
}
